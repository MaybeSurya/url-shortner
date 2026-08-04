import { QRXOptions } from '../types';

const QRX_PRIMARY_URL = 'https://qrgen.maybesurya.live/api/qrgen';
const QRX_FALLBACK_URL = 'https://api.qrserver.com/v1/create-qr-code/';

/**
 * Service for generating, rendering, and downloading high-resolution QR codes.
 * Supports primary internal API (QRX) with automatic fallback to public QR server.
 */
export class QRXService {
  /**
   * Constructs the primary QR image URL with query parameters.
   */
  static getQRUrl(options: QRXOptions): string {
    if (!options.data) return '';

    try {
      const url = new URL(QRX_PRIMARY_URL);
      url.searchParams.set('data', options.data);

      if (options.size) {
        url.searchParams.set('size', options.size.toString());
      }
      if (options.color) {
        url.searchParams.set('color', options.color.replace('#', ''));
      }
      if (options.bgColor) {
        url.searchParams.set('bgColor', options.bgColor.replace('#', ''));
      }
      if (options.format) {
        url.searchParams.set('format', options.format);
      }
      if (options.apiKey) {
        url.searchParams.set('apiKey', options.apiKey);
      }

      return url.toString();
    } catch {
      return this.getFallbackQRUrl(options);
    }
  }

  /**
   * Constructs a fallback QR image URL using global QR API (api.qrserver.com).
   */
  static getFallbackQRUrl(options: QRXOptions): string {
    if (!options.data) return '';

    const size = options.size || 300;
    const url = new URL(QRX_FALLBACK_URL);
    url.searchParams.set('size', `${size}x${size}`);
    url.searchParams.set('data', options.data);

    if (options.color) {
      url.searchParams.set('color', options.color.replace('#', ''));
    }
    if (options.bgColor) {
      url.searchParams.set('bgcolor', options.bgColor.replace('#', ''));
    }
    if (options.format) {
      url.searchParams.set('format', options.format);
    }

    return url.toString();
  }

  /**
   * Fetches the QR code as a Blob object for direct downloading with automatic failover retry.
   */
  static async fetchQRBlob(options: QRXOptions): Promise<Blob> {
    const primaryUrl = this.getQRUrl(options);
    const headers: Record<string, string> = {};

    if (options.apiKey) {
      headers['x-api-key'] = options.apiKey;
    }

    try {
      const response = await fetch(primaryUrl, { headers });
      if (response.ok) {
        return await response.blob();
      }
    } catch {
      // Primary failed, fall through to fallback
    }

    // Try fallback endpoint
    const fallbackUrl = this.getFallbackQRUrl(options);
    const fallbackResponse = await fetch(fallbackUrl);

    if (!fallbackResponse.ok) {
      throw new Error(`Failed to generate QR code.`);
    }

    return await fallbackResponse.blob();
  }

  /**
   * Triggers an immediate browser download of the QR code file.
   */
  static async downloadQR(options: QRXOptions, filename: string = 'qrcode'): Promise<void> {
    try {
      const blob = await this.fetchQRBlob(options);
      const url = URL.createObjectURL(blob);
      const extension = options.format || 'png';

      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      throw error;
    }
  }

  /**
   * Preloads a QR image into browser memory for instant UI display without lag.
   */
  static preload(options: QRXOptions): void {
    const url = this.getQRUrl(options);
    if (!url) return;
    const img = new Image();
    img.src = url;
  }
}
