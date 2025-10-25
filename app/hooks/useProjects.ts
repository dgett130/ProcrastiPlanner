import useSWR from 'swr';

export type Idea = {
  text: string;
  createdAt: string;
};

export type Project = {
  _id: string;
  name: string;
  ideas?: Idea[];
};

const fetcher = async (url: string): Promise<Project[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
};

export function useProjects() {
  const { data, error, isValidating, mutate } = useSWR<Project[]>('/api/projects', fetcher);

  return {
    projects: data ?? [],
    loading: (!data && !error) || isValidating,
    error,
    refresh: () => mutate(),
  };
}
