# Rationale — TRADL-alert

**Brief:** TRADL AI — conversational AI alerts, visualized on the chart.

---

## 1. Who I designed for

I picked two users and let most decisions resolve against the first.

**Priya, 32 — Bengaluru, salaried, option seller on weekly expiries.**
Can't watch the screen 9:15–3:30. Has been burned twice by one leg of a
strangle blowing out while she was in a meeting. Speaks alerts in precise
English: _"Alert me when NIFTY breaks 24,500."_

**Rohit, 24 — equity beginner, Hinglish vocabulary.**
₹2L portfolio. Doesn't yet know what's worth alerting on. Types things like
_"reliance upar jaye toh batao"_.

Most of the chart-side polish is for Priya. The chat tolerance and the
suggestion layer are for Rohit.

---

## 2. The shape of the product

Three surfaces in one workspace, not three apps. Left: chat. Centre: chart.
Right: suggestions. On mobile they collapse to tabs.

**One workspace** because the unit of work _is_ the alert, and an alert
touches all three surfaces in a single thought. The chip in the chat bubble
and the line on the chart are the same object observed from two angles —
when the alert fires, both update in the same tick.

---

## 3. Surface decisions

### Chat

- **No form pretending to be chat.** No symbol picker, no operator dropdown.
  If the parser can't resolve the utterance, the assistant asks one
  clarifying question — it does not pop a form.
- **Inferred direction.** "RELIANCE 1450" with no verb infers crosses_up if
  current price is below 1450, crosses_down otherwise.
- **Multi-language.** The parser recognizes English keywords, Devanagari
  (`के ऊपर`, `गिर`), and romanized Hinglish (`upar`, `neeche`, `gir`).
  Same structured output regardless of input language.
- **One bubble, one alert.** When the parser creates an alert, the
  assistant's message grows an `AlertChip` that mirrors the alert's live
  state. When it fires, the same chip flips to "✓ Fired". The chat history
  becomes a navigable timeline.

### Chart — the fire moment

The brief said "look at TradingView, then push past it." TradingView's fired
alert is a horizontal line flashing once and a toast. I treat the firing as
a **moment**, not a notification.

The moment is layered, restrained on purpose:

1. Two concentric pulse rings expand from the trigger point (eased so they
   don't read as alarms).
2. A bright centerpoint with an accent glow stays behind as the dot.
3. A card slides in next to the trigger with: **what** (the alert label),
   **where** (current price + delta past trigger), **why** (the rationale).
4. A permanent marker is added to the candle via Lightweight Charts'
   marker API — survives pan/zoom long after the animation is gone.

The animation card lives in a DOM overlay above the chart canvas (canvas
can't host Framer Motion). The persistent marker lives inside the canvas
via `setMarkers`. Two layers, one moment.

### Suggestions

- **Not pushy.** Two cards by default, max. Never auto-creates an alert.
- **Reasoning shown by default.** Each card has a one-line "why" — the user
  sees the logic before the headline.
- **Accept = focus.** Accepting a suggestion adds the alert and routes the
  chart to that ticker, so the user sees the line they just created.

---

## 4. Tech choices

|                              |                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite + React 18 + TypeScript | Fast HMR, typed front to back                                                                                                                                                                                                                                                                             |
| **Lightweight Charts**       | What real trading sites use, canvas-fast, OSS                                                                                                                                                                                                                                                             |
| **Zustand**                  | Single source of truth for alerts, fireQueue, chat. Per-selector subscriptions kept FireOverlay decoupled from ChartPanel without prop-drilling. Picked over Redux because the ceremony isn't earning anything at this size; over Jotai because alert state isn't atomized — it's one list and one queue. |
| **Framer Motion**            | Only used in `FireOverlay` and `SuggestionPanel`. The rest of the UI uses plain Tailwind transitions.                                                                                                                                                                                                     |
| **Tailwind**                 | Design tokens as classes, no CSS file sprawl.                                                                                                                                                                                                                                                             |

No AG Grid, no Plotly, no Redux. Wrong tools for this brief; would have been
overengineering.

---

## 5. What I cut, and why

Restraint is a green flag in the brief. Specifics:

- **Alert kinds beyond price.** I built a model that could hold OI / PnL /
  volume / "natural" intents. Cut all of them. Price alerts cover the brief's
  must-have. The extra kinds were demo-able but didn't earn their weight.
- **Alert hygiene drawer.** A full slide-in panel with filters, group ops,
  snooze, stale detection. Cut. The chat is the alert manager; the chart is
  the alert manager. A third surface for managing alerts duplicates work.
- **Vague-intent proposals.** _"Tell me anything interesting"_ opening a
  three-card proposal flow. Nice in theory; in practice it's a parallel
  product I couldn't ship cleanly in scope.
- **Streaming chat text with shimmer.** Cute. Adds nothing. The assistant
  reply is short enough that a 500ms delay reads as "thinking" without
  theatre.
- **Suggestion sparklines, precedent lines, "what does this mean"
  explainers, confidence dots.** Each was defensible on its own. Together
  they made every card a small dashboard and the panel started shouting.
  Cut to one tag + headline + why + add button.
- **Order entry from the fire card.** Out of scope, and intentionally so —
  the highest-adrenaline moment of a trader's day is not where you want a
  one-tap order path.

---

## 6. Trade-offs I'm living with

- **NLU is pattern-based, not an LLM.** Zero latency, deterministic for the
  demo, but doesn't generalize to phrasings I didn't predict. The function
  shape is what an LLM call would return — swap is mechanical.
- **Alerts evaluate client-side.** Real product evaluates server-side for
  delivery guarantees. The contract (condition → fire event) is the same on
  either side.
- **Mock ticks walk smoothly.** A real feed has bursts and gaps. Good enough
  to demonstrate the fire mechanics; obviously not for stress.

---

## 7. AI tools used

Claude Code helped with scaffolding component shells and the
Lightweight-Charts boilerplate.
