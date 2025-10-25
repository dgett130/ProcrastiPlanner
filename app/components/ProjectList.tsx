import { useProjects } from '../hooks/useProjects';
import { ProjectItem } from './ProjectItem';

export function ProjectList() {
  const { projects, loading } = useProjects();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!projects.length) {
    return <div>No projects found.</div>;
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <ProjectItem key={project._id} project={project} />
      ))}
    </ul>
  );
}
