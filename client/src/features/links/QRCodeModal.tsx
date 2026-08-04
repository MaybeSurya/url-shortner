import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { QRXService } from '../../services/qrx';
import { Download, Copy, Check, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  shortId?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  shortId = 'link',
}) => {
  const [size, setSize] = useState<number>(300);
  const [color, setColor] = useState<string>('#4648d4');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [useFallbackImg, setUseFallbackImg] = useState(false);

  const qrOptions = {
    data: url,
    size,
    color,
    bgColor,
    format,
  };

  const primaryUrl = QRXService.getQRUrl(qrOptions);
  const fallbackUrl = QRXService.getFallbackQRUrl(qrOptions);
  const currentImgUrl = useFallbackImg ? fallbackUrl : primaryUrl;

  // Reset fallback on option changes
  useEffect(() => {
    setUseFallbackImg(false);
  }, [url, size, color, bgColor, format]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await QRXService.downloadQR(qrOptions, `qrcode-${shortId}`);
      toast.success('QR Code downloaded!');
    } catch {
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentImgUrl);
      setHasCopied(true);
      toast.success('QR image URL copied to clipboard');
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error('Could not copy URL');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code Customizer"
      description="Generate instant high-resolution QR codes."
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Live Preview Column */}
        <div className="flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-xl border border-outline-variant">
          {url ? (
            <div className="relative group p-4 bg-white rounded-xl shadow-xs border border-outline-variant">
              <img
                key={currentImgUrl}
                src={currentImgUrl}
                alt="QR Code preview"
                className="w-48 h-48 object-contain transition-transform duration-200 group-hover:scale-105"
                loading="eager"
                onError={() => {
                  if (!useFallbackImg) {
                    setUseFallbackImg(true);
                  }
                }}
              />
              <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded">
                {useFallbackImg ? 'QR' : 'QRX'}
              </div>
            </div>
          ) : (
            <div className="text-xs text-on-surface-variant">No URL provided</div>
          )}

          <p className="mt-4 text-xs font-mono text-on-surface-variant text-center break-all max-w-xs">
            {url}
          </p>
        </div>

        {/* Controls Column */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-on-surface-variant mb-1">
              <span>Image Size</span>
              <span className="font-mono text-on-surface">{size}px</span>
            </div>
            <input
              type="range"
              min="150"
              max="600"
              step="50"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Module Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 rounded-md border border-outline-variant bg-surface-container-lowest cursor-pointer px-1 py-1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-8 rounded-md border border-outline-variant bg-surface-container-lowest cursor-pointer px-1 py-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  format === 'png'
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                PNG Image
              </button>
              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  format === 'svg'
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                SVG Vector
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleDownload}
              isLoading={isDownloading}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download {format.toUpperCase()} Code
            </Button>

            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={handleCopyUrl}
              leftIcon={
                hasCopied ? (
                  <Check className="w-3.5 h-3.5 text-secondary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )
              }
            >
              {hasCopied ? 'Copied Image URL' : 'Copy Direct QR Image URL'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
