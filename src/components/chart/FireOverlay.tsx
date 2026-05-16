import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { UTCTimestamp } from 'lightweight-charts';
import { useAlerts } from '../../alerts/store';
import type { FireEvent } from '../../alerts/types';
import type { ChartHandle } from './Chart';
import { num } from '../../lib/format';

type Props = { handle: ChartHandle; ticker: string };

// On fire: a halo, two pulse rings, a card with what/why and snooze controls.
// Card auto-dismisses after 8s. Marker on the candle is drawn elsewhere.
export function FireOverlay({ handle, ticker }: Props) {
  const fireQueue = useAlerts((s) => s.fireQueue);
  const dismiss = useAlerts((s) => s.dismissFire);
  const queue = useMemo(() => fireQueue.filter((f) => f.ticker === ticker), [fireQueue, ticker]);

  const [anchors, setAnchors] = useState<Anchored[]>([]);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const fresh = queue
      .filter((f) => !seen.current.has(f.id))
      .map((f) => {
        seen.current.add(f.id);
        const rect = handle.container.getBoundingClientRect();
        const x = handle.chart.timeScale().timeToCoordinate(f.time as UTCTimestamp) ?? rect.width - 60;
        const y = handle.candleSeries.priceToCoordinate(f.price) ?? rect.height / 2;
        return { ...f, x, y, w: rect.width, h: rect.height };
      });
    if (fresh.length) setAnchors((prev) => [...prev, ...fresh]);
  }, [queue, handle]);

  useEffect(() => {
    if (!anchors.length) return;
    const timers = anchors.map((a) => window.setTimeout(() => close(a.id), 8000));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchors.length]);

  function close(id: string) {
    setAnchors((prev) => prev.filter((a) => a.id !== id));
    dismiss(id);
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {anchors.map((a) => <Beat key={a.id} a={a} onClose={() => close(a.id)} />)}
      </AnimatePresence>
    </div>
  );
}

type Anchored = FireEvent & { x: number; y: number; w: number; h: number };

function Beat({ a, onClose }: { a: Anchored; onClose: () => void }) {
  const card = placeCard(a);
  return (
    <>
      {[0, 0.18].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-accent"
          style={{ left: a.x - 10, top: a.y - 10, width: 20, height: 20 }}
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}

      <motion.div
        className="absolute rounded-full bg-accent"
        style={{
          left: a.x - 4,
          top: a.y - 4,
          width: 8,
          height: 8,
          boxShadow: '0 0 16px 3px rgba(0,208,156,0.55)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="absolute glass rounded-lg pointer-events-auto"
        style={{ left: card.left, top: card.top, width: card.w }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.18, duration: 0.25 }}
      >
        <Card a={a} onClose={onClose} />
      </motion.div>
    </>
  );
}

function Card({ a, onClose }: { a: Anchored; onClose: () => void }) {
  const sign = a.delta >= 0 ? '+' : '';
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-accent font-semibold">Fired</span>
        <button onClick={onClose} className="text-ink-mute hover:text-ink text-sm leading-none">×</button>
      </div>
      <div className="text-sm text-ink">{a.label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="num text-lg text-ink font-semibold">₹{num(a.price)}</span>
        <span className="num text-xs text-bull">{sign}{num(a.delta)} past trigger</span>
      </div>
      <p className="mt-2 text-xs text-ink-dim leading-relaxed">{a.rationale}</p>
    </div>
  );
}

function placeCard(a: Anchored): { left: number; top: number; w: number } {
  const w = 280;
  const m = 12;
  let left = a.x + 32;
  if (left + w + m > a.w) left = a.x - w - 32;
  if (left < m) left = m;
  let top = a.y - 60;
  if (top < m) top = a.y + 24;
  if (top + 160 > a.h) top = Math.max(m, a.h - 170);
  return { left, top, w };
}
