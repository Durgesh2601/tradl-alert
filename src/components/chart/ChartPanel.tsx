import { useCallback, useState } from "react";
import { Chart, type ChartHandle } from "./Chart";
import { SymbolHeader } from "./SymbolHeader";
import { AlertChartLayer } from "./AlertChartLayer";
import { FireOverlay } from "./FireOverlay";
import { useAlerts } from "../../alerts/store";

type Props = { ticker: string; onChangeTicker: (t: string) => void };

export function ChartPanel({ ticker, onChangeTicker }: Props) {
  const [handle, setHandle] = useState<ChartHandle | null>(null);
  const ingestTick = useAlerts((s) => s.ingestTick);

  const onReady = useCallback((h: ChartHandle) => setHandle(h), []);
  const onPrice = useCallback(
    (price: number) => ingestTick(ticker, price),
    [ingestTick, ticker],
  );

  return (
    <section className="min-h-0 flex flex-col bg-bg">
      <SymbolHeader ticker={ticker} onChangeTicker={onChangeTicker} />
      <div className="flex-1 min-h-0 relative">
        <Chart ticker={ticker} onChartReady={onReady} onPriceUpdate={onPrice} />
        {handle && <AlertChartLayer handle={handle} ticker={ticker} />}
        {handle && <FireOverlay handle={handle} ticker={ticker} />}
      </div>
    </section>
  );
}
