import { access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export async function localImageSize(
  src: string | undefined | null
): Promise<{ width: number; height: number } | null> {
  if (!src || !src.startsWith('/') || src.startsWith('//')) return null;
  const relative = src.split('?')[0].replace(/^\/+/, '');
  if (!relative || relative.includes('..')) return null;
  const file = path.join(process.cwd(), 'public', relative);
  try {
    await access(file);
    const meta = await sharp(file, { failOn: 'none' }).metadata();
    if (!meta.width || !meta.height) return null;
    return { width: meta.width, height: meta.height };
  } catch {
    return null;
  }
}
