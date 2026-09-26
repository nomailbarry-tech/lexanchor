export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>Safety Notice:</strong> LexAnchor provides legal-information verification,
            not legal advice. Verify the underlying source and consult a qualified professional
            for consequential decisions.
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          LexAnchor — Make AI prove its legal claims. Hackathon prototype using synthetic
          demonstration data.
        </p>
      </div>
    </footer>
  );
}
