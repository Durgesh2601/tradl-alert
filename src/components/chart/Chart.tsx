import { useEffect, useMemo, useRef } from "react";
import {
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  LineStyle,
} from "lightweight-charts";
import {
  generateHistory,
  ticker as ticks,
  type Candle,
  type Tick,
} from "../../data/mockTicker";

type Props = {
  ticker: string;
  onPriceUpdate?: (price: number, time: number) => void;
  onChartReady?: (api: ChartHandle) => void;
};

export type ChartHandle = {
  chart: IChartApi;
  candleSeries: ISeriesApi<"Candlestick">;
  volumeSeries: ISeriesApi<"Histogram">;
  container: HTMLDivElement;
  history: Candle[];
};

const CHART_OPTIONS = {
  layout: {
    background: { color: "#0A0E13" },
    textColor: "#8A95A5",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: "#11161C" },
    horzLines: { color: "#11161C" },
  },
  rightPriceScale: {
    borderColor: "#1E2530",
    scaleMargins: { top: 0.08, bottom: 0.28 },
  },
  timeScale: {
    borderColor: "#1E2530",
    timeVisible: true,
    secondsVisible: false,
    rightOffset: 6,
    barSpacing: 8,
  },
  crosshair: {
    mode: CrosshairMode.Magnet,
    vertLine: {
      color: "#2A3340",
      width: 1,
      style: LineStyle.Dashed,
      labelBackgroundColor: "#161D26",
    },
    horzLine: {
      color: "#2A3340",
      width: 1,
      style: LineStyle.Dashed,
      labelBackgroundColor: "#161D26",
    },
  },
  handleScale: { axisPressedMouseMove: { time: true, price: false } },
} as const;

export function Chart({ ticker, onPriceUpdate, onChartReady }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ChartHandle | null>(null);
  const history = useMemo(() => generateHistory(ticker, 240), [ticker]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      ...CHART_OPTIONS,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00C896",
      downColor: "#FF5C5C",
      borderUpColor: "#00C896",
      borderDownColor: "#FF5C5C",
      wickUpColor: "#00C896",
      wickDownColor: "#FF5C5C",
      priceLineColor: "#00D09C",
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dotted,
      priceFormat: { type: "price", precision: 2, minMove: 0.05 },
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: "#1E2530",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
      visible: false,
    });

    candleSeries.setData(
      history.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    volumeSeries.setData(
      history.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? "#0A2E26" : "#3A1822",
      })),
    );

    chart.timeScale().scrollToRealTime();

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    const handle: ChartHandle = {
      chart,
      candleSeries,
      volumeSeries,
      container: el,
      history,
    };
    handleRef.current = handle;
    onChartReady?.(handle);

    // Live tick subscription: aggregate ticks into the current minute bucket
    let bucket: {
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    } | null = null;
    const last = history[history.length - 1];
    bucket = {
      time: last.time,
      open: last.open,
      high: last.high,
      low: last.low,
      close: last.close,
      volume: last.volume,
    };

    const unsub = ticks.subscribe(ticker, (tk: Tick) => {
      if (!bucket) return;
      if (tk.time > bucket.time) {
        // close existing & open new
        bucket = {
          time: tk.time,
          open: tk.price,
          high: tk.price,
          low: tk.price,
          close: tk.price,
          volume: tk.volume,
        };
      } else {
        bucket.close = tk.price;
        if (tk.price > bucket.high) bucket.high = tk.price;
        if (tk.price < bucket.low) bucket.low = tk.price;
        bucket.volume = tk.volume;
      }
      candleSeries.update({
        time: bucket.time as UTCTimestamp,
        open: bucket.open,
        high: bucket.high,
        low: bucket.low,
        close: bucket.close,
      });
      volumeSeries.update({
        time: bucket.time as UTCTimestamp,
        value: bucket.volume,
        color: bucket.close >= bucket.open ? "#0A2E26" : "#3A1822",
      });
      onPriceUpdate?.(tk.price, tk.time);
    });

    return () => {
      unsub();
      ro.disconnect();
      chart.remove();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  return <div ref={wrapRef} className="w-full h-full" />;
}
