'use client';
import { useState } from 'react';

type Modo = 'acesso' | 'conversa' | 'dataroom';
const TITULOS: Record<Modo, string> = {
  acesso: 'Peça acesso à visita virtual',
  conversa: 'Agendar uma conversa',
  dataroom: 'Solicitar acesso ao data room',
};

export default function PedidoAcesso({ modo = 'acesso', onClose }: { modo?: Modo; onClose?: () => void }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const r = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fd, perfil: 'investidor', pedido: modo }) });
      setState(r.ok ? 'ok' : 'err');
    } catch { setState('err'); }
  }

  return (
    <div className="pedido">
      <h2>{TITULOS[modo]}</h2>
      {state === 'ok' ? (
        <p className="ok">Recebemos seu pedido. Nossa equipe retorna em breve.</p>
      ) : (
        <form onSubmit={onSubmit}>
          <label><span>Nome</span><input name="nome" required autoComplete="name" /></label>
          <label><span>E-mail</span><input name="email" type="email" required autoComplete="email" /></label>
          <label><span>Telefone (opcional)</span><input name="telefone" type="tel" autoComplete="tel" /></label>
          <label><span>Instituição</span><input name="instituicao" autoComplete="organization" /></label>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, opacity: 0 }} />
          <label className="chk"><input type="checkbox" name="lgpd" value="sim" required /><span>Autorizo o uso destes dados para contato, conforme a LGPD.</span></label>
          <button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Enviar pedido'}</button>
          {state === 'err' && <p className="err">Não foi possível enviar. Tente novamente.</p>}
        </form>
      )}
      {onClose && <button type="button" className="ghost" onClick={onClose}>Fechar</button>}
    </div>
  );
}
