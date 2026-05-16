import { useState } from 'react';
import { TopBar } from './TopBar';
import { ChartPanel } from '../components/chart/ChartPanel';
import { ChatPanel } from '../chat/ChatPanel';
import { SuggestionPanel } from '../ai/SuggestionPanel';
import { MobileTabs, type MobileTab } from './MobileTabs';
import { DEFAULT_SYMBOL } from '../data/symbols';

export function Workspace() {
  const [ticker, setTicker] = useState(DEFAULT_SYMBOL);
  const [tab, setTab] = useState<MobileTab>('chart');

  const focusTicker = (t: string) => {
    setTicker(t);
    setTab('chart');
  };

  return (
    <div className="h-full w-full flex flex-col bg-bg text-ink">
      <TopBar />

      <main className="hidden md:grid flex-1 grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_320px] min-h-0">
        <ChatPanel />
        <ChartPanel ticker={ticker} onChangeTicker={setTicker} />
        <div className="hidden xl:block min-h-0">
          <SuggestionPanel onFocusTicker={setTicker} />
        </div>
      </main>

      <main className="md:hidden flex-1 min-h-0">
        <div className={tab === 'chart' ? 'h-full' : 'hidden'}>
          <ChartPanel ticker={ticker} onChangeTicker={setTicker} />
        </div>
        <div className={tab === 'chat' ? 'h-full' : 'hidden'}>
          <ChatPanel />
        </div>
        <div className={tab === 'ideas' ? 'h-full' : 'hidden'}>
          <SuggestionPanel onFocusTicker={focusTicker} />
        </div>
      </main>
      <div className="md:hidden">
        <MobileTabs value={tab} onChange={setTab} />
      </div>
    </div>
  );
}
