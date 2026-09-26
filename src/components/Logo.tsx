import { ShieldCheck } from 'lucide-react';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-600/20"
        style={{ width: size, height: size }}
      >
        <ShieldCheck className="text-white" size={size * 0.6} strokeWidth={2.2} />
      </div>
      <div className="leading-none">
        <span className="text-xl font-bold tracking-tight text-slate-900">LexAnchor</span>
      </div>
    </div>
  );
}
