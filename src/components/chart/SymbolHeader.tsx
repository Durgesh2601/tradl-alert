import { useEffect, useState } from 'react';
import { SYMBOLS } from '../../data/symbols';
import { ticker as ticks } from '../../data/mockTicker';
import { num, pct } from '../../lib/format';

type Props = { ticker: string; onChangeTicker?: (t: string) => void };

export function SymbolHeader({ ticker, onChangeTicker }: Props) {
  const sym = SYMBOLS[ticker];
  const [price, setPrice] = useState(sym.basePrice);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    let prev = sym.basePrice;
    let timer: number | undefined;
    const unsub = ticks.subscribe(ticker, (t) => {
      setPrice(t.price);
      setFlash(t.price > prev ? 'up' : t.price < prev ? 'down' : null);
      prev = t.price;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setFlash(null), 180);
    });
    return () => { unsub(); window.clearTimeout(timer); };
  }, [ticker, sym.basePrice]);

  const change = price - sym.basePrice;
  const positive = change >= 0;

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-line bg-bg-1">
      <select
        value={ticker}
        onChange={(e) => onChangeTicker?.(e.target.value)}
        className="bg-bg-2 border border-line text-ink text-sm rounded px-2 py-1 font-semibold focus:outline-none focus:border-line-strong"
      >
        {Object.values(SYMBOLS).map((s) => (
          <option key={s.ticker} value={s.ticker}>{s.ticker}</option>
        ))}
      </select>
      <div className="min-w-0">
        <div className="text-[11px] text-ink-mute uppercase tracking-wider">
          {sym.exchange} · {sym.name}
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`num font-semibold text-xl transition-colors duration-150 ${
              flash === 'up' ? 'text-bull' : flash === 'down' ? 'text-bear' : 'text-ink'
            }`}
          >
            {num(price)}
          </span>
          <span className={`num text-sm ${positive ? 'text-bull' : 'text-bear'}`}>
            {positive ? '+' : ''}{num(change)} · {pct((change / sym.basePrice) * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}
