import { QRXOptions } from '../types';

const QRX_BASE_URL = 'https://qrgen.maybesurya.live/api/qrgen';

/**
 * Service for interacting exclusively with the internal QRX API.
 * Docs: https://docs.maybesurya.dev/qrx/introduction
 */
export class QRXService {
  /**
   * Constructs the full QRX image URL with query parameters.
   */
  static getQRUrl(options: QRXOptions): string {
    if (!options.data) return '';

    const url = new URL(QRX_BASE_URL);
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
  }

  /**
   * Fetches the QR code as a Blob object for direct downloading or canvas rendering.
   */
  static async fetchQRBlob(options: QRXOptions): Promise<Blob> {
    const qrUrl = this.getQRUrl(options);
    const headers: Record<string, string> = {};

    if (options.apiKey) {
      headers['x-api-key'] = options.apiKey;
    }

    const response = await fetch(qrUrl, { headers });

    if (!response.ok) {
      throw new Error(`QRX API Error (${response.status}): Failed to generate QR code.`);
    }

    return await response.blob();
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
      console.error('Failed to download QR code from QRX:', error);
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
