// INVESTOR_KEYS: "nome:token,nome2:token2". Lido a cada requisição, nunca versionado.
export const COOKIE = 'inv_k';
export const HEADER = 'x-invite';

export function parseKeys(raw: string | undefined): { nome: string; token: string }[] {
  return (raw || '')
    .split(',')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      const i = p.indexOf(':');
      return i > 0 ? { nome: p.slice(0, i).trim(), token: p.slice(i + 1).trim() } : null;
    })
    .filter((x): x is { nome: string; token: string } => !!x && !!x.token);
}

function igual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export function conviteDoToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const hit = parseKeys(process.env.INVESTOR_KEYS).find(k => igual(k.token, token));
  return hit ? hit.nome : null;
}
