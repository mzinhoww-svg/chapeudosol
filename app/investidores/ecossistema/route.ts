import fs from 'node:fs/promises';
import path from 'node:path';
import { headers } from 'next/headers';
import { HEADER } from '@/lib/investidores';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await headers()).get(HEADER)) return new Response('Não autorizado', { status: 401 });
  const buf = await fs.readFile(path.join(process.cwd(), 'private/investidores/ecossistema.png'));
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=3600', 'X-Robots-Tag': 'noindex' } });
}
