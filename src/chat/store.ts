import { create } from 'zustand';
import { useAlerts } from '../alerts/store';
import { parseUtterance } from '../ai/nlu';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  alertId?: string;
};

const uid = () => `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const GREETING: ChatMessage = {
  id: 'm_greet',
  role: 'assistant',
  text:
    "Tell me what to watch.\n\nE.g. \"Alert me when Reliance crosses 1450\", or \"Nifty 24500 ke upar jaye toh batao\".",
};

type Store = {
  messages: ChatMessage[];
  pending: boolean;
  send: (text: string) => void;
};

export const useChat = create<Store>((set) => ({
  messages: [GREETING],
  pending: false,

  send: (text) => {
    set((s) => ({
      messages: [...s.messages, { id: uid(), role: 'user', text }],
      pending: true,
    }));

    // 500ms latency simulates an LLM round-trip without theatre.
    setTimeout(() => {
      const result = parseUtterance(text);
      const reply: ChatMessage = { id: uid(), role: 'assistant', text: result.reply };

      if (result.ok) {
        const alert = useAlerts.getState().addAlert({
          condition: result.condition,
          label: result.label,
          rationale: result.rationale,
          source: 'user',
        });
        reply.alertId = alert.id;
      }
      set((s) => ({ messages: [...s.messages, reply], pending: false }));
    }, 500);
  },
}));
