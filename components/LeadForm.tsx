'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Perfil = 'empresa' | 'investidor' | 'proprietario';
const PERFIS: { id: Perfil; label: string }[] = [
  { id: 'empresa', label: 'Empresa ou operador' },
  { id: 'investidor', label: 'Investidor' },
  { id: 'proprietario', label: 'Proprietário ou parceiro' },
];
const CAMPOS: Record<Perfil, { name: string; label: string }[]> = {
  empresa: [
    { name: 'segmento', label: 'Segmento' },
    { name: 'area', label: 'Área necessária' },
    { name: 'prazo', label: 'Prazo de implantação' },
    { name: 'requisitos', label: 'Água, energia, acessos' },
  ],
  investidor: [
    { name: 'tese', label: 'Tese de investimento' },
    { name: 'ticket', label: 'Ordem de grandeza do investimento' },
    { name: 'prazo', label: 'Horizonte' },
    { name: 'requisitos', label: 'Infraestrutura crítica (energia, água, conectividade)' },
  ],
  proprietario: [
    { name: 'localizacao', label: 'Localização da área' },
    { name: 'area', label: 'Tamanho aproximado' },
    { name: 'situacao', label: 'Situação documental' },
    { name: 'interesse', label: 'Tipo de parceria' },
  ],
};

const lab: React.CSSProperties = { font: "500 12.5px 'DM Mono', monospace", color: 'rgba(255,255,255,.75)', letterSpacing: '.12em', textTransform: 'uppercase' };
const inp: React.CSSProperties = { height: 46, borderRadius: 10, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', padding: '0 12px', font: '400 16px Inter, sans-serif', width: '100%', boxSizing: 'border-box' };

export default function LeadForm() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [perfil, setPerfil] = useState<Perfil>('empresa');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  useEffect(() => setSlot(document.getElementById('form-slot')), []);
  if (!slot) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fd, perfil }) });
      setState(r.ok ? 'ok' : 'err');
    } catch { setState('err'); }
  }

  return createPortal(
    <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, padding: 28 }}>
      {state === 'ok' ? (
        <div style={{ color: '#fff', fontSize: 18, lineHeight: 1.55 }}>
          <b style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, display: 'block', marginBottom: 8 }}>Recebemos sua mensagem.</b>
          Nossa equipe avaliará as possibilidades territoriais e retornará em breve.
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PERFIS.map(p => (
              <button type="button" key={p.id} onClick={() => setPerfil(p.id)} aria-pressed={perfil === p.id}
                style={{ padding: '9px 16px', borderRadius: 999, font: '600 15px Inter, sans-serif', cursor: 'pointer',
                  background: perfil === p.id ? '#F39224' : 'transparent', color: perfil === p.id ? '#1A1208' : '#fff',
                  border: perfil === p.id ? '1px solid #F39224' : '1px solid rgba(255,255,255,.35)' }}>{p.label}</button>
            ))}
          </div>
          {/* honeypot */}
          <input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>Nome</span><input name="nome" required style={inp} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>E-mail</span><input name="email" type="email" required style={inp} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>Telefone / WhatsApp</span><input name="telefone" type="tel" style={inp} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>Empresa</span><input name="empresa" style={inp} /></label>
            {CAMPOS[perfil].map(c => (
              <label key={perfil + c.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>{c.label}</span><input name={c.name} style={inp} /></label>
            ))}
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lab}>Mensagem</span>
            <textarea name="mensagem" rows={3} style={{ ...inp, height: 'auto', padding: 12, resize: 'vertical' }} /></label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.5, color: 'rgba(255,255,255,.8)' }}>
            <input type="checkbox" name="lgpd" required style={{ marginTop: 3 }} />
            <span>Autorizo o uso dos meus dados pela Chapéu do Sol Urbanismo apenas para retorno sobre esta solicitação, conforme a LGPD.</span>
          </label>
          <button type="submit" disabled={state === 'sending'}
            style={{ background: '#F39224', color: '#1A1208', font: '700 17px Manrope, sans-serif', padding: 15, borderRadius: 999, border: 0, cursor: 'pointer', opacity: state === 'sending' ? .7 : 1 }}>
            {state === 'sending' ? 'Enviando…' : 'Solicitar conversa'}
          </button>
          {state === 'err' && <span role="alert" style={{ color: '#FFB4A2', fontSize: 15 }}>Não foi possível enviar agora. Tente novamente em instantes.</span>}
        </form>
      )}
    </div>,
    slot,
  );
}
