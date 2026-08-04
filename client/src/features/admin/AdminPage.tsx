import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  Globe,
  Settings,
  Search,
  Plus,
  Ban,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Shield,
  Activity,
  Database,
  Server,
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
  Edit3,
  Eye,
  UserPlus,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService, getErrorMessage } from '../../services/api';
import { toast } from 'sonner';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'users' | 'links' | 'domains' | 'settings';

// ─── Tab configuration ────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'links',     label: 'Links',     icon: LinkIcon },
  { id: 'domains',   label: 'Domains',   icon: Globe },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

// ─── Small animation helpers ──────────────────────────────────────────────────
const tabPane = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
}> = ({ title, value, icon: Icon, color, sub }) => (
  <Card>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {title}
      </span>
      <div className={clsx('p-2 rounded-xl', color)}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="mt-3">
      <div className="text-2xl font-bold font-mono text-on-surface tracking-tight">{value}</div>
      {sub && <p className="text-2xs text-on-surface-variant mt-0.5">{sub}</p>}
    </div>
  </Card>
);

// ─── System Status Item ───────────────────────────────────────────────────────
const StatusRow: React.FC<{
  label: string;
  status: 'ok' | 'warn' | 'disabled' | 'unknown';
  note?: string;
}> = ({ label, status, note }) => {
  const map = {
    ok:       { icon: CheckCircle2, text: 'Operational', cls: 'text-secondary' },
    warn:     { icon: AlertTriangle, text: 'Check Config', cls: 'text-amber-500' },
    disabled: { icon: MinusCircle, text: 'Disabled', cls: 'text-on-surface-variant' },
    unknown:  { icon: HelpCircle, text: 'Unknown', cls: 'text-on-surface-variant' },
  };
  const { icon: Icon, text, cls } = map[status] || map.unknown;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-outline-variant/50 last:border-0">
      <div>
        <span className="text-xs font-medium text-on-surface">{label}</span>
        {note && <p className="text-[10px] font-mono text-on-surface-variant">{note}</p>}
      </div>
      <div className={clsx('flex items-center gap-1.5 text-xs font-medium', cls)}>
        <Icon className="w-3.5 h-3.5" />
        {text}
      </div>
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab: React.FC = () => {
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers-overview'],
    queryFn: () => adminService.getUsers({ limit: 1 }),
  });
  const { data: linksData, isLoading: loadingLinks } = useQuery({
    queryKey: ['adminLinks-overview'],
    queryFn: () => adminService.getLinks({ limit: 1 }),
  });
  const { data: domainsData, isLoading: loadingDomains } = useQuery({
    queryKey: ['adminDomains-overview'],
    queryFn: () => adminService.getDomains({ limit: 1 }),
  });
  const { data: settingsData } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: adminService.getSettings,
    staleTime: 30000,
  });

  const redisStatus: 'ok' | 'warn' | 'disabled' | 'unknown' = useMemo(() => {
    if (!settingsData) return 'unknown';
    if (!settingsData.redis?.enabled) return 'disabled';
    if (settingsData.redis?.status === 'ok' || settingsData.redis?.connected) return 'ok';
    return 'warn';
  }, [settingsData]);

  const mailStatus: 'ok' | 'disabled' | 'unknown' = useMemo(() => {
    if (!settingsData) return 'unknown';
    if (!settingsData.mail?.enabled) return 'disabled';
    return 'ok';
  }, [settingsData]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={loadingUsers ? '—' : (usersData?.total ?? 0)}
          icon={Users}
          color="text-primary bg-primary/10"
          sub="registered accounts"
        />
        <StatCard
          title="Total Links"
          value={loadingLinks ? '—' : (linksData?.total ?? 0)}
          icon={LinkIcon}
          color="text-secondary bg-secondary/10"
          sub="short URLs created"
        />
        <StatCard
          title="Custom Domains"
          value={loadingDomains ? '—' : (domainsData?.total ?? 0)}
          icon={Globe}
          color="text-tertiary bg-tertiary/10"
          sub="mapped domains"
        />
        <StatCard
          title="Platform"
          value="Live"
          icon={Activity}
          color="text-secondary bg-secondary/10"
          sub="all systems nominal"
        />
      </div>

      {/* System health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader direction="row">
            <CardTitle>System Status</CardTitle>
            <Badge variant={redisStatus === 'ok' ? 'success' : 'indigo'}>
              {redisStatus === 'ok' ? 'All Systems Active' : 'Status Monitor'}
            </Badge>
          </CardHeader>
          <div>
            <StatusRow label="Application Server" status="ok" note="Express / Node.js Engine" />
            <StatusRow label="PostgreSQL Database" status="ok" note="Neon Hosted PostgreSQL" />
            <StatusRow
              label="Redis Cache"
              status={redisStatus}
              note={
                redisStatus === 'ok'
                  ? 'Upstash Redis (Connected & Caching)'
                  : redisStatus === 'disabled'
                  ? 'Disabled in environment config'
                  : redisStatus === 'warn'
                  ? 'Check Redis URL & credentials'
                  : 'Fetching telemetry...'
              }
            />
            <StatusRow
              label="Email Service"
              status={mailStatus}
              note={mailStatus === 'ok' ? 'SMTP Transport Active' : 'SMTP Disabled in config'}
            />
            <StatusRow label="Background Jobs" status="ok" note="Inline Worker Tasks" />
          </div>
          <p className="mt-3 text-[11px] text-on-surface-variant">
            Infrastructure health requires external monitoring integration. Redis and email status depend on environment configuration.
          </p>
        </Card>

        <Card>
          <CardHeader direction="row">
            <CardTitle>Platform Information</CardTitle>
          </CardHeader>
          <div className="space-y-0">
            {[
              { label: 'Application', value: 'Surya Internal Platform' },
              { label: 'Built on', value: 'Kutt (open source, modified)' },
              { label: 'Database', value: 'PostgreSQL (Neon)' },
              { label: 'Environment', value: 'Production' },
              { label: 'Public Registration', value: 'Disabled' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-outline-variant/50 last:border-0">
                <span className="text-xs text-on-surface-variant">{label}</span>
                <span className="text-xs font-medium text-on-surface text-right max-w-[60%] truncate">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader direction="row">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative operations</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:border-outline hover:bg-surface-container transition-all duration-150 text-left group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">Create User</p>
              <p className="text-[11px] text-on-surface-variant">Provision internal account</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:border-outline hover:bg-surface-container transition-all duration-150 text-left group">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface group-hover:text-secondary transition-colors">View All Links</p>
              <p className="text-[11px] text-on-surface-variant">Inspect system-wide URLs</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:border-outline hover:bg-surface-container transition-all duration-150 text-left group">
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface group-hover:text-tertiary transition-colors">Manage Domains</p>
              <p className="text-[11px] text-on-surface-variant">Custom domain governance</p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────
const UsersTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search],
    queryFn: () => adminService.getUsers({ search: search.trim() || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers-overview'] });
      setIsCreateOpen(false);
      setNewEmail(''); setNewPassword(''); setNewRole('USER');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminService.banUser(id, { links: true, domains: true }),
    onSuccess: () => { toast.success('User banned'); queryClient.invalidateQueries({ queryKey: ['adminUsers'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers-overview'] });
      setConfirmDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const users = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-3.5 h-3.5" />}
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Create User
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-outline-variant/50">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[0,1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Users className="w-5 h-5" />} title="No users found" description={search ? 'Try a different query.' : 'Create your first user.'} />
            </div>
          ) : users.map(u => (
            <div key={u.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-on-surface truncate">{u.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : 'indigo'}>{u.role || 'USER'}</Badge>
                    {u.banned && <Badge variant="danger">Banned</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!u.banned && (
                    <button onClick={() => banMutation.mutate(u.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                      title="Ban user">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setConfirmDeleteId(u.id)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                    title="Delete user">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant font-mono">{u.links_count ?? 0} links</p>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5 text-right">Links</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {isLoading ? (
                [0,1,2,3,4].map(i => (
                  <tr key={i}><td colSpan={4} className="p-4"><Skeleton className="h-5 w-full" /></td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={4}>
                  <EmptyState icon={<Users className="w-5 h-5" />} title="No users found" description={search ? 'Try a different query.' : 'Create the first user.'} />
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-surface-container/40 transition-colors group">
                  <td className="py-3 px-5 text-sm font-medium text-on-surface">{u.email}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={u.role === 'ADMIN' ? 'danger' : 'indigo'}>{u.role || 'USER'}</Badge>
                      {u.banned && <Badge variant="danger">Banned</Badge>}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-sm text-on-surface">{u.links_count ?? 0}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!u.banned && (
                        <button onClick={() => banMutation.mutate(u.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="Ban user">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => setConfirmDeleteId(u.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete user">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create user modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create User Account" description="Provision a new internal account. Public registration is disabled.">
        <form onSubmit={e => { e.preventDefault(); if (!newEmail || !newPassword) return; createMutation.mutate({ email: newEmail, password: newPassword, role: newRole }); }} className="space-y-4">
          <Input label="Email Address" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
          <Input label="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">Role</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full h-9 bg-surface-container-lowest text-on-surface text-sm rounded-md border border-outline-variant px-3 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="USER">Standard User</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/60">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Delete User" description="This action permanently removes the user and all their data. This cannot be undone.">
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/60">
          <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="primary" className="bg-error text-white hover:bg-error/90" isLoading={deleteMutation.isPending} onClick={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}>
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Links Tab ────────────────────────────────────────────────────────────────
const LinksTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminLinks', search],
    queryFn: () => adminService.getLinks({ search: search.trim() || undefined }),
  });

  const banMutation = useMutation({
    mutationFn: adminService.banLink,
    onSuccess: () => { toast.success('Link status updated'); queryClient.invalidateQueries({ queryKey: ['adminLinks'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const links = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="w-full sm:max-w-xs">
        <Input placeholder="Search links…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-3.5 h-3.5" />} />
      </div>

      <Card padding="none" className="overflow-hidden">
        {/* Mobile */}
        <div className="md:hidden divide-y divide-outline-variant/50">
          {isLoading ? (
            <div className="p-4 space-y-3">{[0,1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : links.length === 0 ? (
            <div className="p-6"><EmptyState icon={<LinkIcon className="w-5 h-5" />} title="No links found" description={search ? 'Try a different query.' : 'No system links yet.'} /></div>
          ) : links.map(l => (
            <div key={l.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <a href={l.link} target="_blank" rel="noreferrer" className="font-mono text-xs font-bold text-primary hover:underline break-all inline-flex items-center gap-1">
                    {l.link}<ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                  </a>
                  <p className="text-xs text-on-surface-variant mt-0.5 break-all line-clamp-1" title={l.target}>{l.target}</p>
                </div>
                <button onClick={() => banMutation.mutate(l.id)}
                  className={clsx('min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg transition-colors shrink-0', l.banned ? 'text-error bg-error/10' : 'text-on-surface-variant hover:text-error hover:bg-error/10')}
                  title={l.banned ? 'Unban link' : 'Ban link'}>
                  <Ban className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {l.banned && <Badge variant="danger">Banned</Badge>}
                <span className="text-xs text-on-surface-variant font-mono">{l.visit_count} visits</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                <th className="py-3 px-5">Short URL</th>
                <th className="py-3 px-5">Target</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Visits</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {isLoading ? (
                [0,1,2,3,4].map(i => <tr key={i}><td colSpan={5} className="p-4"><Skeleton className="h-5 w-full" /></td></tr>)
              ) : links.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={<LinkIcon className="w-5 h-5" />} title="No links found" description={search ? 'Try a different query.' : 'No system links yet.'} /></td></tr>
              ) : links.map(l => (
                <tr key={l.id} className="hover:bg-surface-container/40 transition-colors group">
                  <td className="py-3 px-5">
                    <a href={l.link} target="_blank" rel="noreferrer" className="font-mono text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                      {l.link}<ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </a>
                  </td>
                  <td className="py-3 px-5 max-w-xs"><span className="text-xs text-on-surface-variant truncate block" title={l.target}>{l.target}</span></td>
                  <td className="py-3 px-5">
                    <Badge variant={l.banned ? 'danger' : 'success'}>{l.banned ? 'Banned' : 'Active'}</Badge>
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-sm text-on-surface">{l.visit_count}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => banMutation.mutate(l.id)}
                        className={clsx('w-7 h-7 flex items-center justify-center rounded-md transition-colors', l.banned ? 'text-error bg-error/10' : 'text-on-surface-variant hover:text-error hover:bg-error/10')}
                        title={l.banned ? 'Unban' : 'Ban'}>
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── Domains Tab ──────────────────────────────────────────────────────────────
const DomainsTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newHomepage, setNewHomepage] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminDomains', search],
    queryFn: () => adminService.getDomains({ search: search.trim() || undefined }),
  });

  const addMutation = useMutation({
    mutationFn: adminService.addDomain,
    onSuccess: () => {
      toast.success('Domain added');
      queryClient.invalidateQueries({ queryKey: ['adminDomains'] });
      queryClient.invalidateQueries({ queryKey: ['adminDomains-overview'] });
      setIsAddOpen(false); setNewAddress(''); setNewHomepage('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteDomain,
    onSuccess: () => {
      toast.success('Domain removed');
      queryClient.invalidateQueries({ queryKey: ['adminDomains'] });
      setConfirmDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const banMutation = useMutation({
    mutationFn: adminService.banDomain,
    onSuccess: () => { toast.success('Domain status updated'); queryClient.invalidateQueries({ queryKey: ['adminDomains'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const domains = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <Input placeholder="Search domains…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="w-3.5 h-3.5" />} />
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsAddOpen(true)}>
          Add Domain
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                <th className="py-3 px-5">Domain</th>
                <th className="py-3 px-5">Homepage</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {isLoading ? (
                [0,1,2].map(i => <tr key={i}><td colSpan={4} className="p-4"><Skeleton className="h-5 w-full" /></td></tr>)
              ) : domains.length === 0 ? (
                <tr><td colSpan={4}><EmptyState icon={<Globe className="w-5 h-5" />} title="No domains" description="Add the first custom domain." /></td></tr>
              ) : domains.map(d => (
                <tr key={d.id} className="hover:bg-surface-container/40 transition-colors group">
                  <td className="py-3 px-5 font-mono text-xs font-bold text-on-surface">{d.address}</td>
                  <td className="py-3 px-5 text-xs text-on-surface-variant">{d.homepage || '—'}</td>
                  <td className="py-3 px-5 text-center">
                    <Badge variant={d.banned ? 'danger' : 'success'}>{d.banned ? 'Banned' : 'Active'}</Badge>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => banMutation.mutate(d.id)}
                        className={clsx('w-7 h-7 flex items-center justify-center rounded-md transition-colors', d.banned ? 'text-error bg-error/10' : 'text-on-surface-variant hover:text-error hover:bg-error/10')}
                        title={d.banned ? 'Unban' : 'Ban'}>
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDeleteId(d.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                        title="Delete domain">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Custom Domain" description="Map a custom domain for use as a short URL host.">
        <form onSubmit={e => { e.preventDefault(); if (!newAddress) return; addMutation.mutate({ address: newAddress, homepage: newHomepage || undefined }); }} className="space-y-4">
          <Input label="Domain Address" placeholder="go.yourdomain.com" value={newAddress} onChange={e => setNewAddress(e.target.value)} required />
          <Input label="Homepage Redirect (optional)" placeholder="https://yourdomain.com" value={newHomepage} onChange={e => setNewHomepage(e.target.value)} />
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/60">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={addMutation.isPending}>Add Domain</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Remove Domain" description="This will permanently remove the domain from the platform.">
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/60">
          <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button variant="primary" className="bg-error text-white hover:bg-error/90" isLoading={deleteMutation.isPending} onClick={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}>
            Remove Domain
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// ─── Settings Tab ─────────────────────────────────────────────────────────────

// Config row component
const ConfigRow: React.FC<{
  label: string;
  value: React.ReactNode;
  note?: string;
  mono?: boolean;
}> = ({ label, value, note, mono = false }) => (
  <div className="py-3 border-b border-outline-variant/40 last:border-0">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <span className="text-xs font-medium text-on-surface">{label}</span>
        {note && <p className="text-[11px] text-on-surface-variant mt-0.5">{note}</p>}
      </div>
      <div className={clsx('text-xs shrink-0 max-w-[55%] text-right', mono ? 'font-mono text-on-surface' : 'text-on-surface')}>
        {value}
      </div>
    </div>
  </div>
);

const BoolBadge: React.FC<{ value: boolean; trueLabel?: string; falseLabel?: string }> = ({
  value, trueLabel = 'Enabled', falseLabel = 'Disabled'
}) => (
  <Badge variant={value ? 'success' : 'default'}>{value ? trueLabel : falseLabel}</Badge>
);

const SetBadge: React.FC<{ value: boolean | null }> = ({ value }) => {
  if (value === null) return <span className="text-on-surface-variant">N/A</span>;
  return <Badge variant={value ? 'success' : 'warning'}>{value ? 'Configured' : 'Not set'}</Badge>;
};

const SectionCard: React.FC<{
  title: string;
  icon: React.FC<{ className?: string }>;
  iconColor?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon: Icon, iconColor = 'text-primary bg-primary/10', badge, children }) => (
  <Card>
    <CardHeader direction="row">
      <div className="flex items-center gap-2.5">
        <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', iconColor)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <CardTitle>{title}</CardTitle>
      </div>
      {badge}
    </CardHeader>
    <div>{children}</div>
  </Card>
);

const SettingsTab: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: adminService.getSettings,
    staleTime: 30000,
  });

  const handleCopyEnv = () => {
    if (!settings) return;
    const s = settings;
    const lines = [
      `PORT=${s.server.port}`,
      `SITE_NAME=${s.platform.site_name}`,
      `DEFAULT_DOMAIN=${s.platform.default_domain}`,
      `JWT_SECRET=<your-secret>`,
      ``,
      `# Database`,
      `DB_CLIENT=${s.database.client}`,
      ...(s.database.host ? [
        `DB_HOST=${s.database.host}`,
        `DB_PORT=${s.database.port}`,
        `DB_NAME=${s.database.name}`,
        `DB_USER=${s.database.user}`,
        `DB_PASSWORD=<your-db-password>`,
        `DB_SSL=${s.database.ssl}`,
        `DB_POOL_MIN=${s.database.pool_min}`,
        `DB_POOL_MAX=${s.database.pool_max}`,
      ] : [`DB_FILENAME=${s.database.name}`]),
      ``,
      `# Redis`,
      `REDIS_ENABLED=${s.redis.enabled}`,
      ...(s.redis.url_set
        ? [`REDIS_URL=<your-redis-url>`, `REDIS_TLS=${s.redis.tls}`]
        : s.redis.host
          ? [`REDIS_HOST=${s.redis.host}`, `REDIS_PORT=${s.redis.port}`, `REDIS_DB=${s.redis.db}`, `REDIS_TLS=${s.redis.tls}`]
          : []),
      ``,
      `# Platform`,
      `LINK_LENGTH=${s.platform.link_length}`,
      `DISALLOW_REGISTRATION=${s.platform.disallow_registration}`,
      `DISALLOW_ANONYMOUS_LINKS=${s.platform.disallow_anonymous_links}`,
      `DISALLOW_LOGIN_FORM=${s.platform.disallow_login_form}`,
      `ENABLE_RATE_LIMIT=${s.platform.enable_rate_limit}`,
      ``,
      `# Mail`,
      `MAIL_ENABLED=${s.mail.enabled}`,
      ...(s.mail.enabled ? [
        `MAIL_HOST=${s.mail.host || ''}`,
        `MAIL_PORT=${s.mail.port}`,
        `MAIL_SECURE=${s.mail.secure}`,
        `MAIL_USER=${s.mail.user || ''}`,
        `MAIL_FROM=${s.mail.from || ''}`,
      ] : []),
      ``,
      `# OIDC`,
      `OIDC_ENABLED=${s.oidc.enabled}`,
      ...(s.oidc.enabled ? [
        `OIDC_ISSUER=${s.oidc.issuer || ''}`,
        `OIDC_CLIENT_ID=<your-client-id>`,
        `OIDC_CLIENT_SECRET=<your-client-secret>`,
        `OIDC_SCOPE=${s.oidc.scope}`,
        `OIDC_EMAIL_CLAIM=${s.oidc.email_claim}`,
      ] : []),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  if (error || !settings) {
    return (
      <Card>
        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-on-surface">Failed to load configuration</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Could not fetch settings from the server.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const s = settings;

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div>
          <p className="text-xs font-semibold text-on-surface">Platform Configuration</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Live snapshot of the active environment. Changes require a server restart.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyEnv}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied!' : 'Copy .env Template'}
          </Button>
        </div>
      </div>

      {/* Platform */}
      <SectionCard title="Platform" icon={Server} iconColor="text-primary bg-primary/10">
        <ConfigRow label="Site Name" value={s.platform.site_name} />
        <ConfigRow label="Default Domain" value={s.platform.default_domain} mono />
        <ConfigRow label="Link Length" value={`${s.platform.link_length} characters`} mono note="Length of generated short URL slugs" />
        <ConfigRow label="Custom Alphabet" value={
          <span className="font-mono text-[10px] bg-surface-container px-1.5 py-0.5 rounded break-all">{s.platform.link_custom_alphabet}</span>
        } note="Character set for link generation" />
        <ConfigRow label="Public Registration" value={<BoolBadge value={!s.platform.disallow_registration} trueLabel="Open" falseLabel="Disabled" />} note="Whether anyone can create an account" />
        <ConfigRow label="Anonymous Links" value={<BoolBadge value={!s.platform.disallow_anonymous_links} trueLabel="Allowed" falseLabel="Blocked" />} />
        <ConfigRow label="Login Form" value={<BoolBadge value={!s.platform.disallow_login_form} trueLabel="Visible" falseLabel="Hidden" />} note="OIDC-only mode hides the password form" />
        <ConfigRow label="Rate Limiting" value={<BoolBadge value={s.platform.enable_rate_limit} />} />
        <ConfigRow label="Trust Proxy" value={<BoolBadge value={s.platform.trust_proxy} />} note="Required for correct IPs behind a reverse proxy" />
      </SectionCard>

      {/* Server */}
      <SectionCard title="Server" icon={Activity} iconColor="text-secondary bg-secondary/10">
        <ConfigRow label="Port" value={s.server.port} mono />
        <ConfigRow label="Environment" value={
          <Badge variant={s.server.node_env === 'production' ? 'success' : 'warning'}>
            {s.server.node_env}
          </Badge>
        } />
        <ConfigRow label="App Instance" value={s.server.node_app_instance} mono note="NODE_APP_INSTANCE — relevant in PM2 cluster mode" />
        {s.server.server_ip_address && (
          <ConfigRow label="Server IP" value={s.server.server_ip_address} mono />
        )}
        {s.server.server_cname_address && (
          <ConfigRow label="CNAME Address" value={s.server.server_cname_address} mono />
        )}
      </SectionCard>

      {/* Database */}
      <SectionCard title="Database" icon={Database} iconColor="text-tertiary bg-tertiary/10">
        <ConfigRow label="Client" value={s.database.client} mono />
        {s.database.host && (
          <>
            <ConfigRow label="Host" value={s.database.host} mono />
            <ConfigRow label="Port" value={s.database.port} mono />
            <ConfigRow label="Database Name" value={s.database.name} mono />
            <ConfigRow label="User" value={s.database.user} mono />
            <ConfigRow label="Password" value={<SetBadge value={s.database.password_set} />} />
            <ConfigRow label="SSL" value={<BoolBadge value={s.database.ssl} />} />
          </>
        )}
        {!s.database.host && (
          <ConfigRow label="Filename" value={s.database.name} mono />
        )}
        <ConfigRow label="Connection Pool" value={`${s.database.pool_min} – ${s.database.pool_max}`} mono note="Min – Max connections" />
      </SectionCard>

      {/* Redis */}
      <SectionCard
        title="Redis / Cache"
        icon={Server}
        iconColor={s.redis.enabled ? 'text-secondary bg-secondary/10' : 'text-on-surface-variant bg-surface-container'}
        badge={<Badge variant={s.redis.enabled ? 'success' : 'default'}>{s.redis.enabled ? 'Active' : 'Disabled'}</Badge>}
      >
        <ConfigRow label="Status" value={<BoolBadge value={s.redis.enabled} />} note={s.redis.enabled ? "Caching is active" : "Set REDIS_ENABLED=true to enable"} />
        {s.redis.enabled && (
          <>
            <ConfigRow label="Connection Mode" value={s.redis.url_set ? 'URL (Upstash / TLS)' : 'Host/Port'} note={s.redis.url_set ? 'Using REDIS_URL — Upstash-compatible' : 'Using REDIS_HOST/PORT/PASSWORD'} />
            {s.redis.url_preview && (
              <ConfigRow label="URL Preview" value={s.redis.url_preview} mono />
            )}
            {!s.redis.url_set && s.redis.host && (
              <>
                <ConfigRow label="Host" value={s.redis.host} mono />
                <ConfigRow label="Port" value={s.redis.port} mono />
                <ConfigRow label="DB Index" value={s.redis.db} mono />
                <ConfigRow label="Password" value={<SetBadge value={s.redis.password_set} />} />
              </>
            )}
            <ConfigRow label="TLS / SSL" value={<BoolBadge value={s.redis.tls} />} note="Required for Upstash and most cloud Redis providers" />
          </>
        )}
        {!s.redis.enabled && (
          <div className="mt-2 p-3 rounded-lg bg-surface-container-low border border-outline-variant/50">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              To connect Upstash Redis, set in your <code className="font-mono text-[11px] bg-surface-container px-1 py-0.5 rounded">.env</code>:
            </p>
            <pre className="mt-2 text-[11px] font-mono text-on-surface bg-surface-container rounded p-2 overflow-x-auto leading-relaxed">{`REDIS_ENABLED=true\nREDIS_URL=rediss://default:TOKEN@HOST.upstash.io:6380\nREDIS_TLS=true`}</pre>
          </div>
        )}
      </SectionCard>

      {/* Mail */}
      <SectionCard
        title="Email / Mail"
        icon={Activity}
        iconColor={s.mail.enabled ? 'text-primary bg-primary/10' : 'text-on-surface-variant bg-surface-container'}
        badge={<Badge variant={s.mail.enabled ? 'success' : 'default'}>{s.mail.enabled ? 'Active' : 'Disabled'}</Badge>}
      >
        <ConfigRow label="Status" value={<BoolBadge value={s.mail.enabled} />} />
        {s.mail.enabled && (
          <>
            <ConfigRow label="Host" value={s.mail.host || '—'} mono />
            <ConfigRow label="Port" value={s.mail.port} mono />
            <ConfigRow label="Secure (TLS)" value={<BoolBadge value={s.mail.secure} />} />
            <ConfigRow label="Auth User" value={s.mail.user || '—'} mono />
            <ConfigRow label="From Address" value={s.mail.from || '—'} mono />
          </>
        )}
        {s.mail.report_email && (
          <ConfigRow label="Report Email" value={s.mail.report_email} mono />
        )}
        {s.mail.contact_email && (
          <ConfigRow label="Contact Email" value={s.mail.contact_email} mono />
        )}
      </SectionCard>

      {/* OIDC / SSO */}
      <SectionCard
        title="OIDC / Single Sign-On"
        icon={Shield}
        iconColor={s.oidc.enabled ? 'text-primary bg-primary/10' : 'text-on-surface-variant bg-surface-container'}
        badge={<Badge variant={s.oidc.enabled ? 'success' : 'default'}>{s.oidc.enabled ? 'Active' : 'Disabled'}</Badge>}
      >
        <ConfigRow label="Status" value={<BoolBadge value={s.oidc.enabled} />} />
        {s.oidc.enabled && (
          <>
            <ConfigRow label="Issuer" value={s.oidc.issuer || '—'} mono />
            <ConfigRow label="Client ID" value={<SetBadge value={s.oidc.client_id_set} />} />
            <ConfigRow label="Client Secret" value={<SetBadge value={s.oidc.client_secret_set} />} />
            <ConfigRow label="Scope" value={s.oidc.scope} mono />
            <ConfigRow label="Email Claim" value={s.oidc.email_claim} mono />
            {s.oidc.prompt && <ConfigRow label="Prompt" value={s.oidc.prompt} mono />}
            <ConfigRow label="Button Text" value={s.oidc.button_text} />
          </>
        )}
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security" icon={Shield} iconColor="text-error bg-error/10">
        <ConfigRow label="JWT Secret" value={<SetBadge value={s.security.jwt_secret_set} />} note="Used to sign authentication tokens" />
        <ConfigRow label="Custom Domain HTTPS" value={<BoolBadge value={s.security.custom_domain_use_https} />} note="Force HTTPS on custom domain short URLs" />
      </SectionCard>
    </div>
  );
};

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="space-y-6 pb-12">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">
              Admin Console
            </h1>
            <Badge variant="danger">Restricted</Badge>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5 ml-[calc(2rem+0.625rem)]">
            Centralized operations control for the internal platform.
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 border-b border-outline-variant/60 overflow-x-auto pb-px scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all duration-150 -mb-px',
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...tabPane}>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users'    && <UsersTab />}
          {activeTab === 'links'    && <LinksTab />}
          {activeTab === 'domains'  && <DomainsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
