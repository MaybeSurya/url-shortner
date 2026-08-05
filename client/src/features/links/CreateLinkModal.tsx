import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Link as LinkIcon,
  Sparkles,
  Lock,
  Calendar,
  Globe,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { linkService, getErrorMessage, domainService } from '../../services/api';
import { QRXService } from '../../services/qrx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { backdropVariants, scaleIn, ease } from '../../lib/motion';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({ isOpen, onClose }) => {
  // Form fields
  const [target, setTarget] = useState('');
  const [customurl, setCustomurl] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [password, setPassword] = useState('');
  const [expireIn, setExpireIn] = useState('');
  
  // UTM Fields
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'basic' | 'utm' | 'advanced'>('basic');

  // Success state
  const [createdLink, setCreatedLink] = useState<{ link: string; target: string; id: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isQRAccordionOpen, setIsQRAccordionOpen] = useState(false);

  // QR Customizer state
  const [isGeneratingQR, _setIsGeneratingQR] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [qrSize, setQrSize] = useState(240);
  const [qrColor, setQrColor] = useState('#4648d4');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrImage, setQrImage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: domainService.getDomains,
    enabled: isOpen,
  });

  // Compute final destination URL with UTM params
  const finalDestinationUrl = useMemo(() => {
    if (!target.trim()) return '';
    try {
      const urlObj = new URL(target.startsWith('http') ? target : `https://${target}`);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      if (utmTerm) urlObj.searchParams.set('utm_term', utmTerm);
      if (utmContent) urlObj.searchParams.set('utm_content', utmContent);
      return urlObj.toString();
    } catch {
      return target;
    }
  }, [target, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const createMutation = useMutation({
    mutationFn: linkService.createLink,
    onSuccess: (newLink) => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setCreatedLink({
        link: newLink.link,
        target: newLink.target,
        id: newLink.id,
      });
      toast.success('Short link created successfully!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!target.trim()) {
      toast.error('Destination URL is required');
      return;
    }
    createMutation.mutate({
      target: finalDestinationUrl,
      customurl: customurl.trim() || undefined,
      password: password || undefined,
      domain: domain || undefined,
      expire_in: expireIn || undefined,
      description: description.trim() || undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, finalDestinationUrl, customurl, password, domain, expireIn, description]);

  // Handle ESC & Cmd+Enter — handleSubmit is defined below after createMutation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Generate QR code when success link exists & accordion opens
  useEffect(() => {
    if (createdLink && isQRAccordionOpen) {
      const id = setTimeout(() => {
        const url = QRXService.getQRUrl({
          data: createdLink.link,
          size: qrSize,
          color: qrColor,
          bgColor: qrBgColor,
          format: 'png',
        });
        setQrImage(url);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [createdLink, isQRAccordionOpen, qrSize, qrColor, qrBgColor]);

  const resetForm = () => {
    setTarget('');
    setCustomurl('');
    setDescription('');
    setDomain('');
    setPassword('');
    setExpireIn('');
    setUtmSource('');
    setUtmMedium('');
    setUtmCampaign('');
    setUtmTerm('');
    setUtmContent('');
    setActiveTab('basic');
    setCreatedLink(null);
    setIsQRAccordionOpen(false);
    setQrImage(null);
  };

  const copyShortUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('Copied short URL to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (!createdLink) return;
    QRXService.downloadQR({
      data: createdLink.link,
      size: 400,
      color: qrColor,
      bgColor: qrBgColor,
      format,
    }, `qr-${createdLink.id}`).then(() => {
      toast.success(`Downloaded QR as ${format.toUpperCase()}`);
    }).catch(() => toast.error('Failed to download QR code'));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Centered Modal Card */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden z-10 card-etched"
          >
            {/* ── Modal Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-on-surface tracking-tight">
                    {createdLink ? 'Link Created!' : 'Create Short Link'}
                  </h2>
                  <p className="text-2xs text-on-surface-variant">
                    {createdLink
                      ? 'Your shortened URL is ready to share'
                      : 'Build a trackable, branded short URL'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { resetForm(); onClose(); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── SUCCESS SCREEN ── */}
            {createdLink ? (
              <div className="p-6 space-y-6">
                {/* Animated checkmark header */}
                <div className="text-center space-y-2 pt-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="w-12 h-12 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                  <h3 className="text-base font-semibold text-on-surface">Link Ready!</h3>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                    Shortened URL has been generated and activated.
                  </p>
                </div>

                {/* Short URL Banner Card */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-primary/20 space-y-2">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-primary">
                    Short URL
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-base font-bold text-primary truncate">
                      {createdLink.link}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      onClick={() => copyShortUrl(createdLink.link)}
                    >
                      {isCopied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/50">
                    <span className="text-2xs text-on-surface-variant block truncate">
                      Destination: {createdLink.target}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <a href={createdLink.link} target="_blank" rel="noreferrer" className="w-full">
                    <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />} className="w-full">
                      Visit
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Share2 className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Short Link', url: createdLink.link });
                      } else {
                        copyShortUrl(createdLink.link);
                      }
                    }}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={resetForm}
                  >
                    Another
                  </Button>
                </div>

                {/* Collapsible QR Code Accordion */}
                <div className="border border-outline-variant rounded-xl overflow-hidden">
                  <button
                    onClick={() => setIsQRAccordionOpen(!isQRAccordionOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-low hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-primary" />
                      <span>QR Code Preview & Downloads</span>
                    </div>
                    {isQRAccordionOpen ? (
                      <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isQRAccordionOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: ease.smooth }}
                        className="p-4 bg-surface-container-lowest border-t border-outline-variant space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* QR Image Preview */}
                          <div className="w-36 h-36 p-2 bg-white rounded-xl border border-outline-variant shadow-xs flex items-center justify-center shrink-0">
                            {isGeneratingQR ? (
                              <span className="text-2xs text-gray-500">Generating…</span>
                            ) : qrImage ? (
                              <img src={qrImage} alt="QR Code" className="w-full h-full object-contain" />
                            ) : null}
                          </div>

                          {/* Controls */}
                          <div className="flex-1 space-y-3 w-full">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-2xs text-on-surface-variant font-medium block mb-1">
                                  Module Color
                                </label>
                                <input
                                  type="color"
                                  value={qrColor}
                                  onChange={(e) => setQrColor(e.target.value)}
                                  className="w-full h-7 rounded border border-outline-variant bg-transparent cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="text-2xs text-on-surface-variant font-medium block mb-1">
                                  Background
                                </label>
                                <input
                                  type="color"
                                  value={qrBgColor}
                                  onChange={(e) => setQrBgColor(e.target.value)}
                                  className="w-full h-7 rounded border border-outline-variant bg-transparent cursor-pointer"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="xs"
                                leftIcon={<Download className="w-3 h-3" />}
                                onClick={() => downloadQR('png')}
                                className="flex-1"
                              >
                                PNG
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                leftIcon={<Download className="w-3 h-3" />}
                                onClick={() => downloadQR('svg')}
                                className="flex-1"
                              >
                                SVG
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* ── FORM STATE ── */
              <form onSubmit={handleSubmit}>
                {/* Navigation Tabs */}
                <div className="flex items-center border-b border-outline-variant px-6 bg-surface-container-low/20">
                  <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'basic'
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('utm')}
                    className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'utm'
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    UTM Builder
                    {(utmSource || utmMedium || utmCampaign) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('advanced')}
                    className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'advanced'
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Settings
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {activeTab === 'basic' && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <Input
                        label="Destination URL *"
                        placeholder="https://example.com/long-page-url"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        leftIcon={<LinkIcon className="w-3.5 h-3.5" />}
                        autoFocus
                        required
                      />

                      <Input
                        label="Custom Back-Half (Alias)"
                        placeholder="e.g. launch-2026"
                        value={customurl}
                        onChange={(e) => setCustomurl(e.target.value)}
                        helper="Leave blank for an auto-generated short ID."
                      />

                      <Input
                        label="Title / Notes"
                        placeholder="Internal description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />

                      {/* Open Graph Favicon Preview Card */}
                      {target.trim() && (
                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-on-surface truncate">
                              {target}
                            </p>
                            <p className="text-2xs text-on-surface-variant">
                              Destination Preview
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'utm' && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-xs text-on-surface-variant">
                        Append UTM parameters to track campaign performance in Google Analytics.
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="UTM Source"
                          placeholder="google, newsletter, twitter"
                          value={utmSource}
                          onChange={(e) => setUtmSource(e.target.value)}
                        />
                        <Input
                          label="UTM Medium"
                          placeholder="cpc, banner, email"
                          value={utmMedium}
                          onChange={(e) => setUtmMedium(e.target.value)}
                        />
                      </div>

                      <Input
                        label="UTM Campaign"
                        placeholder="summer_sale, product_launch"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="UTM Term"
                          placeholder="running+shoes"
                          value={utmTerm}
                          onChange={(e) => setUtmTerm(e.target.value)}
                        />
                        <Input
                          label="UTM Content"
                          placeholder="logolink, textlink"
                          value={utmContent}
                          onChange={(e) => setUtmContent(e.target.value)}
                        />
                      </div>

                      {/* Live Encoded URL Preview */}
                      {finalDestinationUrl && (
                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant space-y-1">
                          <span className="text-2xs font-semibold text-on-surface-variant uppercase">
                            Final Destination URL Preview
                          </span>
                          <p className="font-mono text-xs text-primary break-all select-all">
                            {finalDestinationUrl}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'advanced' && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                          Custom Domain
                        </label>
                        <select
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full h-9 bg-surface-container-lowest text-on-surface text-xs rounded-md border border-outline-variant px-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="">Default Domain</option>
                          {domains?.map((d) => (
                            <option key={d.id} value={d.address}>
                              {d.address}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Password Protection"
                        type="password"
                        placeholder="Require password to access link"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={<Lock className="w-3.5 h-3.5" />}
                      />

                      <Input
                        label="Expiration Date & Time"
                        type="datetime-local"
                        value={expireIn}
                        onChange={(e) => setExpireIn(e.target.value)}
                        leftIcon={<Calendar className="w-3.5 h-3.5" />}
                      />
                    </motion.div>
                  )}
                </div>

                {/* ── Modal Footer ── */}
                <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
                  <span className="text-2xs text-on-surface-variant font-mono hidden sm:inline">
                    ⌘ + Enter to submit
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={createMutation.isPending}
                    >
                      Create Short Link
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
