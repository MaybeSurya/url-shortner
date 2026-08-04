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

// ─── Animated counter ───────────────────────────────────────
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
    <span ref={ref} className="text-2xl font-bold tnum text-on-surface">
      {value.toLocaleString('en-US')}
    </span>
  );
}

// ─── Metric card ────────────────────────────────────────────
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
    <motion.div variants={staggerChild}>
      <Card hoverable className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-on-surface-variant">{label}</span>
          <div className={`p-1.5 rounded-lg ${iconColor}`}>{icon}</div>
        </div>
        <div className="flex items-end justify-between">
          <AnimatedNumber value={value} isLoading={isLoading} />
          {trend && !isLoading && (
            <span className="text-2xs text-secondary flex items-center gap-0.5 mb-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────
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
      toast.success('Copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const totalLinks = linksData?.total ?? 0;
  const links = linksData?.data ?? [];
  const totalClicks = links.reduce((a, b) => a + (Number(b.visit_count) || 0), 0);
  const totalDomains = domainsData?.length ?? 1;
  const protectedLinks = links.filter((l) => !!l.password).length;

  return (
    <div className="space-y-8 pb-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-lg font-semibold text-on-surface">Overview</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Your link performance at a glance
        </p>
      </div>

      {/* ── Quick shorten ── */}
      <Card className="border-primary/30">
        <form onSubmit={handleQuickShorten}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Quick Shorten
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Paste a URL to shorten…"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              variant="primary"
              isLoading={quickShortenMutation.isPending}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="shrink-0"
            >
              Shorten
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Metrics ── */}
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
          trend="active"
        />
        <MetricCard
          label="Total Clicks"
          value={totalClicks}
          icon={<MousePointerClick className="w-4 h-4" />}
          iconColor="bg-secondary/10 text-secondary"
          isLoading={isLinksLoading}
          trend="realtime"
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

      {/* ── Recent links table ── */}
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
          <div>
            <CardTitle>Recent Links</CardTitle>
            <CardDescription className="mt-0.5">Your most recently created short links</CardDescription>
          </div>
          <a
            href="/links"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        {isLinksLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={<LinkIcon className="w-5 h-5" />}
            title="No links yet"
            description="Create your first short link using the form above."
          />
        ) : (
          <>
            {/* Mobile View (< sm) */}
            <div className="sm:hidden divide-y divide-outline-variant/60">
              {links.map((link) => (
                <div key={link.id} className="p-4 space-y-2">
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
                    <span className="text-xs font-mono font-bold bg-surface-container px-2 py-0.5 rounded-full text-on-surface shrink-0">
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

            {/* Desktop View (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left data-table">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-2.5 px-5 text-2xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Short Link
                    </th>
                    <th className="py-2.5 px-5 text-2xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Destination
                    </th>
                    <th className="py-2.5 px-5 text-2xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">
                      Visits
                    </th>
                    <th className="py-2.5 px-5 text-2xs font-semibold uppercase tracking-wider text-on-surface-variant text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="divide-y divide-outline-variant/60"
                >
                  {links.map((link) => (
                    <motion.tr
                      key={link.id}
                      variants={staggerChild}
                      className="hover:bg-surface-container/40 transition-colors group"
                    >
                      <td className="py-3 px-5">
                        <a
                          href={link.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {link.link}
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-70 transition-opacity" />
                        </a>
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-xs text-on-surface-variant truncate max-w-xs block" title={link.target}>
                          {link.target}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="text-sm font-semibold tnum text-on-surface">
                          {link.visit_count}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyLink(link.link, link.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                            title="Copy link"
                          >
                            {copiedId === link.id
                              ? <Check className="w-3.5 h-3.5 text-secondary" />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setActiveQRUrl(link.link)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                            title="QR Code"
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
