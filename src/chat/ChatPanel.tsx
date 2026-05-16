import { useEffect, useRef, useState } from 'react';
import { useChat, type ChatMessage } from './store';
import { useAlerts } from '../alerts/store';

export function ChatPanel() {
  const messages = useChat((s) => s.messages);
  const pending = useChat((s) => s.pending);
  const send = useChat((s) => s.send);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, pending]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    if (!v || pending) return;
    send(v);
    setInput('');
  }

  return (
    <aside className="flex flex-col h-full min-h-0 border-r border-line bg-bg-1">
      <header className="flex items-center justify-between px-4 h-12 border-b border-line">
        <h2 className="text-sm text-ink font-semibold">Alerts</h2>
        <span className="text-[10px] text-ink-mute uppercase tracking-wider">en · हि · hinglish</span>
      </header>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((m) => <Message key={m.id} m={m} />)}
        {pending && <Typing />}
      </div>

      <form onSubmit={onSubmit} className="border-t border-line p-2.5">
        <div className="flex items-center gap-2 bg-bg-2 border border-line focus-within:border-line-strong rounded-lg px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Alert me when…"
            disabled={pending}
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || pending}
            className="text-xs px-3 py-1 rounded-md bg-accent text-bg disabled:bg-bg-3 disabled:text-ink-mute"
          >
            Send
          </button>
        </div>
      </form>
    </aside>
  );
}

function Message({ m }: { m: ChatMessage }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-bg-3 border border-line px-3 py-2 text-sm text-ink">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-sm text-ink whitespace-pre-line leading-relaxed">{m.text}</div>
      {m.alertId && <AlertChip alertId={m.alertId} />}
    </div>
  );
}

function AlertChip({ alertId }: { alertId: string }) {
  const alert = useAlerts((s) => s.alerts.find((a) => a.id === alertId));
  if (!alert) return null;
  const fired = alert.state === 'fired';
  return (
    <div
      className={`mt-2 rounded-md border px-2.5 py-1.5 text-xs ${
        fired ? 'border-accent/40 bg-accent/5 text-accent' : 'border-line bg-bg-2 text-ink-dim'
      }`}
    >
      <span className="font-medium">{fired ? '✓ Fired' : '◉ Watching'}</span>
      <span className="mx-2 opacity-50">·</span>
      <span>{alert.label}</span>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ink-mute"
          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
  );
}
