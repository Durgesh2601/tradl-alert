export type AlertCondition = {
  ticker: string;
  operator: 'crosses_up' | 'crosses_down';
  value: number;
};

export type Alert = {
  id: string;
  createdAt: number;
  condition: AlertCondition;
  label: string;
  rationale: string;
  source: 'user' | 'ai';
  state: 'armed' | 'fired';
  firedAt?: number;
  firedPrice?: number;
};

export type FireEvent = {
  id: string;
  alertId: string;
  ticker: string;
  time: number;
  price: number;
  delta: number;
  label: string;
  rationale: string;
};
