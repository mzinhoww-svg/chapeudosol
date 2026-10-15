import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, HEADER, conviteDoToken } from '@/lib/investidores';

export const config = { matcher: ['/investidores', '/investidores/:path*'] };

const MAX_AGE = 60 * 60 * 24 * 30;

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const viaLink = url.searchParams.get('k');
  const viaCookie = req.cookies.get(COOKIE)?.value;

  // O link do convite tem prioridade; senão revalida o cookie contra INVESTOR_KEYS.
  const nomeLink = conviteDoToken(viaLink);
  const nome = nomeLink ?? conviteDoToken(viaCookie);

  if (url.pathname === '/investidores') {
    console.log(`[investidores] ${nome ? `convite=${nome}${nomeLink ? ' (link)' : ' (cookie)'}` : viaLink || viaCookie ? 'token inválido ou revogado' : 'sem token'}`);
  }

  if (nomeLink && viaLink) {
    const limpa = url.clone();
    limpa.searchParams.delete('k');
    const res = NextResponse.redirect(limpa);
    res.cookies.set(COOKIE, viaLink, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/investidores', maxAge: MAX_AGE });
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  // Nunca confia em cabeçalho vindo do cliente.
  const headers = new Headers(req.headers);
  headers.delete(HEADER);
  if (nome) headers.set(HEADER, nome);
  const res = NextResponse.next({ request: { headers } });
  if (!nome && viaCookie) res.cookies.delete({ name: COOKIE, path: '/investidores' });
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}
