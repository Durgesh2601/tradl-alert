// Pattern-driven intent parser. Production drops this for an LLM call
// returning the same shape — the rest of the app doesn't change.
import { SYMBOLS, type Symbol } from '../data/symbols';
import type { AlertCondition } from '../alerts/types';

export type ParseResult =
  | { ok: true; condition: AlertCondition; label: string; rationale: string; reply: string }
  | { ok: false; reply: string };

const ALIASES: Record<string, string> = {
  ril: 'RELIANCE',
  reliance: 'RELIANCE',
  nifty: 'NIFTY',
  hdfc: 'HDFCBANK',
  hdfcbank: 'HDFCBANK',
};

// up / down tokens across English, Devanagari, and romanized Hindi
const UP = ['above', 'cross', 'over', 'breaks', 'upar', 'ऊपर', 'paar', 'पार'];
const DOWN = ['below', 'under', 'breakdown', 'neeche', 'नीचे', 'gir', 'गिर', 'todh', 'तोड़'];

export function parseUtterance(text: string): ParseResult {
  const lc = text.toLowerCase().trim();
  if (!lc) return { ok: false, reply: 'Type what you want to be alerted about.' };

  const symbol = findSymbol(lc);
  if (!symbol) {
    return { ok: false, reply: "Which stock? Try Reliance, Nifty, or HDFC Bank." };
  }

  const number = findPrice(lc);
  if (!number) {
    return { ok: false, reply: `What price level for ${symbol.ticker}?` };
  }

  const direction = findDirection(lc) ?? (number >= symbol.basePrice ? 'up' : 'down');
  const operator = direction === 'up' ? 'crosses_up' : 'crosses_down';
  const verb = direction === 'up' ? 'crosses' : 'falls below';

  return {
    ok: true,
    condition: { ticker: symbol.ticker, operator, value: number },
    label: `${symbol.ticker} ${verb} ₹${number.toLocaleString('en-IN')}`,
    rationale: 'Watching this level on the live feed. I\'ll surface the moment it triggers.',
    reply: `Done. I'll ping you when ${symbol.ticker} ${verb} ₹${number.toLocaleString('en-IN')}.`,
  };
}

function findSymbol(lc: string): Symbol | null {
  for (const [alias, ticker] of Object.entries(ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`, 'i').test(lc)) return SYMBOLS[ticker];
  }
  return null;
}

function findDirection(lc: string): 'up' | 'down' | null {
  if (UP.some((t) => lc.includes(t))) return 'up';
  if (DOWN.some((t) => lc.includes(t))) return 'down';
  return null;
}

function findPrice(lc: string): number | null {
  const nums = [...lc.matchAll(/(\d+(?:[.,]\d+)?)/g)]
    .map((m) => parseFloat(m[1].replace(',', '')))
    .filter((n) => n >= 10 && n <= 200_000);
  return nums.length ? Math.max(...nums) : null;
}
