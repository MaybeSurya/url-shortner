import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, Plus, Copy, Check, QrCode, Edit3, Trash2, ExternalLink,
  Download, Lock, Calendar, LinkIcon, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { linkService, getErrorMessage } from '../../services/api';
import { Link } from '../../types';
import { CreateLinkModal } from './CreateLinkModal';
import { QRCodeModal } from './QRCodeModal';
import { EditLinkModal } from './EditLinkModal';
import { toast } from 'sonner';
import { staggerContainer, staggerChild } from '../../lib/motion';

export const LinksPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQRUrl, setActiveQRUrl] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 15;

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['links', { limit, skip, search }],
    queryFn: () => linkService.getLinks({ limit, skip, search: search.trim() || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: linkService.deleteLink,
    onSuccess: () => {
      toast.success('Link deleted');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setDeletingId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const copyLink = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, []);

  const handleExportCSV = () => {
    if (!data?.data?.length) { toast.error('No links to export'); return; }
    const rows = data.data.map(l =>
      `"${l.id}","${l.link}","${l.target}",${l.visit_count},"${l.created_at}"`
    );
    const blob = new Blob(['ID,Short Link,Target URL,Visits,Created At\n' + rows.join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `links-${Date.now()}.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Exported CSV');
  };

  const links = data?.data ?? [];
  const total = data?.total ?? 0;
  const page = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;
  const isLoadingTable = isLoading || isFetching;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Links</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {total > 0 ? `${total.toLocaleString()} total links` : 'Manage your short links'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateDrawerOpen(true)}
          >
            New Link
          </Button>
        </div>
      </div>

      {/* ── Search & filters bar ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Search links…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
            leftIcon={<Search className="w-3.5 h-3.5" />}
            rightIcon={
              search ? (
                <button onClick={() => { setSearch(''); setSkip(0); }} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>
        {search && (
          <span className="text-xs text-on-surface-variant">
            {links.length} of {total} results
          </span>
        )}
      </div>

      {/* ── Table (Desktop >= md) & Card List (Mobile < md) ── */}
      <Card padding="none">
        {/* Mobile View (< md) */}
        <div className="md:hidden divide-y divide-outline-variant/60">
          {isLoadingTable ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<LinkIcon className="w-5 h-5" />}
                title={search ? 'No links match your search' : 'No links yet'}
                description={search ? 'Try a different query.' : 'Create your first short link.'}
                action={
                  !search ? (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setIsCreateDrawerOpen(true)}
                    >
                      New Link
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="p-4 space-y-3">
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

                <p className="text-2xs text-on-surface-variant break-all line-clamp-2" title={link.target}>
                  {link.target}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {link.password ? (
                      <Badge variant="warning"><Lock className="w-2.5 h-2.5" /> Protected</Badge>
                    ) : (
                      <Badge variant="default">Public</Badge>
                    )}
                    {link.expire_in && (
                      <Badge variant="indigo"><Calendar className="w-2.5 h-2.5" /> Expires</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyLink(link.link, link.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Copy"
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
                    <button
                      onClick={() => setEditingLink(link)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(link.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left data-table">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Short Link', 'Destination', 'Properties', 'Visits', ''].map((h) => (
                  <th
                    key={h}
                    className="py-2.5 px-4 text-2xs font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {isLoadingTable ? (
              <tbody className="divide-y divide-outline-variant/50">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-52" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-10" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-6 w-24 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            ) : links.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<LinkIcon className="w-5 h-5" />}
                      title={search ? 'No links match your search' : 'No links yet'}
                      description={search ? 'Try a different query.' : 'Create your first short link.'}
                      action={
                        !search ? (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                            onClick={() => setIsCreateDrawerOpen(true)}
                          >
                            New Link
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              </tbody>
            ) : (
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
                    className="group hover:bg-surface-container/40 transition-colors"
                  >
                    {/* Short link */}
                    <td className="py-3 px-4">
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

                    {/* Target */}
                    <td className="py-3 px-4 max-w-xs">
                      <span className="text-xs text-on-surface-variant truncate block" title={link.target}>
                        {link.target}
                      </span>
                    </td>

                    {/* Properties */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {link.password ? (
                          <Badge variant="warning"><Lock className="w-2.5 h-2.5" /> Protected</Badge>
                        ) : (
                          <Badge variant="default">Public</Badge>
                        )}
                        {link.expire_in && (
                          <Badge variant="indigo"><Calendar className="w-2.5 h-2.5" /> Expires</Badge>
                        )}
                      </div>
                    </td>

                    {/* Visits */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold tnum text-on-surface">
                        {link.visit_count}
                      </span>
                    </td>

                    {/* Actions — reveal on hover */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyLink(link.link, link.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                          title="Copy"
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
                        <button
                          onClick={() => setEditingLink(link)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(link.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            )}
          </table>
        </div>

        {/* ── Pagination ── */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
            <span className="text-xs text-on-surface-variant">
              Page {page} of {totalPages} · {total} links
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="xs"
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - limit))}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Prev
              </Button>
              <Button
                variant="ghost"
                size="xs"
                disabled={page >= totalPages}
                onClick={() => setSkip(skip + limit)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Modals ── */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete this link?"
        description="This action cannot be undone. Visitors will receive a 404 error."
      >
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
          >
            Delete link
          </Button>
        </div>
      </Modal>

      {activeQRUrl && (
        <QRCodeModal isOpen onClose={() => setActiveQRUrl(null)} url={activeQRUrl} />
      )}

      {editingLink && (
        <EditLinkModal isOpen onClose={() => setEditingLink(null)} link={editingLink} />
      )}

      <CreateLinkModal isOpen={isCreateDrawerOpen} onClose={() => setIsCreateDrawerOpen(false)} />
    </div>
  );
};
