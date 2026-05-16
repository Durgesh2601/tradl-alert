import type { AlertCondition } from '../alerts/types';
import { SYMBOLS } from '../data/symbols';

export type Suggestion = {
  id: string;
  ticker: string;
  headline: string;
  why: string;
  condition: AlertCondition;
  label: string;
  rationale: string;
};

// In production these come from a server job over portfolio + live signals.
// Here they're hand-shaped against the mock data so the UI feels live.
export function getSuggestions(): Suggestion[] {
  const ril = SYMBOLS.RELIANCE;
  const nifty = SYMBOLS.NIFTY;
  const rangeHigh = Math.round(ril.basePrice * 1.012);
  const niftyFloor = Math.round(nifty.basePrice * 0.996);

  return [
    {
      id: 's_ril',
      ticker: 'RELIANCE',
      headline: `Reliance is consolidating near ₹${rangeHigh.toLocaleString('en-IN')}`,
      why: 'Volume is building on the upside. A clean break of the day-high usually carries.',
      condition: { ticker: 'RELIANCE', operator: 'crosses_up', value: rangeHigh },
      label: `RELIANCE crosses ₹${rangeHigh.toLocaleString('en-IN')}`,
      rationale: 'Range break with rising volume — high-probability continuation setup.',
    },
    {
      id: 's_nifty',
      ticker: 'NIFTY',
      headline: `Nifty support sits around ₹${niftyFloor.toLocaleString('en-IN')}`,
      why: 'A breakdown below this level often opens up the next leg lower into the close.',
      condition: { ticker: 'NIFTY', operator: 'crosses_down', value: niftyFloor },
      label: `NIFTY falls below ₹${niftyFloor.toLocaleString('en-IN')}`,
      rationale: 'Intraday support break — worth a heads-up before the close.',
    },
  ];
}
