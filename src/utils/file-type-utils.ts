export class FileTypeUtils {
  private static isJpeg(buf: Uint8Array): boolean {
    // JPEG magic: FF D8 FF
    return (
      buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
    );
  }

  private static isPng(buf: Uint8Array): boolean {
    // PNG magic: 89 50 4E 47 0D 0A 1A 0A
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (buf.length < sig.length) return false;
    for (let i = 0; i < sig.length; i++) {
      if (buf[i] !== sig[i]) return false;
    }
    return true;
  }

  static async isValidImage(file: File): Promise<boolean> {
    // ambil 12 byte pertama dari file
    const arrBuf = await file.arrayBuffer();
    const buf = new Uint8Array(arrBuf).subarray(0, 12);
    return this.isJpeg(buf) || this.isPng(buf);
  }
}
