import { useMemo, useState } from 'react';
import { getSuggestions, type Suggestion } from './suggestor';
import { useAlerts } from '../alerts/store';

type Props = { onFocusTicker?: (t: string) => void };

export function SuggestionPanel({ onFocusTicker }: Props) {
  const all = useMemo(() => getSuggestions(), []);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const addAlert = useAlerts((s) => s.addAlert);

  const visible = all.filter((s) => !dismissed.has(s.id));

  function accept(s: Suggestion) {
    addAlert({ condition: s.condition, label: s.label, rationale: s.rationale, source: 'ai' });
    setAccepted((prev) => new Set(prev).add(s.id));
    onFocusTicker?.(s.ticker);
  }

  return (
    <aside className="flex flex-col h-full min-h-0 border-l border-line bg-bg-1">
      <header className="flex items-center justify-between px-4 h-12 border-b border-line">
        <h2 className="text-sm text-ink font-semibold">For you</h2>
        <span className="text-[10px] text-ink-mute uppercase tracking-wider">{visible.length} ideas</span>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
        {visible.length === 0 ? (
          <p className="text-xs text-ink-mute text-center pt-8 px-6 leading-relaxed">
            Nothing right now. We'll surface ideas as the market moves.
          </p>
        ) : (
          visible.map((s) => (
            <Card
              key={s.id}
              s={s}
              accepted={accepted.has(s.id)}
              onAccept={() => accept(s)}
              onDismiss={() => setDismissed((prev) => new Set(prev).add(s.id))}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function Card({
  s,
  accepted,
  onAccept,
  onDismiss,
}: {
  s: Suggestion;
  accepted: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <article className="rounded-lg border border-line bg-bg-2 p-3">
      <div className="text-[10px] uppercase tracking-wider text-info mb-1">{s.ticker}</div>
      <h3 className="text-sm text-ink leading-snug">{s.headline}</h3>
      <p className="mt-1.5 text-xs text-ink-dim leading-relaxed">{s.why}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          disabled={accepted}
          onClick={onAccept}
          className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
            accepted
              ? 'bg-accent/15 text-accent cursor-default'
              : 'bg-accent text-bg hover:bg-accent/90'
          }`}
        >
          {accepted ? 'Added' : 'Add alert'}
        </button>
        {!accepted && (
          <button onClick={onDismiss} className="text-xs text-ink-mute hover:text-ink-dim">
            Not now
          </button>
        )}
      </div>
    </article>
  );
}
