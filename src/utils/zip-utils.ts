// utils/zip.ts
import JSZip from 'jszip';
import type { Context } from 'hono';

export interface ZipFileEntry {
  name: string;
  content: Uint8Array | ArrayBuffer | Buffer | string;
}

function toUint8(content: ZipFileEntry['content']): Uint8Array {
  if (typeof content === 'string') {
    return new TextEncoder().encode(content);
  }
  if (content instanceof Uint8Array) return content;
  // Bun kompatibel dengan Node Buffer
  if (typeof Buffer !== 'undefined' && content instanceof Buffer) {
    return new Uint8Array(content);
  }
  // ArrayBuffer
  return new Uint8Array(content as ArrayBuffer);
}

export class ZipUtils {
  /**
   * Kirim kumpulan file sebagai ZIP ke response Hono.
   * Header akan diset sebagai attachment dengan nama file zipFilename.
   */
  static async pipeZipToResponse(
    c: Context,
    files: ZipFileEntry[],
    zipFilename: string,
  ) {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.name, toUint8(file.content), { binary: true });
    }

    const zipData = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    return c.body(Buffer.from(zipData), 200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFilename}"`,
    });
  }

  /**
   * Buat ZIP sebagai Uint8Array (mis. untuk test/unit atau proses lanjutan).
   */
  static async createZipBuffer(files: ZipFileEntry[]): Promise<Uint8Array> {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(file.name, toUint8(file.content), { binary: true });
    }
    return zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });
  }
}
