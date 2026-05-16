export type MobileTab = 'chat' | 'chart' | 'ideas';

const TABS: { id: MobileTab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'chart', label: 'Chart' },
  { id: 'ideas', label: 'Ideas' },
];

type Props = { value: MobileTab; onChange: (t: MobileTab) => void };

export function MobileTabs({ value, onChange }: Props) {
  return (
    <nav className="border-t border-line bg-bg-1 flex">
      {TABS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex-1 py-2.5 text-xs transition-colors ${
              active ? 'text-ink border-t-2 border-accent -mt-px' : 'text-ink-mute'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
