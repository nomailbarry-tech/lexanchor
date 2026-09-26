import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bug,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { RedTeamResult, RedTeamTest, RedTeamTestStatus } from '@/lib/types';

interface RedTeamPanelProps {
  result: RedTeamResult;
}

export function RedTeamPanel({ result }: RedTeamPanelProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  // Animate tests appearing one by one
  useEffect(() => {
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= result.tests.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [result.tests.length]);

  const overallConfig = {
    PASS: {
      icon: <ShieldCheck size={20} />,
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      label: 'PASS — Safe',
    },
    REVIEW: {
      icon: <ShieldAlert size={20} />,
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      label: 'REVIEW — Needs Attention',
    },
    FAIL: {
      icon: <ShieldX size={20} />,
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      label: 'FAIL — Safety Issues',
    },
  } as const;

  const cfg = overallConfig[result.overall_status];

  const toggleTest = (id: string) => {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-5">
      {/* Animated test list */}
      <div className="space-y-3">
        {result.tests.map((test, idx) => (
          <div
            key={test.id}
            className={`transition-all duration-500 ${
              idx < visibleCount
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0'
            }`}
          >
            <TestRow
              test={test}
              visible={idx < visibleCount}
              expanded={expandedTests.has(test.id)}
              onToggle={() => toggleTest(test.id)}
            />
          </div>
        ))}
      </div>

      {/* Overall summary — appears after all tests */}
      {visibleCount >= result.tests.length && (
        <div
          className={`mt-5 flex items-center gap-3 rounded-xl border p-4 ${cfg.bg} transition-all duration-500`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.text}`}>
            {cfg.icon}
          </div>
          <div>
            <div className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</div>
            <p className="text-sm text-slate-700">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TestRow({
  test,
  visible,
  expanded,
  onToggle,
}: {
  test: RedTeamTest;
  visible: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (!visible) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  const statusConfig: Record<
    RedTeamTestStatus,
    { icon: React.ReactNode; bg: string; text: string; border: string }
  > = {
    PASS: {
      icon: <CheckCircle2 size={18} />,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    REVIEW: {
      icon: <AlertCircle size={18} />,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    FAIL: {
      icon: <XCircle size={18} />,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  };

  const cfg = statusConfig[test.status];

  return (
    <div className={`rounded-lg border ${cfg.border} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.text}`}>
          {cfg.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{test.name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
              {test.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{test.description}</p>
        </div>
        {expanded ? (
          <ChevronUp size={15} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronDown size={15} className="shrink-0 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-start gap-2">
            <Bug size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-sm leading-relaxed text-slate-700">{test.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
