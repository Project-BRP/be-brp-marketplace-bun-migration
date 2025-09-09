import path from 'path';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import fs from 'fs';

export class SharpUtils {
  private static async ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      await fs.mkdirSync(dir, { recursive: true });
    }
  }

  private static async fileToBuffer(file: File): Promise<Buffer> {
    const arrBuf = await file.arrayBuffer();
    return Buffer.from(arrBuf);
  }

  static async savePhotoProfile(file: File): Promise<string> {
    const rootDirectory = path.resolve(__dirname, '..', '..');
    const mainDirectory = process.env.UPLOADS_PATH;
    const relativeDirectory = path.join(
      mainDirectory,
      'users',
      'photo-profile',
    );
    const absoluteDirectory = path.join(rootDirectory, relativeDirectory);

    await this.ensureDir(absoluteDirectory);

    const filename = `${uuid()}_${Date.now()}.webp`;
    const outputFilePath = path.join(absoluteDirectory, filename);

    const buf = await this.fileToBuffer(file);
    await sharp(buf).resize(400, 400).toFormat('webp').toFile(outputFilePath);

    return path.join('users', 'photo-profile', filename).replace(/\\/g, '/');
  }

  static async saveProductVariantImage(file: File): Promise<string> {
    const rootDirectory = path.resolve(__dirname, '..', '..');
    const mainDirectory = process.env.UPLOADS_PATH;
    const relativeDirectory = path.join(mainDirectory, 'products', 'variants');
    const absoluteDirectory = path.join(rootDirectory, relativeDirectory);

    await this.ensureDir(absoluteDirectory);

    const filename = `${uuid()}_${Date.now()}.webp`;
    const outputFilePath = path.join(absoluteDirectory, filename);

    const buf = await this.fileToBuffer(file);
    await sharp(buf).resize(1920, 1080).toFormat('webp').toFile(outputFilePath);

    return path.join('products', 'variants', filename).replace(/\\/g, '/');
  }

  static async saveProductImage(file: File): Promise<string> {
    const rootDirectory = path.resolve(__dirname, '..', '..');
    const mainDirectory = process.env.UPLOADS_PATH;
    const relativeDirectory = path.join(mainDirectory, 'products', 'main');
    const absoluteDirectory = path.join(rootDirectory, relativeDirectory);

    await this.ensureDir(absoluteDirectory);

    const filename = `${uuid()}_${Date.now()}.webp`;
    const outputFilePath = path.join(absoluteDirectory, filename);

    const buf = await this.fileToBuffer(file);
    await sharp(buf).resize(1920, 1080).toFormat('webp').toFile(outputFilePath);

    return path.join('products', 'main', filename).replace(/\\/g, '/');
  }

  static async saveLogo(file: File): Promise<string> {
    const rootDirectory = path.resolve(__dirname, '..', '..');
    const mainDirectory = process.env.UPLOADS_PATH;
    const relativeDirectory = path.join(mainDirectory, 'logo');
    const absoluteDirectory = path.join(rootDirectory, relativeDirectory);

    await this.ensureDir(absoluteDirectory);

    const filename = `company-logo_${uuid()}_${Date.now()}.png`;
    const outputFilePath = path.join(absoluteDirectory, filename);

    const buf = await this.fileToBuffer(file);
    await sharp(buf).resize(500, 500).toFormat('png').toFile(outputFilePath);

    return path.join('logo', filename).replace(/\\/g, '/');
  }

  static async saveChatImage(
    file: File,
  ): Promise<{ path: string; width: number | null; height: number | null }> {
    const rootDirectory = path.resolve(__dirname, '..', '..');
    const mainDirectory = process.env.UPLOADS_PATH;
    const relativeDirectory = path.join(mainDirectory, 'chats', 'attachments');
    const absoluteDirectory = path.join(rootDirectory, relativeDirectory);

    await this.ensureDir(absoluteDirectory);

    const filename = `${uuid()}_${Date.now()}.webp`;
    const outputFilePath = path.join(absoluteDirectory, filename);

    const buf = await this.fileToBuffer(file);

    // Resize dengan aspect ratio
    await sharp(buf)
      .resize({ width: 1280, height: 1280, fit: 'inside' })
      .toFormat('webp')
      .toFile(outputFilePath);

    const meta = await sharp(outputFilePath).metadata();

    return {
      path: path.join('chats', 'attachments', filename).replace(/\\/g, '/'),
      width: meta.width ?? null,
      height: meta.height ?? null,
    };
  }
}
