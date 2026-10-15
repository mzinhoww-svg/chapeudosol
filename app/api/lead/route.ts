import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
const TO = process.env.LEAD_TO_EMAIL || 'mazinhoww@gmail.com';
const esc = (s: unknown) => String(s ?? '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string)).slice(0, 2000);

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  if (!b.nome || !b.email || !b.lgpd) return NextResponse.json({ ok: false, error: 'campos obrigatórios' }, { status: 422 });

  const { website, lgpd, ...campos } = b; void website;
  const rows = Object.entries(campos).filter(([, v]) => v).map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join('');
  const subject = `Novo lead · Distrito Chapéu do Sol · ${esc(b.perfil)} · ${esc(b.nome)}`;
  const html = `<table cellpadding="6">${rows}<tr><td><b>consentimento LGPD</b></td><td>${lgpd ? 'sim' : 'não'}</td></tr></table>`;

  try {
    if (process.env.RESEND_API_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.LEAD_FROM || 'Chapéu do Sol <onboarding@resend.dev>', to: [TO], reply_to: String(b.email), subject, html }),
      });
      if (!r.ok) throw new Error('resend ' + r.status);
    } else {
      const r = await fetch(`https://formsubmit.co/ajax/${TO}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: subject, _replyto: b.email, _template: 'table', ...campos }),
      });
      if (!r.ok) throw new Error('formsubmit ' + r.status);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('lead send failed', e);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
