import { create } from 'zustand';
import type { Alert, AlertCondition, FireEvent } from './types';

const uid = (p = 'a') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

type Input = {
  condition: AlertCondition;
  label: string;
  rationale: string;
  source: 'user' | 'ai';
};

type Store = {
  alerts: Alert[];
  fireQueue: FireEvent[];
  lastPrice: Record<string, number>;

  addAlert: (input: Input) => Alert;
  removeAlert: (id: string) => void;
  ingestTick: (ticker: string, price: number) => void;
  dismissFire: (id: string) => void;
};

export const useAlerts = create<Store>((set, get) => ({
  alerts: [],
  fireQueue: [],
  lastPrice: {},

  addAlert: (input) => {
    const alert: Alert = {
      id: uid(),
      createdAt: Date.now(),
      state: 'armed',
      ...input,
    };
    set((s) => ({ alerts: [alert, ...s.alerts] }));
    return alert;
  },

  removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

  ingestTick: (ticker, price) => {
    const prev = get().lastPrice[ticker];
    set((s) => ({ lastPrice: { ...s.lastPrice, [ticker]: price } }));
    if (prev === undefined) return;

    const fires: FireEvent[] = [];
    const alerts = get().alerts.map((a) => {
      if (a.state !== 'armed' || a.condition.ticker !== ticker) return a;
      const { operator, value } = a.condition;
      const crossed =
        (operator === 'crosses_up' && prev < value && price >= value) ||
        (operator === 'crosses_down' && prev > value && price <= value);
      if (!crossed) return a;
      fires.push({
        id: uid('f'),
        alertId: a.id,
        ticker,
        time: Math.floor(Date.now() / 1000),
        price,
        delta: price - value,
        label: a.label,
        rationale: a.rationale,
      });
      return { ...a, state: 'fired' as const, firedAt: Date.now(), firedPrice: price };
    });

    if (fires.length) set((s) => ({ alerts, fireQueue: [...s.fireQueue, ...fires] }));
  },

  dismissFire: (id) => set((s) => ({ fireQueue: s.fireQueue.filter((f) => f.id !== id) })),
}));
