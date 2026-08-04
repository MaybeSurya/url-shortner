import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, PlusCircle, Trash2, CheckCircle2, ShieldCheck, HelpCircle, Server } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { domainService, getErrorMessage } from '../../services/api';
import { useConfig } from '../../context/ConfigContext';
import { toast } from 'sonner';

export const DomainsPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [homepage, setHomepage] = useState('');
  const { siteName, defaultDomain } = useConfig();

  const queryClient = useQueryClient();

  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: domainService.getDomains,
  });

  const addMutation = useMutation({
    mutationFn: domainService.addDomain,
    onSuccess: () => {
      toast.success('Custom domain added successfully!');
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setIsAddModalOpen(false);
      setAddress('');
      setHomepage('');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: domainService.deleteDomain,
    onSuccess: () => {
      toast.success('Custom domain removed!');
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Domain address is required.');
      return;
    }
    addMutation.mutate({
      address: address.trim(),
      homepage: homepage.trim() || undefined,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Custom Domains</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Brand your short links with your custom domain name (e.g. go.yourbrand.com).
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="shadow-glow"
        >
          Add Custom Domain
        </Button>
      </div>

      {/* DNS Configuration Guide Card */}
      <Card className="bg-surface-container-low border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-on-surface">DNS Setup Instructions</h3>
            <p className="text-xs text-on-surface-variant">
              To point your domain or subdomain to {siteName}, add the following CNAME or A Record in your DNS provider (Cloudflare, Namecheap, GoDaddy):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant">
                <span className="text-on-surface-variant block font-sans text-[10px] uppercase font-semibold">CNAME Record</span>
                <span className="text-primary font-bold">CNAME link.yourbrand.com → {defaultDomain}</span>
              </div>
              <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant">
                <span className="text-on-surface-variant block font-sans text-[10px] uppercase font-semibold">A Record</span>
                <span className="text-primary font-bold">A @ → 127.0.0.1</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Domains List Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-on-surface">Configured Domains</h2>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !domains || domains.length === 0 ? (
          <Card className="p-12 text-center text-xs text-on-surface-variant">
            No custom domains added yet. Click "Add Custom Domain" above to brand your short URLs.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {domains.map((dom) => (
              <Card key={dom.id} hoverable className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-on-surface">{dom.address}</span>
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3" /> Active & Verified
                      </Badge>
                    </div>
                    {dom.homepage && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        Homepage Redirect: <span className="font-mono">{dom.homepage}</span>
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setDeletingId(dom.id)}
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="w-4 h-4 text-error" />}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Custom Domain"
        description="Enter your custom domain or subdomain name to map short URLs."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Domain / Subdomain Address *"
            placeholder="link.yourbrand.com or yourbrand.com"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <Input
            label="Custom Homepage Redirect (Optional)"
            placeholder="https://yourbrand.com"
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
            helperText="Where users are redirected if they visit root domain directly."
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/60">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={addMutation.isPending}>
              Add Domain
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Domain Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Remove Custom Domain?"
        description="Removing this domain will unbind all existing short URLs associated with it."
      >
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
          >
            Remove Domain
          </Button>
        </div>
      </Modal>
    </div>
  );
};
