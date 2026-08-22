import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SuryaWordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`font-mono font-bold tracking-[0.18em] uppercase select-none ${className}`}
    style={{ letterSpacing: '0.2em' }}
  >
    SURYA
  </span>
);

export const LandingPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark'] as const;
    const idx = themes.indexOf(theme as 'system' | 'light' | 'dark');
    setTheme(themes[(idx + 1) % themes.length]);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-x-hidden flex flex-col justify-between">
      {/* Grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-on-surface) 1px, transparent 1px), linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── NAVBAR ── */}
      <header className="w-full z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between h-12 px-4 rounded-xl border border-outline-variant/70 bg-surface-container-lowest/85 backdrop-blur-xl shadow-xs">
            <SuryaWordmark className="text-sm text-on-surface" />
            <div className="flex items-center gap-2">
              <button
                onClick={cycleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150"
                aria-label={`Theme: ${theme}`}
              >
                <ThemeIcon className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/login"
                className="h-8 px-4 rounded-lg bg-on-surface text-surface-container-lowest text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                Sign In <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide text-on-surface-variant border border-outline-variant/80 bg-surface-container-low/60">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Private · Internal Access Only
            </span>
          </div>

          <h1 className="flex items-center justify-center">
            <SuryaWordmark className="text-5xl sm:text-7xl text-on-surface" />
          </h1>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            This is a private platform. Access is by invitation only.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-on-surface text-surface-container-lowest text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Sign In <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full border-t border-outline-variant/50 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-on-surface-variant">
            © {new Date().getFullYear()} Surya. All rights reserved.
          </p>
          <a
            href="mailto:abuse@maybesurya.dev"
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150"
          >
            Report Abuse
          </a>
        </div>
      </footer>
    </div>
  );
};
