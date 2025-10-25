import type { FC } from 'react';

type Idea = {
  text: string;
  createdAt: string;
};

type Project = {
  _id: string;
  name: string;
  ideas?: Idea[];
};

export type ProjectItemProps = {
  project: Project;
};

export const ProjectItem: FC<ProjectItemProps> = ({ project }) => {
  const ideaCount = project.ideas?.length ?? 0;

  return (
    <li
      className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      tabIndex={0}
      aria-labelledby={`project-${project._id}-name`}
      aria-describedby={ideaCount ? `project-${project._id}-ideas` : undefined}
    >
      <div className="flex items-start justify-between gap-3" aria-live="polite">
        <span id={`project-${project._id}-name`} className="text-base font-semibold text-slate-900">
          {project.name}
        </span>
      </div>

      {ideaCount ? (
        <ul
          id={`project-${project._id}-ideas`}
          className="ml-5 list-disc text-sm text-slate-600"
          aria-label={`${ideaCount} idee collegate`}
        >
          {project.ideas?.map((idea, index) => (
            <li key={`${project._id}-idea-${index}`} className="leading-relaxed">
              <span className="sr-only">Idea:</span>
              <span>{idea.text}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Nessuna idea registrata.</p>
      )}
    </li>
  );
};
