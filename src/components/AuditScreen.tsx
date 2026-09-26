import { useState, useEffect } from 'react';
import { Search, Calendar, FileText, Sparkles, Loader2 } from 'lucide-react';
import { fetchSourcePacks, fetchSources } from '@/lib/api';
import { DEMO_ANSWER } from '@/lib/demoData';
import type { SourcePackRecord, SourceRecord } from '@/lib/types';

interface AuditScreenProps {
  onAudit: (
    inputText: string,
    jurisdiction: string,
    lawAsOfDate: string | null,
    sourcePackId: string,
    sourcePackVersion: string,
    sources: SourceRecord[],
  ) => void;
  loading: boolean;
}

export function AuditScreen({ onAudit, loading }: AuditScreenProps) {
  const [inputText, setInputText] = useState('');
  const [packs, setPacks] = useState<SourcePackRecord[]>([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [lawAsOfDate, setLawAsOfDate] = useState('');
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSourcePacks()
      .then((data) => {
        setPacks(data);
        if (data.length > 0) setSelectedPackId(data[0].id);
      })
      .catch(() => setError('Failed to load source packs. You can still run the demo.'));
  }, []);

  useEffect(() => {
    if (selectedPackId) {
      fetchSources(selectedPackId)
        .then(setSources)
        .catch(() => {});
    }
  }, [selectedPackId]);

  const selectedPack = packs.find((p) => p.id === selectedPackId);

  const handleAudit = () => {
    if (loading || !inputText.trim()) return;
    onAudit(
      inputText,
      selectedPack?.jurisdiction || 'EU + US Federal',
      lawAsOfDate || null,
      selectedPackId,
      selectedPack?.version || '1.0',
      sources,
    );
  };

  const handleLoadExample = () => {
    setInputText(DEMO_ANSWER);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Audit an Answer</h1>
        <p className="mt-2 text-slate-600">
          Paste an AI-generated legal answer below. LexAnchor will extract individual claims and
          verify each one against the curated source pack.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {/* Source Pack — read-only display (single curated pack) */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Curated Source Pack
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800">
            <FileText size={16} className="shrink-0 text-slate-500" />
            <span className="truncate">
              {selectedPack
                ? `${selectedPack.name} (v${selectedPack.version})`
                : packs.length === 0
                  ? 'Loading source pack...'
                  : 'No source pack available'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            One curated pack is available. This is the active source set for all audits.
          </p>
        </div>

        {/* Law As Of Date */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Law As Of Date <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="relative">
            <Calendar
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="date"
              value={lawAsOfDate}
              onChange={(e) => setLawAsOfDate(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pl-9 text-sm font-medium text-slate-800 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Use this to audit whether the cited law or provision was applicable on a specific date.
          </p>
        </div>
      </div>

      {/* Source pack description */}
      {selectedPack && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <FileText size={13} />
            {selectedPack.jurisdiction} · {sources.length} sources
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {selectedPack.description}
          </p>
        </div>
      )}

      {/* Text input */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">
            AI-Generated Legal Answer
          </label>
          <button
            onClick={handleLoadExample}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50"
          >
            <Sparkles size={13} />
            Load Example
          </button>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          placeholder="Paste the AI-generated legal answer here..."
          className="h-72 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-800 transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
        />
        <div className="mt-1 text-right text-xs text-slate-400">
          {inputText.length} characters
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* Action button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleAudit}
          disabled={loading || !inputText.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Auditing...
            </>
          ) : (
            <>
              <Search size={18} />
              Audit Answer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
