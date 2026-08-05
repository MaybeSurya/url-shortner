import React, { useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Link2Off,
  ArrowLeft,
  Copy,
  Check,
  Sun,
  Moon,
  Monitor,
  Home,
  ShieldAlert,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// ─── SURYA Wordmark ───────────────────────────────────────────────────────────
const SuryaWordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`font-mono font-bold tracking-[0.18em] uppercase select-none ${className}`}
    style={{ letterSpacing: '0.2em' }}
  >
    SURYA
  </span>
);

// ─── Animated Lottie 404 Vector Graphic Component ─────────────────────────────
const AnimatedLottie404: React.FC = () => (
  <div className="relative w-64 h-48 mx-auto flex items-center justify-center select-none overflow-hidden rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/50 shadow-inner">
    {/* Background Radar Scanner Pulses */}
    <motion.div
      animate={{ scale: [1, 1.8, 2.4], opacity: [0.35, 0.15, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
      className="absolute w-24 h-24 rounded-full border border-primary/40 pointer-events-none"
    />
    <motion.div
      animate={{ scale: [1, 1.8, 2.4], opacity: [0.35, 0.15, 0] }}
      transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: 'easeOut' }}
      className="absolute w-24 h-24 rounded-full border border-primary/30 pointer-events-none"
    />

    {/* Floating Animated 404 Graphic */}
    <div className="relative z-10 flex items-center justify-center gap-3">
      {/* First 4 */}
      <motion.span
        animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="font-mono text-5xl sm:text-6xl font-black text-on-surface tracking-tighter"
      >
        4
      </motion.span>

      {/* Center Disconnected Plug / Search Beacon */}
      <motion.div
        animate={{ y: [0, 8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-error/15 border border-error/30 text-error shadow-lg"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-2xl border border-dashed border-error/40 pointer-events-none"
        />
        <Link2Off className="w-8 h-8" />
        
        {/* Floating Sparks */}
        <motion.span
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6], x: [-10, 12, -10] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error"
        />
        <motion.span
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6], y: [10, -12, 10] }}
          transition={{ duration: 2.5, delay: 0.7, repeat: Infinity }}
          className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-amber-400"
        />
      </motion.div>

      {/* Second 4 */}
      <motion.span
        animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 3.2, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className="font-mono text-5xl sm:text-6xl font-black text-on-surface tracking-tighter"
      >
        4
      </motion.span>
    </div>

    {/* Floating Search Scanner Bar */}
    <motion.div
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-0 bottom-0 w-12 bg-linear-to-r from-transparent via-primary/10 to-transparent pointer-events-none transform -skew-x-12"
    />
  </div>
);

export const NotFoundPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  // Extract link URL from query string (?url=...) or fall back to current location
  const rawUrlParam = searchParams.get('url');
  let linkUrl = '';

  if (rawUrlParam) {
    linkUrl = rawUrlParam;
  } else if (location.pathname !== '/404') {
    linkUrl = `${window.location.origin}${location.pathname}${location.search}`;
  } else {
    linkUrl = `${window.location.origin}/short-link`;
  }

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark'] as const;
    const idx = themes.indexOf(theme as 'system' | 'light' | 'dark');
    setTheme(themes[(idx + 1) % themes.length]);
  };

  const ThemeIcon =
    theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  const handleCopy = () => {
    if (!linkUrl) return;
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-x-hidden flex flex-col justify-between">
      {/* ── Subtle background grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-on-surface) 1px, transparent 1px), linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Header ── */}
      <header className="w-full py-4 px-6 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <SuryaWordmark className="text-sm text-on-surface group-hover:text-primary transition-colors" />
          </Link>
          <button
            onClick={cycleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg mx-auto text-center space-y-6"
        >
          {/* Animated 404 Lottie Illustration */}
          <AnimatedLottie404 />

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold text-error bg-error/10 border border-error/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              404 · LINK NOT FOUND
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
              This link is no longer available
            </h1>
          </div>

          {/* Target Link Box */}
          <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xs text-left space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              <span>Attempted Short URL</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors"
                title="Copy link URL"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-secondary" />
                    <span className="text-secondary font-normal">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="font-normal">Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs font-semibold text-primary break-all bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/60">
              {linkUrl}
            </p>
          </div>

          {/* Detailed Message */}
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed px-2">
            The short link <code className="font-mono text-xs font-semibold text-on-surface bg-surface-container px-1.5 py-0.5 rounded">{linkUrl}</code> you are trying to access no longer exists on this server. It might have existed earlier and has now been deleted.
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto h-10 px-5 rounded-lg text-xs font-semibold bg-on-surface text-surface-container-lowest hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
            >
              <Home className="w-3.5 h-3.5" />
              Go to Homepage
            </Link>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto h-10 px-5 rounded-lg text-xs font-semibold border border-outline-variant hover:bg-surface-container text-on-surface transition-colors inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Workspace
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto h-10 px-5 rounded-lg text-xs font-semibold border border-outline-variant hover:bg-surface-container text-on-surface transition-colors inline-flex items-center justify-center gap-2"
              >
                Sign In to Workspace
              </Link>
            )}
          </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-6 px-4 border-t border-outline-variant/50 text-center text-xs text-on-surface-variant z-10">
        <p>© {new Date().getFullYear()} Surya's URL Shortener. All rights reserved.</p>
      </footer>
    </div>
  );
};
