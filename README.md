# Chart Alive

Prototype for TRADL's alert experience: a conversation layer that handles
English / Hindi / Hinglish, a chart that becomes the alert (not a notification),
and an AI suggestion rail that proposes alerts in context.

## Run

```bash
npm install
npm run dev
```

Tested on Node 18.20.

## What's mocked

| | |
|---|---|
| Chart | Lightweight Charts (TradingView OSS) — real |
| Tick stream | Deterministic random walk, 600ms cadence |
| LLM intent parser | Pattern-driven; same JSON shape an LLM call would return |
| Suggestions | Hand-shaped against the mock symbols |
| State | Zustand — real |

## Where to look

```
src/
  app/            Workspace shell, top bar, mobile tabs
  alerts/         Alert types + Zustand store
  ai/             NLU parser, suggestor, suggestion panel
  chat/           Chat surface + chat store
  components/chart/
                  Chart (Lightweight Charts), AlertChartLayer, FireOverlay
  data/           Symbols, mock ticker
  lib/            Number formatters
```

The single file that matters most is `components/chart/FireOverlay.tsx` —
that's the moment the brief is really evaluating.

## AI tools used

Claude Code helped with scaffolding the component shells and the
Lightweight-Charts boilerplate. Architecture, alert model, NLU patterns,
fire-animation choreography, and the rationale are mine.
