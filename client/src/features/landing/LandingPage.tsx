import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sun, Moon, Monitor, ExternalLink, Github } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut', delay },
  }),
};

// ─── SURYA Wordmark ───────────────────────────────────────────────────────────
const SuryaWordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`font-mono font-bold tracking-[0.18em] uppercase select-none ${className}`}
    style={{ letterSpacing: '0.2em' }}
  >
    SURYA
  </span>
);

// ─── Stat Band Item ───────────────────────────────────────────────────────────
const StatItem: React.FC<{ value: string; label: string; delay?: number }> = ({
  value,
  label,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="flex flex-col items-center gap-0.5 px-6 md:px-10"
    >
      <span className="text-xl md:text-2xl font-semibold font-mono text-on-surface tracking-tight">
        {value}
      </span>
      <span className="text-xs text-on-surface-variant">{label}</span>
    </motion.div>
  );
};

// ─── Landing Page ─────────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes = ['system', 'light', 'dark'] as const;
    const idx = themes.indexOf(theme as 'system' | 'light' | 'dark');
    setTheme(themes[(idx + 1) % themes.length]);
  };

  const ThemeIcon =
    theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-x-hidden flex flex-col">

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-on-surface) 1px, transparent 1px), linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          NAVIGATION
          ───────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between h-12 px-4 rounded-xl border border-outline-variant/70 bg-surface-container-lowest/85 backdrop-blur-xl shadow-xs">

            {/* Wordmark */}
            <Link
              to="/"
              className="group flex items-center"
              aria-label="SURYA home"
            >
              <SuryaWordmark className="text-sm text-on-surface group-hover:text-primary transition-colors duration-200" />
            </Link>

            {/* Center nav (desktop) */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              <a
                href="#"
                onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-all duration-150"
              >
                Home
              </a>
              <a
                href="https://github.com/thedevs-network/kutt"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-all duration-150 inline-flex items-center gap-1"
              >
                Documentation
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={cycleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150"
                aria-label={`Current theme: ${theme}. Click to cycle.`}
                title={`Theme: ${theme}`}
              >
                <ThemeIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─────────────────────────────────────────────────────────────
          HERO
          ───────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24 md:py-36">
        <div className="max-w-2xl mx-auto text-center space-y-8">

          {/* Internal badge */}
          <motion.div
            variants={fadeIn}
            custom={0.05}
            initial="hidden"
            animate="visible"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide text-on-surface-variant border border-outline-variant/80 bg-surface-container-low/60">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Internal Platform · Private Access
            </span>
          </motion.div>

          {/* Wordmark hero */}
          <motion.div
            variants={fadeUp}
            custom={0.1}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="flex items-center justify-center">
              <SuryaWordmark className="text-4xl sm:text-6xl md:text-7xl text-on-surface" />
            </div>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg mx-auto">
              A private URL shortening platform built for speed, reliability, and
              simplicity. Every link, tracked. Every redirect, instant.
            </p>
          </motion.div>


        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          STATS BAND
          ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-outline-variant/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-wrap items-center justify-center divide-x divide-outline-variant/50">
            <StatItem value="&lt; 5ms" label="Redirect latency" delay={0} />
            <StatItem value="100%" label="Uptime SLA" delay={0.06} />
            <StatItem value="Private" label="No public access" delay={0.12} />
            <StatItem value="Crafted" label="Built with care" delay={0.18} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-outline-variant/60 bg-surface-container-lowest/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">

            {/* Brand column */}
            <div className="space-y-3">
              <SuryaWordmark className="text-xs text-on-surface" />
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs">
                A private, self-hosted URL shortening platform for internal team use.
                Not a public service.
              </p>
            </div>

            {/* Links column */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Links
              </p>
              <ul className="space-y-2">
                {[
                  { label: 'GitHub', href: 'https://github.com/Maybesurya', icon: Github },
                  { label: 'Website', href: 'https://maybesurya.com', icon: ExternalLink },
                  { label: 'Sign In', href: '/login', icon: ArrowRight, internal: true },
                ].map(({ label, href, icon: Icon, internal }) => (
                  <li key={label}>
                    {internal ? (
                      <Link
                        to={href}
                        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150"
                      >
                        <Icon className="w-3 h-3 opacity-60" />
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150"
                      >
                        <Icon className="w-3 h-3 opacity-60" />
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Attribution column */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Open Source
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This application is built upon the open-source{' '}
                <a
                  href="https://github.com/thedevs-network/kutt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-on-surface hover:underline underline-offset-2 transition-colors"
                >
                  Kutt
                </a>{' '}
                project and has been extensively modified and customized for personal internal use.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-on-surface-variant">
              © {new Date().getFullYear()} Surya. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:hi@maybesurya.com"
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              >
                hi@maybesurya.com
              </a>
              <span className="text-outline-variant">·</span>
              <a
                href="https://github.com/Maybesurya"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
