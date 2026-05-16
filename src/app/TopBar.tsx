import { useAlerts } from '../alerts/store';

export function TopBar() {
  const armed = useAlerts((s) => s.alerts.filter((a) => a.state === 'armed').length);
  const fired = useAlerts((s) => s.alerts.filter((a) => a.state === 'fired').length);

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-line bg-bg-1">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="text-sm text-ink font-semibold tracking-tight">tradl</span>
        <span className="text-ink-mute text-sm hidden sm:inline">·</span>
        <span className="text-xs text-ink-dim hidden sm:inline">Alerts</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-dim">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="num text-ink">{armed}</span>
          <span className="hidden sm:inline">armed</span>
        </span>
        {fired > 0 && (
          <span className="flex items-center gap-1.5 text-bull">
            <span className="num">{fired}</span>
            <span className="hidden sm:inline">fired</span>
          </span>
        )}
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="20" height="20" rx="5" fill="#00D09C" fillOpacity="0.12" stroke="#00D09C" strokeOpacity="0.6" />
      <path d="M4 14 L8 10 L11 12 L14 7 L18 9" stroke="#00D09C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="7" r="2" fill="#00D09C" />
    </svg>
  );
}
