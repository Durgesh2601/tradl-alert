export type Symbol = {
  ticker: string;
  name: string;
  exchange: 'NSE';
  basePrice: number;
};

export const SYMBOLS: Record<string, Symbol> = {
  RELIANCE: { ticker: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', basePrice: 1448.6 },
  NIFTY: { ticker: 'NIFTY', name: 'Nifty 50', exchange: 'NSE', basePrice: 24812.4 },
  HDFCBANK: { ticker: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', basePrice: 1714.2 },
};

export const DEFAULT_SYMBOL = 'RELIANCE';
