import { SYMBOLS } from './symbols';

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Tick = {
  ticker: string;
  time: number;
  price: number;
  volume: number;
};

// Deterministic mulberry32 PRNG so candle history is stable across reloads
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ONE_MIN = 60;

export function generateHistory(ticker: string, count = 240): Candle[] {
  const sym = SYMBOLS[ticker];
  if (!sym) throw new Error(`unknown symbol ${ticker}`);
  const seed = [...ticker].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = mulberry32(seed);

  // align to the most recent minute, build backwards
  const now = Math.floor(Date.now() / 1000);
  const lastBucket = now - (now % ONE_MIN);

  const candles: Candle[] = [];
  let price = sym.basePrice * 0.985;
  const drift = (sym.basePrice - price) / count;
  const vol = sym.basePrice * 0.0009; // pct-of-price volatility per step

  for (let i = count - 1; i >= 0; i--) {
    const t = lastBucket - i * ONE_MIN;
    const open = price;
    const moves = 4;
    let high = open, low = open, close = open;
    for (let m = 0; m < moves; m++) {
      const step = (rand() - 0.48) * vol * 2 + drift / moves;
      close = Math.max(0.01, close + step);
      if (close > high) high = close;
      if (close < low) low = close;
    }
    const volume = Math.round(50_000 + rand() * 180_000 + Math.abs(close - open) * 6_000);
    candles.push({ time: t, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

type Listener = (tick: Tick) => void;

export class MockTicker {
  private listeners = new Set<Listener>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private state = new Map<string, { price: number; bucketTime: number; bucketVol: number }>();

  subscribe(ticker: string, fn: Listener) {
    this.listeners.add(fn);
    if (!this.timers.has(ticker)) this.start(ticker);
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0) this.stop(ticker);
    };
  }

  private start(ticker: string) {
    const sym = SYMBOLS[ticker];
    if (!sym) return;
    const seed = [...ticker].reduce((a, c) => a + c.charCodeAt(0), 0) ^ Date.now();
    const rand = mulberry32(seed);
    const now = Math.floor(Date.now() / 1000);
    this.state.set(ticker, {
      price: sym.basePrice,
      bucketTime: now - (now % ONE_MIN),
      bucketVol: 0,
    });
    const stepPx = sym.basePrice * 0.0006;
    const tick = () => {
      const s = this.state.get(ticker)!;
      const now = Math.floor(Date.now() / 1000);
      const bucket = now - (now % ONE_MIN);
      if (bucket !== s.bucketTime) {
        s.bucketTime = bucket;
        s.bucketVol = 0;
      }
      const delta = (rand() - 0.5) * stepPx * 2;
      s.price = Math.max(0.01, s.price + delta);
      s.bucketVol += Math.round(400 + rand() * 2200);
      const tk: Tick = { ticker, time: bucket, price: s.price, volume: s.bucketVol };
      this.listeners.forEach((fn) => fn(tk));
    };
    this.timers.set(ticker, setInterval(tick, 600));
  }

  private stop(ticker: string) {
    const t = this.timers.get(ticker);
    if (t) clearInterval(t);
    this.timers.delete(ticker);
  }
}

export const ticker = new MockTicker();
