import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Link as LinkIcon,
  MousePointerClick,
  Globe,
  QrCode,
  Plus,
  Copy,
  Check,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Zap,
  Lock,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { linkService, domainService, getErrorMessage } from '../../services/api';
import { QRCodeModal } from '../links/QRCodeModal';
import { toast } from 'sonner';
import { staggerContainer, staggerChild } from '../../lib/motion';

// ─── Animated number counter ──────────────────────────────────────────────────
function AnimatedNumber({ value, isLoading }: { value: number; isLoading: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(0);

  useEffect(() => {
    if (isLoading || !ref.current) return;
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    gsap.fromTo(
      ref.current,
      { innerText: from },
      {
        innerText: to,
        duration: 1,
        ease: 'power2.out',
        snap: { innerText: 1 },
        onUpdate() {
          if (ref.current)
            ref.current.innerText = Math.round(Number(ref.current.innerText)).toLocaleString('en-US');
        },
      }
    );
  }, [value, isLoading]);

  if (isLoading) return <Skeleton className="h-7 w-16" />;
  return (
    <span ref={ref} className="text-2xl font-bold font-mono text-on-surface tracking-tight">
      {value.toLocaleString('en-US')}
    </span>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  icon,
  iconColor,
  isLoading,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  isLoading: boolean;
  trend?: string;
}) {
  return (
    <motion.div variants={staggerChild} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card hoverable className="space-y-3 bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/70 shadow-xs hover:border-primary/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</span>
          <div className={`p-2 rounded-xl ${iconColor}`}>{icon}</div>
        </div>
        <div className="flex items-end justify-between pt-1">
          <AnimatedNumber value={value} isLoading={isLoading} />
          {trend && !isLoading && (
            <span className="text-2xs font-mono font-semibold text-secondary flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main Dashboard Page Component ───────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const [quickUrl, setQuickUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQRUrl, setActiveQRUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: linksData, isLoading: isLinksLoading } = useQuery({
    queryKey: ['links', { limit: 5 }],
    queryFn: () => linkService.getLinks({ limit: 5 }),
  });

  const { data: domainsData, isLoading: isDomainsLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: domainService.getDomains,
  });

  const quickShortenMutation = useMutation({
    mutationFn: linkService.createLink,
    onSuccess: () => {
      toast.success('Short link created!');
      setQuickUrl('');
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleQuickShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    quickShortenMutation.mutate({ target: quickUrl.trim() });
  };

  const copyLink = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied link to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const totalLinks = linksData?.total ?? 0;
  const links = linksData?.data ?? [];
  const totalClicks = links.reduce((a, b) => a + (Number(b.visit_count) || 0), 0);
  const totalDomains = domainsData?.length ?? 1;
  const protectedLinks = links.filter((l) => !!l.password).length;

  return (
    <div className="space-y-8 pb-8 relative">
      {/* ── Background Grid Texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-on-surface) 1px, transparent 1px), linear-gradient(90deg, var(--color-on-surface) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Hero Page Header & Status Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-on-surface">Overview</h1>
            <Badge variant="indigo" className="font-mono text-[10px] uppercase tracking-widest">
              Live
            </Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Real-time telemetry and management for your short links
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/60">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>SSL Secured</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/60">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* ── Quick Shorten Card ── */}
      <Card className="border-primary/40 bg-surface-container-lowest/90 backdrop-blur-xl shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-32 h-32 text-primary" />
        </div>
        <form onSubmit={handleQuickShorten} className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
                Instant Shortener
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant hidden sm:inline-block">
              Paste long URL & hit Enter
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Input
              placeholder="Paste a destination URL to shorten (https://...)"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              className="flex-1 font-mono text-xs"
              required
            />
            <Button
              type="submit"
              variant="primary"
              isLoading={quickShortenMutation.isPending}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="shrink-0 font-medium text-xs h-10 px-5"
            >
              Create Short Link
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Metrics Grid ── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          label="Total Links"
          value={totalLinks}
          icon={<LinkIcon className="w-4 h-4" />}
          iconColor="bg-primary/10 text-primary"
          isLoading={isLinksLoading}
          trend="Active"
        />
        <MetricCard
          label="Total Clicks"
          value={totalClicks}
          icon={<MousePointerClick className="w-4 h-4" />}
          iconColor="bg-secondary/10 text-secondary"
          isLoading={isLinksLoading}
          trend="Realtime"
        />
        <MetricCard
          label="Domains"
          value={totalDomains}
          icon={<Globe className="w-4 h-4" />}
          iconColor="bg-tertiary/10 text-tertiary"
          isLoading={isDomainsLoading}
        />
        <MetricCard
          label="Protected Links"
          value={protectedLinks}
          icon={<Lock className="w-4 h-4" />}
          iconColor="bg-primary/10 text-primary"
          isLoading={isLinksLoading}
        />
      </motion.div>

      {/* ── Recent Links Section ── */}
      <Card padding="none" className="bg-surface-container-lowest/85 backdrop-blur-xl border border-outline-variant/70 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/70 bg-surface-container-low/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle>Recent Short Links</CardTitle>
            </div>
            <CardDescription className="mt-0.5">Your most recently created links & analytics</CardDescription>
          </div>
          <a
            href="/links"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Manage All Links <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {isLinksLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={<LinkIcon className="w-6 h-6" />}
            title="No links created yet"
            description="Shorten your first URL using the instant shortener box above."
          />
        ) : (
          <>
            {/* Mobile View (< sm) */}
            <div className="sm:hidden divide-y divide-outline-variant/60">
              {links.map((link) => (
                <div key={link.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs font-bold text-primary hover:underline break-all inline-flex items-center gap-1"
                    >
                      {link.link}
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                    <span className="text-2xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded-full text-on-surface shrink-0">
                      {link.visit_count} clicks
                    </span>
                  </div>
                  <p className="text-2xs text-on-surface-variant break-all line-clamp-1" title={link.target}>
                    {link.target}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => copyLink(link.link, link.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Copy link"
                    >
                      {copiedId === link.id ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setActiveQRUrl(link.link)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                      title="QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left data-table">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/70">
                    <th className="py-3 px-6 text-2xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      Short Link
                    </th>
                    <th className="py-3 px-6 text-2xs font-bold uppercase tracking-wider text-on-surface-variant font-mono">
                      Destination Target
                    </th>
                    <th className="py-3 px-6 text-2xs font-bold uppercase tracking-wider text-on-surface-variant text-right font-mono">
                      Visits
                    </th>
                    <th className="py-3 px-6 text-2xs font-bold uppercase tracking-wider text-on-surface-variant text-right font-mono">
                      Quick Actions
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="divide-y divide-outline-variant/50"
                >
                  {links.map((link) => (
                    <motion.tr
                      key={link.id}
                      variants={staggerChild}
                      className="hover:bg-surface-container/50 transition-colors group"
                    >
                      <td className="py-3.5 px-6">
                        <a
                          href={link.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
                        >
                          {link.link}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-80 transition-opacity text-primary" />
                        </a>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="text-xs text-on-surface-variant truncate max-w-sm block" title={link.target}>
                          {link.target}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="text-xs font-mono font-semibold text-on-surface bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant/40">
                          {link.visit_count}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyLink(link.link, link.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                            title="Copy short link"
                          >
                            {copiedId === link.id
                              ? <Check className="w-3.5 h-3.5 text-secondary" />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setActiveQRUrl(link.link)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Generate QR code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* QR Code Modal */}
      {activeQRUrl && (
        <QRCodeModal
          isOpen={!!activeQRUrl}
          onClose={() => setActiveQRUrl(null)}
          url={activeQRUrl}
        />
      )}
    </div>
  );
};
