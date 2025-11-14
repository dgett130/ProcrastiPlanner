import useSWR, {mutate} from 'swr';
import {fetcher as baseFetcher} from "@/lib/fetcher";
import {useCallback, useState} from 'react';
import {readToken} from './useAuth';

export type Idea = {
    text: string;
    createdAt: string;
};

export type Project = {
    _id: string;
    name: string;
    description?: string;
    technologies?: string[];
    functionality?: string[];
    ideas?: Idea[];
    createdAt: string;
    updatedAt: string;
};


const fetcher = async (url: string): Promise<Project[]> => {
    console.log('🔵 Fetching projects from:', url);

    const response = await baseFetcher<{ success: boolean; data: Project[] }>(url);

    console.log('📦 Response:', response);
    console.log('📦 Projects data:', response.data);

    return response.data; // ⬅️ AGGIUNTO IL RETURN!
}

export function useProjects() {

    const [isCreating, setIsCreating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const {data, error, isValidating, mutate} = useSWR<Project[]>('/api/projects', fetcher);

    const createProject = useCallback(
        async (projectData: {
            name: string;
            description?: string;
            technologies?: string[];
            functionality?: string[];
        }) => {
            setIsCreating(true);
            setCreateError(null);

            try {
                const token = readToken();
                const response = await fetch(
                    '/api/projects',
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            ...(token ? {Authorization: `Bearer ${token}`} : {}),
                        },
                        body: JSON.stringify(projectData),
                    });

                if (!response.ok) {
                    let errorMessage = 'Errore durante la creazione del progetto';
                    try {
                        const errorData = await response.json();
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        }
                    } catch {
                    }
                    throw new Error(errorMessage);
                }

                const newProject: Project = await response.json();

                // Aggiorna la cache di SWR con il nuovo progetto
                await mutate();

                return newProject;
            } catch
                (err) {
                const message = err instanceof Error ? error.message : 'Errore durante la creazione del progetto';
                setCreateError(message);
                throw err;
            } finally {
                setIsCreating(false);
            }
        },
        [mutate]
    );

    const deleteProject = useCallback(
        async (projectId: string) => {
            console.log('🗑️ Deleting project with ID:', projectId);
            setIsDeleting(true);
            setDeleteError(null);

            try {
                const token = readToken();
                const response = await fetch(
                    `/api/projects/${projectId}`,
                    {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            ...(token ? {Authorization: `Bearer ${token}`} : {}),
                        }
                    });

                if (!response.ok) {
                    let errorMessage = 'Errore durante l\'eliminazione del progetto';
                    try {
                        const errorData = await response.json();
                        if (errorData.message) {
                            errorMessage = errorData.message;
                        }
                        throw new Error(errorMessage);
                    } catch (err) {
                    }
                }

                await mutate();
                return;
            } catch (err) {
                const message = err instanceof Error ? error.message : 'Errore durante l\'eliminazione del progetto';
                setCreateError(message);
                throw err;
            } finally {
                setIsDeleting(false);
            }
        },
        [mutate]
    )


    return {
        projects: data ?? [],
        loading: (!data && !error) || isValidating,
        error,
        refresh: () => mutate(),
        createProject,
        deleteProject,
        isCreating,
        isDeleting,
        createError,
        deleteError,
    };
}
