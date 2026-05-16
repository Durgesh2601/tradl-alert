import { useEffect, useRef } from 'react';
import type { IPriceLine, UTCTimestamp, SeriesMarker, Time } from 'lightweight-charts';
import { LineStyle } from 'lightweight-charts';
import { useAlerts } from '../../alerts/store';
import type { ChartHandle } from './Chart';

type Props = { handle: ChartHandle; ticker: string };

// Reconciles two things on the chart for the active ticker:
//  - dashed price lines for armed alerts
//  - permanent markers for fired alerts
export function AlertChartLayer({ handle, ticker }: Props) {
  const alerts = useAlerts((s) => s.alerts);
  const lines = useRef<Map<string, IPriceLine>>(new Map());

  // Dashed lines for armed alerts
  useEffect(() => {
    const armed = alerts.filter((a) => a.state === 'armed' && a.condition.ticker === ticker);
    const liveIds = new Set(armed.map((a) => a.id));

    for (const [id, line] of lines.current) {
      if (!liveIds.has(id)) {
        try { handle.candleSeries.removePriceLine(line); } catch { /* chart torn down */ }
        lines.current.delete(id);
      }
    }

    for (const a of armed) {
      const opts = {
        price: a.condition.value,
        color: a.source === 'ai' ? '#5B9DFF' : '#00D09C',
        lineWidth: 1 as const,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `${a.condition.operator === 'crosses_up' ? '↗' : '↘'} ${a.condition.value.toLocaleString('en-IN')}`,
      };
      const existing = lines.current.get(a.id);
      if (existing) existing.applyOptions(opts);
      else lines.current.set(a.id, handle.candleSeries.createPriceLine(opts));
    }
  }, [alerts, handle, ticker]);

  // Markers for fired alerts — must be in ascending time order
  useEffect(() => {
    const markers: SeriesMarker<Time>[] = alerts
      .filter((a) => a.state === 'fired' && a.condition.ticker === ticker)
      .map((a) => ({
        time: Math.floor((a.firedAt ?? Date.now()) / 1000) as UTCTimestamp,
        position: 'aboveBar' as const,
        color: '#00D09C',
        shape: 'circle' as const,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
    handle.candleSeries.setMarkers(markers);
  }, [alerts, handle, ticker]);

  useEffect(() => {
    const map = lines.current;
    return () => {
      for (const line of map.values()) {
        try { handle.candleSeries.removePriceLine(line); } catch { /* ignore */ }
      }
      map.clear();
    };
  }, [handle]);

  return null;
}
