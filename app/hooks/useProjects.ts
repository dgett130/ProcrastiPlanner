import useSWR from 'swr';
import { fetcher as baseFetcher } from "@/lib/fetcher";

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

  const response = await baseFetcher<{ success: boolean; data: Project[]}>(url);

  console.log('📦 Response:', response);
  console.log('📦 Projects data:', response.data);

  return response.data; // ⬅️ AGGIUNTO IL RETURN!
}

export function useProjects() {

  const { data, error, isValidating, mutate } = useSWR<Project[]>('/api/projects', fetcher);

  return {
    projects: data ?? [],
    loading: (!data && !error) || isValidating,
    error,
    refresh: () => mutate(),
  };
}
