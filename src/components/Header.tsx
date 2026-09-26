import { Logo } from './Logo';
import { Github, FileText } from 'lucide-react';

interface HeaderProps {
  onHome: () => void;
}

export function Header({ onHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <button onClick={onHome} className="transition-transform hover:scale-[1.02]">
          <Logo />
        </button>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 sm:flex">
            <FileText size={14} className="text-slate-400" />
            Legal-Information Verification
          </span>
          <span className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 sm:flex">
            <Github size={14} />
            Hackathon Prototype
          </span>
        </div>
      </div>
    </header>
  );
}
