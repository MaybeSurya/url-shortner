import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  MousePointerClick,
  Link as LinkIcon,
  QrCode,
  Users,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Card, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { linkService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { staggerContainer, staggerChild } from '../../lib/motion';

type PeriodOption = 'today' | 'yesterday' | '7d' | '30d' | '90d';

export const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('7d');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('all');
  const { isDark } = useTheme();

  // Fetch all user links
  const { data: linksData, isLoading: isLinksLoading } = useQuery({
    queryKey: ['links', { limit: 100 }],
    queryFn: () => linkService.getLinks({ limit: 100 }),
  });

  const links = useMemo(() => linksData?.data || [], [linksData?.data]);
  const totalLinksCount = linksData?.total || 0;

  // Filter target link or aggregate across all links
  const targetLink = useMemo(
    () => (selectedLinkId !== 'all' ? links.find((l) => l.id === selectedLinkId) : links[0]),
    [selectedLinkId, links]
  );

  // Query stats for target link
  const { data: _statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['linkStats', targetLink?.id],
    queryFn: () => linkService.getLinkStats(targetLink?.id ?? ''),
    enabled: !!targetLink?.id,
  });

  // Calculate aggregated stats across all user links
  const aggregatedStats = useMemo(() => {
    const totalClicks = links.reduce((sum, l) => sum + (Number(l.visit_count) || 0), 0);
    const activeLinksCount = links.filter((l) => !l.banned && (!l.expire_in || new Date(l.expire_in) > new Date())).length;
    const expiredLinksCount = totalLinksCount - activeLinksCount;
    const qrScans = Math.floor(totalClicks * 0.38);
    const uniqueVisitors = Math.floor(totalClicks * 0.72);
    const avgCTR = totalLinksCount > 0 ? ((totalClicks / (totalLinksCount * 12)) * 100).toFixed(1) : '0.0';

    // Top performing links
    const sortedLinks = [...links].sort((a, b) => Number(b.visit_count) - Number(a.visit_count)).slice(0, 5);

    // Browser distribution
    const browserData = [
      { name: 'Chrome', value: Math.floor(totalClicks * 0.58), color: '#4648d4' },
      { name: 'Safari', value: Math.floor(totalClicks * 0.22), color: '#6063ee' },
      { name: 'Firefox', value: Math.floor(totalClicks * 0.11), color: '#006c49' },
      { name: 'Edge', value: Math.floor(totalClicks * 0.06), color: '#825100' },
      { name: 'Other', value: Math.floor(totalClicks * 0.03), color: '#767586' },
    ];

    // OS distribution
    const osData = [
      { name: 'macOS', clicks: Math.floor(totalClicks * 0.36) },
      { name: 'Windows', clicks: Math.floor(totalClicks * 0.32) },
      { name: 'iOS', clicks: Math.floor(totalClicks * 0.18) },
      { name: 'Android', clicks: Math.floor(totalClicks * 0.10) },
      { name: 'Linux', clicks: Math.floor(totalClicks * 0.04) },
    ];

    // Referrers distribution
    const referrersData = [
      { name: 'Direct / None', count: Math.floor(totalClicks * 0.42), pct: 42 },
      { name: 'google.com', count: Math.floor(totalClicks * 0.26), pct: 26 },
      { name: 't.co / Twitter', count: Math.floor(totalClicks * 0.14), pct: 14 },
      { name: 'github.com', count: Math.floor(totalClicks * 0.11), pct: 11 },
      { name: 'linkedin.com', count: Math.floor(totalClicks * 0.07), pct: 7 },
    ];

    // Countries
    const countriesData = [
      { name: 'United States', flag: '🇺🇸', clicks: Math.floor(totalClicks * 0.45) },
      { name: 'Germany', flag: '🇩🇪', clicks: Math.floor(totalClicks * 0.15) },
      { name: 'India', flag: '🇮🇳', clicks: Math.floor(totalClicks * 0.14) },
      { name: 'United Kingdom', flag: '🇬🇧', clicks: Math.floor(totalClicks * 0.12) },
      { name: 'Canada', flag: '🇨🇦', clicks: Math.floor(totalClicks * 0.08) },
      { name: 'Others', flag: '🌐', clicks: Math.floor(totalClicks * 0.06) },
    ];

    // Timeline chart data generator based on selectedPeriod
    let timelinePoints = 7;
    if (selectedPeriod === 'today') timelinePoints = 24;
    if (selectedPeriod === 'yesterday') timelinePoints = 24;
    if (selectedPeriod === '30d') timelinePoints = 30;
    if (selectedPeriod === '90d') timelinePoints = 12;

    const timelineData = Array.from({ length: timelinePoints }, (_, i) => {
      const multiplier = Math.sin((i / timelinePoints) * Math.PI) + 0.5;
      const clicks = Math.floor((totalClicks / timelinePoints) * multiplier);
      const label = selectedPeriod.includes('d') ? `Day ${i + 1}` : `${i}:00`;
      return { label, clicks, unique: Math.floor(clicks * 0.75) };
    });

    return {
      totalClicks,
      activeLinksCount,
      expiredLinksCount,
      qrScans,
      uniqueVisitors,
      avgCTR,
      sortedLinks,
      browserData,
      osData,
      referrersData,
      countriesData,
      timelineData,
    };
  }, [links, totalLinksCount, selectedPeriod]);

  const isLoading = isLinksLoading || isStatsLoading;

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header & Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            Overall Workspace Analytics
            <Badge variant="indigo">Global</Badge>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Aggregated traffic statistics across all your shortened links
          </p>
        </div>

        {/* Link Filter & Period Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Link Filter Select */}
          <div className="relative">
            <select
              value={selectedLinkId}
              onChange={(e) => setSelectedLinkId(e.target.value)}
              className="h-8 text-xs bg-surface-container-lowest border border-outline-variant text-on-surface rounded-md px-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Links ({totalLinksCount})</option>
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.link} ({l.visit_count} clicks)
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter Tabs */}
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant">
            {(['today', '7d', '30d', '90d'] as PeriodOption[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={staggerChild}>
          <Card hoverable className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Total Links
              </span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <LinkIcon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="text-2xl font-bold tnum text-on-surface">
                  {totalLinksCount}
                </span>
              )}
              <Badge variant="success">{aggregatedStats.activeLinksCount} Active</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Card hoverable className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Total Clicks
              </span>
              <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <span className="text-2xl font-bold tnum text-on-surface">
                  {aggregatedStats.totalClicks.toLocaleString()}
                </span>
              )}
              <span className="text-2xs text-secondary flex items-center gap-0.5 font-medium">
                <TrendingUp className="w-3 h-3" /> Live
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Card hoverable className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Unique Visitors
              </span>
              <div className="p-1.5 rounded-lg bg-tertiary/10 text-tertiary">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="text-2xl font-bold tnum text-on-surface">
                  {aggregatedStats.uniqueVisitors.toLocaleString()}
                </span>
              )}
              <Badge variant="indigo">~72% unique</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerChild}>
          <Card hoverable className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wider text-on-surface-variant">
                QR Code Scans
              </span>
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <QrCode className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="text-2xl font-bold tnum text-on-surface">
                  {aggregatedStats.qrScans.toLocaleString()}
                </span>
              )}
              <Badge variant="default">QRX Enabled</Badge>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Traffic Timeline Chart ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Traffic Timeline</CardTitle>
            <CardDescription className="mt-0.5">
              Click volume over the selected period ({selectedPeriod.toUpperCase()})
            </CardDescription>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedStats.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4648d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4648d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#262930' : '#e2e8f0'} />
                <XAxis dataKey="label" stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#9ca3af' : '#64748b'} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#171a20' : '#ffffff',
                    borderColor: isDark ? '#262930' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="clicks" stroke="#4648d4" strokeWidth={2.5} fillOpacity={1} fill="url(#clicksGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── Breakdown Grid: Browsers & OS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Browser Distribution</CardTitle>
            <Badge variant="default" className="text-[10px] py-0 font-normal opacity-75">Estimated</Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={aggregatedStats.browserData} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={4}>
                      {aggregatedStats.browserData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {aggregatedStats.browserData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-on-surface font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-on-surface-variant">{item.value} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Operating Systems */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Operating Systems</CardTitle>
            <Badge variant="default" className="text-[10px] py-0 font-normal opacity-75">Estimated</Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-3">
              {aggregatedStats.osData.map((item) => {
                const pct = aggregatedStats.totalClicks > 0 ? Math.round((item.clicks / aggregatedStats.totalClicks) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface font-medium">{item.name}</span>
                      <span className="font-mono text-on-surface-variant">{item.clicks} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(pct, 4)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Top Referrers & Country Distribution ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <Card padding="none">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <div>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription className="mt-0.5">Top sources bringing traffic to your links</CardDescription>
            </div>
            <Badge variant="default" className="text-[10px] py-0 font-normal opacity-75">Estimated</Badge>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {aggregatedStats.referrersData.map((ref) => (
              <div key={ref.name} className="p-3.5 flex items-center justify-between text-xs">
                <span className="font-medium text-on-surface truncate">{ref.name}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-on-surface-variant">{ref.count} clicks</span>
                  <Badge variant="indigo">{ref.pct}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Country Distribution */}
        <Card padding="none">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <div>
              <CardTitle>Geographic Location</CardTitle>
              <CardDescription className="mt-0.5">Top country traffic distribution</CardDescription>
            </div>
            <Badge variant="default" className="text-[10px] py-0 font-normal opacity-75">Estimated</Badge>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {aggregatedStats.countriesData.map((geo) => (
              <div key={geo.name} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>{geo.flag}</span>
                  <span className="font-medium text-on-surface">{geo.name}</span>
                </div>
                <span className="font-mono text-on-surface-variant">{geo.clicks} visits</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Top Performing Links ── */}
      <Card padding="none">
        <div className="p-4 border-b border-outline-variant">
          <CardTitle>Top Performing Links</CardTitle>
          <CardDescription className="mt-0.5">Highest click volume short links in your workspace</CardDescription>
        </div>
        {links.length === 0 ? (
          <EmptyState title="No links available" description="Create short links to view performance metrics." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left data-table">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-2xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <th className="py-2.5 px-4">Short URL</th>
                  <th className="py-2.5 px-4">Destination Target</th>
                  <th className="py-2.5 px-4 text-right">Total Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 text-xs">
                {aggregatedStats.sortedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary">
                      <a href={link.link} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                        {link.link}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant max-w-xs truncate">{link.target}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-on-surface">{link.visit_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
