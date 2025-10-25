'use client';

import { FormEvent, useMemo, useState } from 'react';

export type Idea = {
  text: string;
  createdAt: string;
};

type IdeaBoardProps = {
  ideas: Idea[];
  onAdd?: (text: string) => void;
  onEdit?: (idx: number, text: string) => void;
  onRemove?: (idx: number) => void;
};

export function IdeaBoard({ ideas, onAdd, onEdit, onRemove }: IdeaBoardProps) {
  const [draftIdea, setDraftIdea] = useState('');

  const ideaSummary = useMemo(() => {
    const total = ideas.length;
    if (total === 0) {
      return { total, latestText: '', latestDate: '' };
    }

    const latest = ideas[ideas.length - 1];
    const latestDate = new Date(latest.createdAt);

    return {
      total,
      latestText: latest.text,
      latestDate: Number.isNaN(latestDate.getTime())
        ? latest.createdAt
        : latestDate.toLocaleString(),
    };
  }, [ideas]);

  const recentIdeaBuckets = useMemo(() => {
    const counts = new Map<string, number>();
    ideas.forEach((idea) => {
      const day = new Date(idea.createdAt);
      const key = Number.isNaN(day.getTime())
        ? 'Unknown date'
        : day.toLocaleDateString();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const entries = Array.from(counts.entries());
    entries.sort((a, b) => {
      if (a[0] === 'Unknown date') return 1;
      if (b[0] === 'Unknown date') return -1;
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    return entries.slice(-5);
  }, [ideas]);

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!onAdd) {
      return;
    }

    const trimmed = draftIdea.trim();
    if (!trimmed) {
      return;
    }

    onAdd(trimmed);
    setDraftIdea('');
  };

  const handleEdit = (idx: number) => {
    if (!onEdit) {
      return;
    }

    const current = ideas[idx];
    const suggestion = window.prompt('Modifica idea:', current.text);
    if (suggestion && suggestion.trim()) {
      onEdit(idx, suggestion.trim());
    }
  };

  const handleRemove = (idx: number) => {
    if (!onRemove) {
      return;
    }
    const confirmation = window.confirm('Vuoi rimuovere questa idea?');
    if (confirmation) {
      onRemove(idx);
    }
  };

  return (
    <section
      aria-label="Bacheca idee"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <header className="mb-4 flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-900">Idea Board</h2>
        <p className="text-sm text-slate-500">
          Aggiungi, modifica o rimuovi idee. Le callback gestiscono la logica.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div>
          {onAdd && (
            <form
              onSubmit={handleAdd}
              className="mb-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center"
            >
              <label className="flex-1 text-sm font-medium text-slate-700">
                <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">
                  Nuova idea
                </span>
                <input
                  type="text"
                  name="idea"
                  value={draftIdea}
                  onChange={(event) => setDraftIdea(event.target.value)}
                  placeholder="Es. Analisi nuove feature..."
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-200"
                  aria-label="Testo della nuova idea"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
              >
                Aggiungi
              </button>
            </form>
          )}

          <ul className="space-y-3" role="list">
            {ideas.map((idea, index) => (
              <li
                key={`${idea.createdAt}-${index}`}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 focus-within:border-indigo-400 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {idea.text}
                  </p>
                  <p className="text-xs text-slate-500">
                    Creato il{' '}
                    <time dateTime={idea.createdAt}>
                      {new Date(idea.createdAt).toLocaleString()}
                    </time>
                  </p>
                </div>

                {(onEdit || onRemove) && (
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="rounded-md border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300 hover:text-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
                      >
                        Modifica
                      </button>
                    )}
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}

            {ideas.length === 0 && (
              <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Nessuna idea ancora. Aggiungi la prima per iniziare a pianificare.
              </li>
            )}
          </ul>
        </div>

        <aside className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Preview</h3>
          <div className="rounded-md bg-white p-4 shadow-inner">
            <dl className="grid gap-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-700">Totale idee</dt>
                <dd className="text-base font-semibold text-indigo-600">
                  {ideaSummary.total}
                </dd>
              </div>
              {ideaSummary.latestText && (
                <>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Ultima idea
                    </dt>
                    <dd className="text-sm text-slate-700">
                      {ideaSummary.latestText}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Aggiornata il
                    </dt>
                    <dd className="text-sm text-slate-700">
                      {ideaSummary.latestDate}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          <div
            aria-label="Anteprima dell&apos;andamento delle idee (placeholder per grafico)"
            className="flex flex-col gap-3 rounded-md bg-white p-4 shadow-inner"
            role="img"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Idee recenti
            </p>
            <div className="space-y-2">
              {recentIdeaBuckets.length > 0 ? (
                recentIdeaBuckets.map(([label, count]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{label}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-indigo-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${Math.min(count * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Il grafico verrà mostrato quando avrai qualche idea.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
