import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  Github,
  Zap,
  BarChart3,
  Shield,
  Link2,
  Copy,
  Check,
  Globe,
  Lock,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// ─── Wordmark ─────────────────────────────────────────────────────────────────
const SuryaWordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`font-mono font-bold tracking-[0.18em] uppercase select-none ${className}`}
    style={{ letterSpacing: '0.2em' }}
  >
    SURYA
  </span>
);

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedNumber: React.FC<{ target: number; suffix?: string; prefix?: string }> = ({
  target, suffix = '', prefix = ''
}) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / 60);
      const interval = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(interval);
      }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  desc: string;
  accent?: string;
}> = ({ icon: Icon, title, desc, accent = 'text-primary' }) => (
  <div className="group relative p-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest/80 hover:border-primary/40 hover:bg-surface-container-low transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 bg-surface-container ${accent} border border-outline-variant/60`}>
      <Icon className="w-4 h-4" />
    </div>
    <h3 className="text-sm font-semibold text-on-surface mb-1.5">{title}</h3>
    <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
  </div>
);

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-outline-variant/60 rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        {q}
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 shrink-0 text-on-surface-variant" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/40 pt-3 bg-surface-container-lowest/50">
          {a}
        </div>
      )}
    </div>
  );
};

// ─── Demo URL Shortener ───────────────────────────────────────────────────────
const DemoShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setResult(`sury.cc/${Math.random().toString(36).slice(2, 7)}`);
    setSubmitted(true);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`https://${result}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://your-long-url.com/paste-here"
          className="flex-1 h-11 px-4 rounded-xl border border-outline-variant/70 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button
          type="submit"
          className="h-11 px-5 rounded-xl bg-on-surface text-surface-container-lowest text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          Shorten
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
      {submitted && result && (
        <div className="mt-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
          <span className="font-mono text-sm text-primary font-semibold">{result}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      {submitted && (
        <p className="text-center text-[11px] text-on-surface-variant mt-2 opacity-70">
          ✨ Demo only — sign in to create real short links
        </p>
      )}
    </div>
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

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  const features = [
    { icon: Zap, title: 'Lightning-fast Redirects', desc: 'Sub-5ms redirect latency powered by Redis in-memory caching and optimized edge delivery.', accent: 'text-amber-500' },
    { icon: BarChart3, title: 'Rich Analytics', desc: 'Track clicks, referrers, countries, devices, and browsers with a beautiful realtime dashboard.', accent: 'text-blue-500' },
    { icon: Globe, title: 'Custom Domains', desc: 'Bring your own domain — any short link can be served under your own branded hostname.', accent: 'text-emerald-500' },
    { icon: Lock, title: 'Password Protection', desc: 'Secure any short link with a password so only authorized people can follow the redirect.', accent: 'text-violet-500' },
    { icon: Clock, title: 'Link Expiration', desc: 'Set an expiry time on links — automatically deactivated after the deadline you choose.', accent: 'text-rose-500' },
    { icon: Shield, title: 'Abuse & Spam Protection', desc: 'Malicious links are banned immediately. Rate limiting and domain blocklists keep the platform clean.', accent: 'text-orange-500' },
  ];

  const faqs = [
    { q: 'Is this a public URL shortener?', a: 'No. SURYA is a private, self-hosted URL shortening platform. You need an invitation or admin approval to create an account and generate short links.' },
    { q: 'How fast are the redirects?', a: 'Redirect lookups hit an in-memory cache (Redis + local L1 Map) before touching the database. Most redirects resolve in under 5ms.' },
    { q: 'Can I use my own custom domain?', a: 'Yes. Admins can configure custom domains that map to specific short links, served under any hostname you point at this server.' },
    { q: 'What analytics are collected?', a: 'We log the click timestamp, country, city, referrer, browser, OS, and device type for each visit. No personally identifiable information like IP addresses are stored long-term.' },
    { q: 'What happens to expired or banned links?', a: 'Expired links automatically stop redirecting. Banned links (detected as malware/phishing) are removed and serve a warning page instead.' },
    { q: 'How do I report a malicious short link?', a: 'Email abuse@maybesurya.dev with the full short link URL and as much context as possible. We review all reports within 24 hours.' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-x-hidden flex flex-col">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

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
      <header className="sticky top-0 z-50 w-full">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between h-12 px-4 rounded-xl border border-outline-variant/70 bg-surface-container-lowest/85 backdrop-blur-xl shadow-xs">
            <Link to="/" aria-label="SURYA home" className="group flex items-center">
              <SuryaWordmark className="text-sm text-on-surface group-hover:text-primary transition-colors duration-200" />
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Stats', href: '#stats' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Report Abuse', href: '#report-abuse' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-all duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={cycleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all duration-150"
                aria-label={`Current theme: ${theme}. Click to cycle.`}
                title={`Theme: ${theme}`}
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

      <main id="main-content" className="flex-1 flex flex-col">

        {/* ── HERO ── */}
        <section aria-labelledby="hero-title" className="flex items-center justify-center px-4 sm:px-6 py-24 md:py-36">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide text-on-surface-variant border border-outline-variant/80 bg-surface-container-low/60">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Internal Platform · Private Access
              </span>
            </div>
            <div className="space-y-5">
              <h1 id="hero-title" className="flex items-center justify-center">
                <SuryaWordmark className="text-4xl sm:text-6xl md:text-7xl text-on-surface" />
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg mx-auto">
                A private URL shortening platform built for speed, reliability, and
                simplicity. Every link, tracked. Every redirect, instant.
              </p>
            </div>

            {/* Demo shortener */}
            <DemoShortener />

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-on-surface text-surface-container-lowest text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                Sign In to Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS BAND ── */}
        <section id="stats" aria-label="Platform statistics" className="border-y border-outline-variant/60 bg-surface-container-lowest/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-outline-variant/50">
              {[
                { value: 5, suffix: 'ms', prefix: '<', label: 'Redirect latency' },
                { value: 100, suffix: '%', label: 'Uptime SLA' },
                { value: 19, suffix: '', label: 'Links created' },
                { value: 45, suffix: '', label: 'Total visits tracked' },
              ].map(({ value, suffix, prefix, label }) => (
                <div key={label} className="flex flex-col items-center gap-0.5 px-6 text-center transition-transform hover:scale-105">
                  <span className="text-2xl md:text-3xl font-semibold font-mono text-on-surface tracking-tight">
                    {prefix}<AnimatedNumber target={value} suffix={suffix} />
                  </span>
                  <span className="text-xs text-on-surface-variant">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" aria-labelledby="features-title" className="px-4 sm:px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant px-2.5 py-1 rounded-full border border-outline-variant/60 bg-surface-container-low/50">
                <Zap className="w-3 h-3" /> Platform Features
              </span>
              <h2 id="features-title" className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Everything a URL shortener should be
              </h2>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                Not just a redirect — a full link management platform with analytics, security, and control.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(f => <FeatureCard key={f.title} {...f} />)}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section aria-labelledby="how-title" className="px-4 sm:px-6 py-20 border-t border-outline-variant/60">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant px-2.5 py-1 rounded-full border border-outline-variant/60 bg-surface-container-low/50">
                <Link2 className="w-3 h-3" /> How it Works
              </span>
              <h2 id="how-title" className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                From long URL to short link in seconds
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Paste your URL', desc: 'Drop any long URL — internal tools, docs, dashboards — into the shortener input.' },
                { step: '02', title: 'Customize & configure', desc: 'Set a custom alias, add a password, or set an expiry date. All optional.' },
                { step: '03', title: 'Share & track', desc: 'Share the short link and watch clicks, countries, and referrers stream in live.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="relative p-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest/80">
                  <span className="font-mono text-3xl font-black text-outline-variant/40 select-none">{step}</span>
                  <h3 className="text-sm font-semibold text-on-surface mt-2 mb-1.5">{title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" aria-labelledby="faq-title" className="px-4 sm:px-6 py-20 border-t border-outline-variant/60">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 space-y-3">
              <h2 id="faq-title" className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-on-surface-variant">
                Everything you need to know about the platform.
              </p>
            </div>
            <div className="space-y-3">
              {faqs.map(faq => <FAQItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </section>

        {/* ── REPORT ABUSE ── */}
        <section id="report-abuse" aria-labelledby="abuse-title" className="px-4 sm:px-6 py-20 border-t border-outline-variant/60">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-8 text-center space-y-5">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 id="abuse-title" className="text-xl font-bold text-on-surface tracking-tight">
                  Report Abuse
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-md mx-auto">
                  Found a short link being used for spam, phishing, or malware? Please report it immediately.
                  We take all abuse reports seriously and respond within <strong className="text-on-surface">24 hours</strong>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="mailto:abuse@maybesurya.dev?subject=Abuse%20Report%20%E2%80%94%20SURYA%20URL%20Shortener&body=Short%20link%20URL%3A%0A%0ADescription%20of%20abuse%3A%0A%0AAdditional%20context%3A"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 active:scale-95 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Send Abuse Report
                </a>
                <a
                  href="mailto:abuse@maybesurya.dev"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-xl border border-outline-variant/70 text-on-surface-variant hover:bg-surface-container text-sm font-medium transition-all"
                >
                  abuse@maybesurya.dev
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-on-surface-variant/60">
                Include the full short link URL and as much context as possible in your email.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <section className="px-4 sm:px-6 py-20 border-t border-outline-variant/60">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Ready to shorten your first link?
            </h2>
            <p className="text-sm text-on-surface-variant">
              Sign in to your workspace and start managing your links.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 h-11 px-8 rounded-xl bg-on-surface text-surface-container-lowest text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Sign In to Workspace <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-outline-variant/60 bg-surface-container-lowest/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
            <div className="md:col-span-2 space-y-3">
              <SuryaWordmark className="text-xs text-on-surface" />
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs">
                A private, self-hosted URL shortening platform for internal use.
                Not a public service.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Platform</p>
              <ul className="space-y-2">
                {[
                  { label: 'Sign In', href: '/login', internal: true },
                  { label: 'GitHub', href: 'https://github.com/Maybesurya', icon: Github },
                  { label: 'Website', href: 'https://maybesurya.dev', icon: ExternalLink },
                ].map(({ label, href, internal, icon: Icon }) => (
                  <li key={label}>
                    {internal ? (
                      <Link to={href} className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150">
                        <ArrowRight className="w-3 h-3 opacity-60" />
                        {label}
                      </Link>
                    ) : (
                      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150">
                        {Icon && <Icon className="w-3 h-3 opacity-60" />}
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">Contact</p>
              <ul className="space-y-2">
                {[
                  { label: 'hi@maybesurya.dev', href: 'mailto:hi@maybesurya.dev' },
                  { label: 'abuse@maybesurya.dev', href: 'mailto:abuse@maybesurya.dev' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors duration-150">
                      <ExternalLink className="w-3 h-3 opacity-60" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-outline-variant/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-on-surface-variant">
              © {new Date().getFullYear()} Surya. All rights reserved.
            </p>
            <p className="text-xs text-on-surface-variant">
              Built on{' '}
              <a
                href="https://github.com/thedevs-network/kutt"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline underline-offset-2"
              >
                Kutt
              </a>
              {' '}— extensively modified for personal use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
