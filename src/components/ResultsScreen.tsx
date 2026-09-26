import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  FileText,
  BookOpen,
  Quote,
  Download,
  RotateCcw,
  Bug,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  Printer,
} from 'lucide-react';
import type { AuditResult, RedTeamResult, AnalyzedClaim } from '@/lib/types';
import { StatusBadge, STATUS_CONFIG } from './StatusBadge';
import { RedTeamPanel } from './RedTeamPanel';
import { generateReport } from '@/lib/report';
import { runRedTeam } from '@/lib/api';

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ResultsScreenProps {
  result: AuditResult;
  onReset: () => void;
}

export function ResultsScreen({ result, onReset }: ResultsScreenProps) {
  const [redTeamResult, setRedTeamResult] = useState<RedTeamResult | null>(null);
  const [redTeamLoading, setRedTeamLoading] = useState(false);
  const [redTeamOpen, setRedTeamOpen] = useState(false);

  const { summary } = result;
  const allPassed = summary.failed === 0 && summary.review === 0;
  const hasFailures = summary.failed > 0;

  const bannerConfig = allPassed
    ? {
        icon: <ShieldCheck size={28} />,
        bg: 'bg-emerald-50 border-emerald-200',
        title: 'All Claims Verified',
        text: 'Every claim in the answer was supported by the curated source pack.',
        titleColor: 'text-emerald-900',
        iconBg: 'bg-emerald-500',
      }
    : hasFailures
      ? {
          icon: <ShieldX size={28} />,
          bg: 'bg-red-50 border-red-200',
          title: 'Safety Issues Detected',
          text: `${summary.failed} claim(s) failed verification. ${summary.supported} claim(s) were supported.`,
          titleColor: 'text-red-900',
          iconBg: 'bg-red-500',
        }
      : {
          icon: <ShieldAlert size={28} />,
          bg: 'bg-amber-50 border-amber-200',
          title: 'Review Required',
          text: `${summary.review} claim(s) need human review. ${summary.supported} claim(s) were supported.`,
          titleColor: 'text-amber-900',
          iconBg: 'bg-amber-500',
        };

  const handleRedTeam = async () => {
    setRedTeamLoading(true);
    setRedTeamOpen(true);
    try {
      const rt = await runRedTeam(result.claims);
      setRedTeamResult(rt);
    } catch {
      setRedTeamResult(null);
    } finally {
      setRedTeamLoading(false);
    }
  };

  const handleExport = () => {
    const report = generateReport(result, redTeamResult);
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
    } else {
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    const report = generateReport(result, redTeamResult);
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 2000);
      };
    } else {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Action bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Results</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow"
          >
            <Download size={15} />
            Export Report
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-100 hover:shadow"
          >
            <Printer size={15} />
            Print / Save as PDF
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <RotateCcw size={15} />
            New Audit
          </button>
        </div>
      </div>

      {/* Safety banner */}
      <div className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${bannerConfig.bg}`}>
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white ${bannerConfig.iconBg}`}
        >
          {bannerConfig.icon}
        </div>
        <div>
          <h2 className={`text-lg font-bold ${bannerConfig.titleColor}`}>{bannerConfig.title}</h2>
          <p className="text-sm text-slate-700">{bannerConfig.text}</p>
          <p className="mt-1 text-xs text-slate-500">
            {result.demo_mode ? 'Demo mode (deterministic fallback)' : 'AI-assisted analysis'} ·
            Source pack v{result.source_pack_version} ·{' '}
            {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<FileText size={18} className="text-slate-500" />}
          label="Total Claims"
          value={summary.total_claims}
          bg="bg-slate-50"
          border="border-slate-200"
        />
        <StatCard
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
          label="Supported"
          value={summary.supported}
          bg="bg-emerald-50"
          border="border-emerald-200"
        />
        <StatCard
          icon={<AlertCircle size={18} className="text-amber-600" />}
          label="Human Review"
          value={summary.review}
          bg="bg-amber-50"
          border="border-amber-200"
        />
        <StatCard
          icon={<XCircle size={18} className="text-red-600" />}
          label="Failed"
          value={summary.failed}
          bg="bg-red-50"
          border="border-red-200"
        />
      </div>

      {/* Failure breakdown */}
      {summary.failed > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {result.claims.filter(c => c.status === 'CONFLICTING').length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
              <AlertCircle size={12} /> Conflicting: {result.claims.filter(c => c.status === 'CONFLICTING').length}
            </span>
          )}
          {result.claims.filter(c => c.status === 'UNSUPPORTED').length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
              <XCircle size={12} /> Unsupported: {result.claims.filter(c => c.status === 'UNSUPPORTED').length}
            </span>
          )}
          {result.claims.filter(c => c.status === 'JURISDICTION_MISMATCH').length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
              <AlertCircle size={12} /> Jurisdiction Mismatch: {result.claims.filter(c => c.status === 'JURISDICTION_MISMATCH').length}
            </span>
          )}
          {result.claims.filter(c => c.status === 'TIME_MISMATCH').length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <AlertCircle size={12} /> Time Mismatch: {result.claims.filter(c => c.status === 'TIME_MISMATCH').length}
            </span>
          )}
        </div>
      )}
      {summary.failed === 0 && summary.review === 0 && <div className="mb-8" />}

      {/* Red-Team section */}
      <div className="mb-8 overflow-hidden rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50/50 to-white">
        <button
          onClick={() => {
            if (!redTeamResult && !redTeamLoading) {
              handleRedTeam();
            } else {
              setRedTeamOpen(!redTeamOpen);
            }
          }}
          className="flex w-full items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 ring-1 ring-red-200">
              <Bug size={18} className="text-red-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-slate-900">Red-Team This Answer</h3>
              <p className="text-xs text-slate-500">
                Adversarial safety check — fabricated citations, unsupported claims, jurisdiction
                errors, temporal mismatches, sycophancy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {redTeamResult && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  redTeamResult.overall_status === 'PASS'
                    ? 'bg-emerald-100 text-emerald-700'
                    : redTeamResult.overall_status === 'REVIEW'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {redTeamResult.overall_status}
              </span>
            )}
            {redTeamOpen ? (
              <ChevronUp size={18} className="text-slate-400" />
            ) : (
              <ChevronDown size={18} className="text-slate-400" />
            )}
          </div>
        </button>
        {redTeamOpen && (
          <div className="border-t border-slate-100">
            {redTeamLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : redTeamResult ? (
              <RedTeamPanel result={redTeamResult} />
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Failed to run red-team analysis. Please try again.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claim cards */}
      <div className="mb-8">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
          Claim-by-Claim Analysis
        </h3>
        <div className="space-y-4">
          {result.claims.map((claim, idx) => (
            <ClaimCard key={claim.id} claim={claim} index={idx} />
          ))}
        </div>
      </div>

      {/* Grounded answer */}
      <div className="mb-8 rounded-2xl border-2 border-blue-300 bg-blue-50/50 p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Evidence-Grounded Answer</h3>
        </div>
        <p className="mb-4 text-xs font-medium text-blue-700">
          Only verified claims are retained. Unsupported, conflicting, jurisdiction-mismatched, and
          time-mismatched claims are excluded or flagged.
        </p>
        <div className="whitespace-pre-wrap rounded-xl border border-blue-100 bg-white px-5 py-4 text-sm leading-relaxed text-slate-800">
          {result.grounded_answer}
        </div>
      </div>

      {/* Safety notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={18} />
        <p className="text-sm leading-relaxed text-amber-900">
          <strong>Human Review Required.</strong> LexAnchor provides legal-information
          verification, not legal advice. Verify the underlying source and consult a qualified
          professional for consequential decisions.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  border: string;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function ClaimCard({ claim, index }: { claim: AnalyzedClaim; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasEvidence = claim.evidence !== null;
  const config = STATUS_CONFIG[claim.status];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="mt-0.5 text-sm font-bold text-slate-300">#{index + 1}</div>
        <div className="flex-1">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm font-medium leading-relaxed text-slate-800">{claim.text}</p>
            <StatusBadge status={claim.status} />
          </div>
          {/* Citation check indicator */}
          {claim.detected_citation && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500">Detected citation:</span>
              <span className="font-mono font-semibold text-slate-700">
                {claim.detected_citation}
              </span>
              {claim.citation_verified ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 size={10} /> VERIFIED
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                  <XCircle size={10} /> UNVERIFIED
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className={`border-t border-slate-100 px-5 py-3 ${config.bg}/50`}>
        <div className="flex items-start gap-2">
          <Info size={14} className={`mt-0.5 shrink-0 ${config.text}`} />
          <p className="text-sm leading-relaxed text-slate-700">{claim.explanation}</p>
        </div>
      </div>

      {/* Evidence split view */}
      {hasEvidence && (
        <div className="border-t border-slate-100">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50"
          >
            <BookOpen size={14} />
            Evidence Panel
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expanded && claim.evidence && (
            <div className="grid gap-px bg-slate-200 lg:grid-cols-2">
              {/* LEFT: AI claim */}
              <div className="bg-white p-5">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <FileText size={12} />
                  AI Claim
                </div>
                <p className="text-sm leading-relaxed text-slate-800">{claim.text}</p>
              </div>
              {/* RIGHT: Authoritative evidence */}
              <div className="bg-slate-50 p-5">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-blue-600">
                  <Quote size={12} />
                  Authoritative Evidence
                </div>
                <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {claim.evidence.source_title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                      {claim.evidence.source_type}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                      {claim.evidence.jurisdiction}
                    </span>
                    {claim.evidence.source_type === 'Legislation' && claim.evidence.entry_into_force_date && (
                      <span className="text-slate-400">
                        Entry into force: {formatDate(claim.evidence.entry_into_force_date)}
                      </span>
                    )}
                    {claim.evidence.source_type === 'Legislation' && claim.evidence.general_application_date && (
                      <span className="text-slate-400">
                        General application: {formatDate(claim.evidence.general_application_date)}
                      </span>
                    )}
                    {claim.evidence.source_type === 'Legislation' && claim.evidence.last_consolidated_date && (
                      <span className="text-slate-400">
                        Consolidated: {formatDate(claim.evidence.last_consolidated_date)}
                      </span>
                    )}
                    {claim.evidence.source_type !== 'Legislation' && claim.evidence.document_date && (
                      <span className="text-slate-400">
                        Published: {formatDate(claim.evidence.document_date)}
                      </span>
                    )}
                  </div>
                </div>
                <blockquote className="border-l-2 border-blue-400 pl-3 text-sm italic leading-relaxed text-slate-700">
                  {claim.evidence.supporting_passage}
                </blockquote>
                <div className="mt-3 space-y-1.5">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">Citation:</span>{' '}
                    {claim.evidence.citation}
                  </div>
                  <a
                    href={claim.evidence.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                  >
                    View Source
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {!hasEvidence && claim.status === 'UNSUPPORTED' && (
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3">
            <XCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">
              No supporting evidence was found for this claim. The source does not support this claim.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
