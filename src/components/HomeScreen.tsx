import { ShieldCheck, FileSearch, Scale, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

interface HomeScreenProps {
  onTryDemo: () => void;
}

export function HomeScreen({ onTryDemo }: HomeScreenProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 -left-40 h-80 w-80 rounded-full bg-cyan-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-24">
        {/* Hero */}
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Lock size={14} />
            Evidence-First AI Safety Layer
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            LexAnchor
          </h1>
          <p className="mt-3 text-xl font-semibold text-slate-700">
            Make AI prove its legal claims.
          </p>
          <p className="mt-2 text-base font-medium text-blue-600">
            An evidence-first safety layer for AI-generated legal information.
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Analyze an AI-generated legal answer claim by claim. LexAnchor checks evidence,
            jurisdiction, and timing, then flags unsupported or conflicting claims before they
            are trusted.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={onTryDemo}
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              Try the Demo
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <span className="text-sm text-slate-400">
              No sign-up required · Synthetic data
            </span>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<FileSearch className="text-blue-600" size={24} />}
            title="Claim-by-Claim Audit"
            description="Each legal claim is extracted, checked against authoritative sources, and assigned a clear status: supported, unsupported, conflicting, or mismatched."
          />
          <FeatureCard
            icon={<Scale className="text-blue-600" size={24} />}
            title="Evidence Transparency"
            description="Every supported claim shows its source title, citation, exact supporting passage, and a direct link. Unsupported claims never receive fabricated citations."
          />
          <FeatureCard
            icon={<ShieldCheck className="text-blue-600" size={24} />}
            title="Red-Team Testing"
            description="A dedicated red-team module tests for fabricated citations, unsupported claims, jurisdiction errors, temporal mismatches, and sycophantic over-confidence."
          />
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
            How It Works
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {[
              { step: '01', title: 'Paste', desc: 'Paste an AI-generated legal answer' },
              { step: '02', title: 'Select', desc: 'Choose jurisdiction and source pack' },
              { step: '03', title: 'Audit', desc: 'Each claim is checked against sources' },
              { step: '04', title: 'Red-Team', desc: 'Adversarial safety tests run' },
              { step: '05', title: 'Rewrite', desc: 'Get an evidence-grounded answer' },
            ].map((item, i) => (
              <div key={i} className="relative rounded-xl border border-slate-200 bg-white p-5">
                <div className="text-xs font-bold text-blue-600">{item.step}</div>
                <div className="mt-1 text-sm font-semibold text-slate-800">{item.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety notice */}
        <div className="mt-16 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>LexAnchor provides legal-information verification, not legal advice.</strong>{' '}
            Verify the underlying source and consult a qualified professional for consequential
            decisions. This is a hackathon prototype using synthetic demonstration data.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
