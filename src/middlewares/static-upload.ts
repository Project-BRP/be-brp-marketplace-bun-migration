import type { Context } from 'hono';
import path from 'path';
import fs from 'fs';

export async function staticUploadsHandler(c: Context) {
  const rel = c.req.path.replace(/^\/uploads\//, '');
  const baseDir = path.resolve(__dirname, '..', '..', process.env.UPLOADS_PATH);
  const filePath = path.join(baseDir, rel);

  if (!fs.existsSync(filePath)) {
    return c.notFound();
  }

  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.gif') contentType = 'image/gif';
  else if (ext === '.pdf') contentType = 'application/pdf';

  const data = await fs.promises.readFile(filePath);
  return new Response(new Uint8Array(data), {
    headers: { 'Content-Type': contentType },
  });
}
