import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Lock, Calendar, ChevronDown, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { linkService, getErrorMessage, domainService } from '../../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { backdropVariants, slideRight } from '../../lib/motion';

export interface CreateLinkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLinkDrawer: React.FC<CreateLinkDrawerProps> = ({ isOpen, onClose }) => {
  const [target, setTarget] = useState('');
  const [customurl, setCustomurl] = useState('');
  const [password, setPassword] = useState('');
  const [domain, setDomain] = useState('');
  const [expireIn, setExpireIn] = useState('');
  const [description, setDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const queryClient = useQueryClient();

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: domainService.getDomains,
    enabled: isOpen,
  });

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const createMutation = useMutation({
    mutationFn: linkService.createLink,
    onSuccess: () => {
      toast.success('Short link created');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      resetForm();
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const resetForm = () => {
    setTarget(''); setCustomurl(''); setPassword('');
    setDomain(''); setExpireIn(''); setDescription('');
    setShowAdvanced(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) { toast.error('Target URL is required'); return; }
    createMutation.mutate({
      target: target.trim(),
      customurl: customurl.trim() || undefined,
      password: password || undefined,
      domain: domain || undefined,
      expire_in: expireIn || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <motion.aside
              variants={slideRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-sm bg-surface-container-lowest border-l border-outline-variant shadow-xl flex flex-col"
              role="dialog"
              aria-label="Create short link"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-on-surface">New Short Link</h2>
                    <p className="text-2xs text-on-surface-variant">Create a trackable short URL</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form
                id="create-link-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
              >
                <Input
                  label="Destination URL"
                  placeholder="https://example.com/very/long/url"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  leftIcon={<LinkIcon className="w-3.5 h-3.5" />}
                  required
                />

                <Input
                  label="Custom alias"
                  placeholder="my-custom-link"
                  value={customurl}
                  onChange={(e) => setCustomurl(e.target.value)}
                  helper="Leave blank to auto-generate"
                />

                <Input
                  label="Notes"
                  placeholder="Optional description…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Advanced toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(p => !p)}
                  className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium"
                >
                  <motion.span
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.span>
                  Advanced options
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 pt-2 border-t border-outline-variant overflow-hidden"
                    >
                      {/* Domain selector */}
                      <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                          Domain
                        </label>
                        <select
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full h-8 bg-surface-container-lowest text-on-surface text-sm rounded-md border border-outline-variant px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
                        >
                          <option value="">Default domain</option>
                          {domains?.map((d) => (
                            <option key={d.id} value={d.address}>{d.address}</option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Password protection"
                        type="password"
                        placeholder="Require password to access"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={<Lock className="w-3.5 h-3.5" />}
                      />

                      <Input
                        label="Expiration date"
                        type="datetime-local"
                        value={expireIn}
                        onChange={(e) => setExpireIn(e.target.value)}
                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-outline-variant bg-surface-container/50 flex items-center justify-end gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
                <Button
                  type="submit"
                  form="create-link-form"
                  variant="primary"
                  size="sm"
                  isLoading={createMutation.isPending}
                >
                  Create link
                </Button>
              </div>
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
