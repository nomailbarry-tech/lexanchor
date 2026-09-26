import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HomeScreen } from '@/components/HomeScreen';
import { AuditScreen } from '@/components/AuditScreen';
import { ResultsScreen } from '@/components/ResultsScreen';
import { runAudit } from '@/lib/api';
import type { AuditResult, SourceRecord } from '@/lib/types';

type Screen = 'home' | 'audit' | 'results';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleTryDemo = () => setScreen('audit');

  const handleAudit = async (
    inputText: string,
    jurisdiction: string,
    lawAsOfDate: string | null,
    sourcePackId: string,
    sourcePackVersion: string,
    sources: SourceRecord[],
  ) => {
    setLoading(true);
    try {
      const auditResult = await runAudit(
        inputText,
        jurisdiction,
        lawAsOfDate,
        sourcePackId,
        sourcePackVersion,
        sources,
      );
      setResult(auditResult);
      setScreen('results');
    } catch {
      // If everything fails, we should never leave user stuck
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScreen('audit');
  };

  const handleHome = () => {
    setScreen('home');
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header onHome={handleHome} />
      <main className="flex-1">
        {screen === 'home' && <HomeScreen onTryDemo={handleTryDemo} />}
        {screen === 'audit' && <AuditScreen onAudit={handleAudit} loading={loading} />}
        {screen === 'results' && result && (
          <ResultsScreen result={result} onReset={handleReset} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
