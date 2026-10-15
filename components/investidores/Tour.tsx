'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PedidoAcesso from './PedidoAcesso';
import {
  AVISO_LEGAL, CENAS, ESTADOS, EN_RASCUNHO, HORIZONTES, LINHA_DO_TEMPO, LOCALIZACAO_A_CONFIRMAR, NOTA_HORIZONTES, SEMPRE_ESTUDO,
  type Estado, type Horizonte, type Lang,
} from '@/content/investidores/cenas';

type Props = { convite: string; pdfUrl: string | null; callUrl: string | null; dataroomUrl: string | null };
type Modo = 'autoguiado' | 'apresentacao';

const D = '/mapa/data/';
// Dados e motor do /mapa público, reaproveitados sem cópia. buildings, pois, isocronas e satélite ficam de fora (peso no celular).
const SCRIPTS = ['maplibre-gl-csp.js', 'assets.js', 'entorno.js', 'base.js'];
// Ativos que existem nos dados mas não entram na visita (fora dos fatos aprovados).
const OCULTOS = ['DC-Q', 'LT138', 'MANH', 'INST-RES', 'INST-21', 'APP', 'AV-UNIV', 'FORUM'];
const SRC = ['assets', 'entorno'] as const;

let carga: Promise<void> | null = null;
function carregarMotor() {
  if (carga) return carga;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = D + 'maplibre-gl.css';
  document.head.appendChild(css);
  carga = SCRIPTS.reduce(
    (p, f) => p.then(() => new Promise<void>((res, rej) => {
      const s = document.createElement('script');
      s.src = D + f; s.async = false; s.onload = () => res(); s.onerror = () => rej(new Error(f));
      document.head.appendChild(s);
    })),
    Promise.resolve(),
  );
  return carga;
}

function bboxCentro(f: any): [number, number] {
  const g = f.geometry;
  const partes: number[][][] = g.type === 'MultiPolygon' ? g.coordinates.map((p: any) => p[0])
    : g.type === 'Polygon' ? [g.coordinates[0]]
    : g.type === 'MultiLineString' ? g.coordinates : [g.coordinates];
  const box = (pts: number[][]) => pts.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [1e9, 1e9, -1e9, -1e9]);
  if (g.type.endsWith('LineString')) {
    const linha = partes.reduce((a, b) => (b.length > a.length ? b : a), partes[0]);
    return linha[Math.floor(linha.length / 2)] as [number, number];
  }
  let melhor = box(partes[0]);
  for (const p of partes) { const b = box(p); if ((b[2] - b[0]) * (b[3] - b[1]) > (melhor[2] - melhor[0]) * (melhor[3] - melhor[1])) melhor = b; }
  return [(melhor[0] + melhor[2]) / 2, (melhor[1] + melhor[3]) / 2];
}

const corExpr = (): any => ['match', ['coalesce', ['feature-state', 'tl'], 'nenhum'],
  'existente', ESTADOS.existente.cor, 'desenvolvimento', ESTADOS.desenvolvimento.cor, 'previsto', ESTADOS.previsto.cor, 'estudo', ESTADOS.estudo.cor, '#8AA39B'];

export default function Tour({ convite, pdfUrl, callUrl, dataroomUrl }: Props) {
  const [i, setI] = useState(0);
  const [lang, setLang] = useState<Lang>('pt');
  const [modo, setModo] = useState<Modo>('autoguiado');
  const [hor, setHor] = useState<Horizonte>(0);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);
  const [modal, setModal] = useState<null | 'conversa' | 'dataroom'>(null);
  const mapRef = useRef<any>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const corpoRef = useRef<HTMLDivElement>(null);
  const markers = useRef<any[]>([]);
  const dados = useRef<{ feats: Record<string, any>; src: Record<string, string> }>({ feats: {}, src: {} });
  const touch = useRef<[number, number] | null>(null);
  const cena = CENAS[i];
  const t = (x: { pt: string; en: string }) => x[lang];
  const ultimo = i === CENAS.length - 1;

  useEffect(() => { if (navigator.language?.toLowerCase().startsWith('en')) setLang('en'); }, []);
  useEffect(() => { corpoRef.current?.scrollTo({ top: 0 }); }, [i]);
  useEffect(() => { document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'; }, [lang]);

  const ir = useCallback((n: number) => setI(x => Math.max(0, Math.min(CENAS.length - 1, typeof n === 'number' ? n : x))), []);
  const prox = useCallback(() => setI(x => Math.min(CENAS.length - 1, x + 1)), []);
  const ant = useCallback(() => setI(x => Math.max(0, x - 1)), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
      if ((e.target as HTMLElement)?.closest?.('input,textarea')) return;
      if (e.key === 'ArrowRight') prox();
      if (e.key === 'ArrowLeft') ant();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [prox, ant]);

  // ---- mapa ----
  useEffect(() => {
    let vivo = true;
    carregarMotor().then(() => {
      if (!vivo || !boxRef.current) return;
      const W = window as any;
      const ml = W.maplibregl;
      ml.setWorkerUrl(D + 'maplibre-gl-csp-worker.js');
      const feats: Record<string, any> = {}, src: Record<string, string> = {};
      W.DATA_ASSETS.features.forEach((f: any) => { feats[f.properties.id] = f; src[f.properties.id] = 'assets'; });
      W.DATA_ENTORNO.features.forEach((f: any) => { feats[f.properties.id] = f; src[f.properties.id] = 'entorno'; });
      dados.current = { feats, src };

      const map = new ml.Map({
        container: boxRef.current, center: CENAS[0].camera.center, zoom: CENAS[0].camera.zoom, minZoom: 9.5, maxZoom: 17.5,
        attributionControl: false, dragRotate: false, pitchWithRotate: false, cooperativeGestures: false,
        style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#EDF1EC' } }] },
      });
      mapRef.current = map;
      map.addControl(new ml.AttributionControl({ compact: true, customAttribution: 'Dados: © OpenStreetMap (ODbL)' }), 'bottom-right');
      map.on('error', () => undefined);
      map.on('load', () => {
        if (!vivo) return;
        map.addSource('base', { type: 'geojson', data: W.DATA_BASE });
        map.addSource('assets', { type: 'geojson', data: W.DATA_ASSETS, promoteId: 'id' });
        map.addSource('entorno', { type: 'geojson', data: W.DATA_ENTORNO, promoteId: 'id' });
        const c = document.createElement('canvas'); c.width = c.height = 16;
        const x = c.getContext('2d')!; x.strokeStyle = '#2F5D8A'; x.lineWidth = 2.2; x.beginPath();
        for (let k = -16; k <= 32; k += 8) { x.moveTo(k, 16); x.lineTo(k + 16, 0); }
        x.stroke(); map.addImage('hatch', x.getImageData(0, 0, 16, 16), { pixelRatio: 1 });

        map.addLayer({ id: 'water', type: 'fill', source: 'base', filter: ['==', ['get', 'k'], 'water'], paint: { 'fill-color': '#BFD9E6', 'fill-opacity': .9 } });
        map.addLayer({ id: 'river', type: 'line', source: 'base', filter: ['==', ['get', 'k'], 'river'], paint: { 'line-color': '#BFD9E6', 'line-width': 1.4 } });
        map.addLayer({ id: 'road-minor', type: 'line', source: 'base', minzoom: 13.2, filter: ['all', ['==', ['get', 'k'], 'road'], ['>=', ['get', 'r'], 3], ['<=', ['get', 'r'], 5]], paint: { 'line-color': '#D2D9D3', 'line-width': ['interpolate', ['linear'], ['zoom'], 13, .6, 17, 2.4] } });
        map.addLayer({ id: 'road-major', type: 'line', source: 'base', filter: ['all', ['==', ['get', 'k'], 'road'], ['<=', ['get', 'r'], 2]], paint: { 'line-color': '#B9C4BC', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 17, 4] } });

        const poly: any = ['==', ['geometry-type'], 'Polygon'], lin: any = ['==', ['geometry-type'], 'LineString'];
        for (const s of SRC) {
          map.addLayer({ id: `${s}-dim-fill`, type: 'fill', source: s, filter: poly, paint: { 'fill-color': '#9DB3AB', 'fill-opacity': .16 } });
          map.addLayer({ id: `${s}-dim-line`, type: 'line', source: s, filter: ['any', poly, lin], paint: { 'line-color': '#7D958D', 'line-opacity': .45, 'line-width': .8 } });
          map.addLayer({ id: `${s}-hl-fill`, type: 'fill', source: s, filter: poly, paint: { 'fill-color': corExpr(), 'fill-opacity': ['case', ['==', ['coalesce', ['feature-state', 'tl'], ''], 'existente'], .55, ['==', ['coalesce', ['feature-state', 'tl'], ''], 'desenvolvimento'], .5, .3] } });
          map.addLayer({ id: `${s}-hl-hatch`, type: 'fill', source: s, filter: poly, paint: { 'fill-pattern': 'hatch', 'fill-opacity': .7 } });
          map.addLayer({ id: `${s}-hl-line`, type: 'line', source: s, filter: poly, paint: { 'line-color': corExpr(), 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.2, 16, 2.6] } });
          map.addLayer({ id: `${s}-hl-road`, type: 'line', source: s, filter: lin, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': corExpr(), 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 16, 7] } });
        }
        if (vivo) setPronto(true);
      });
    }).catch(() => vivo && setErro(true));
    return () => { vivo = false; markers.current.forEach(m => m.remove()); mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // estados da linha do tempo
  useEffect(() => {
    const map = mapRef.current;
    if (!pronto || !map) return;
    for (const [id, trio] of Object.entries(LINHA_DO_TEMPO)) {
      const s = dados.current.src[id];
      if (s) map.setFeatureState({ source: s, id }, { tl: SEMPRE_ESTUDO.has(id) && hor < 2 ? 'estudo' : trio[hor] });
    }
  }, [pronto, hor]);

  // cena: destaque, rótulos e câmera
  useEffect(() => {
    const map = mapRef.current;
    if (!pronto || !map) return;
    const ml = (window as any).maplibregl;
    const hl = cena.destaque.length ? cena.destaque : ['__nenhum'];
    const idIn: any = ['in', ['get', 'id'], ['literal', hl]];
    const poly: any = ['==', ['geometry-type'], 'Polygon'], lin: any = ['==', ['geometry-type'], 'LineString'];
    const estudo = cena.destaque.filter(d => SEMPRE_ESTUDO.has(d));
    for (const s of SRC) {
      map.setFilter(`${s}-dim-fill`, ['all', poly, ['!', ['in', ['get', 'id'], ['literal', [...OCULTOS, ...hl]]]]]);
      map.setFilter(`${s}-dim-line`, ['all', ['any', poly, lin], ['!', ['in', ['get', 'id'], ['literal', [...OCULTOS, ...hl]]]]]);
      map.setFilter(`${s}-hl-fill`, ['all', poly, idIn]);
      map.setFilter(`${s}-hl-line`, ['all', poly, idIn]);
      map.setFilter(`${s}-hl-road`, ['all', lin, idIn]);
      map.setFilter(`${s}-hl-hatch`, ['all', poly, ['in', ['get', 'id'], ['literal', estudo.length ? estudo : ['__nenhum']]]]);
    }
    markers.current.forEach(m => m.remove());
    markers.current = [];
    const vistos = new Set<string>();
    cena.destaque.forEach(id => {
      const f = dados.current.feats[id];
      if (!f) return;
      const el = document.createElement('div');
      el.className = 'pin';
      const nome = String(f.properties.nome || id).replace(/\s*\(.*$/, '').split(' · ')[0];
      el.textContent = nome + (SEMPRE_ESTUDO.has(id) ? (lang === 'en' ? ' · conceptual study' : ' · estudo conceitual') : '');
      if (vistos.has(el.textContent)) return;
      vistos.add(el.textContent);
      markers.current.push(new ml.Marker({ element: el, anchor: 'center' }).setLngLat(bboxCentro(f)).addTo(map));
    });
    const mobile = window.innerWidth < 900;
    const pad = mobile
      ? { top: 64, left: 16, right: 16, bottom: (sheetRef.current?.offsetHeight || 320) + 16 }
      : { top: 40, bottom: 40, right: 40, left: (sheetRef.current?.offsetWidth || 440) + 40 };
    map.flyTo({ center: cena.camera.center, zoom: cena.camera.zoom, pitch: 0, bearing: 0, padding: pad, duration: 1300, essential: true });
  }, [pronto, i, lang, cena]);

  useEffect(() => {
    const h = () => mapRef.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  useEffect(() => { setTimeout(() => mapRef.current?.resize(), 80); }, [modo, pronto]);

  const verNoMapa = (id: string) => {
    const f = dados.current.feats[id];
    if (f && mapRef.current) mapRef.current.flyTo({ center: bboxCentro(f), zoom: Math.max(cena.camera.zoom, 14), duration: 900, essential: true });
  };

  const estadosVisiveis = useMemo(() => {
    const usados = new Set<Estado>();
    cena.destaque.forEach(id => {
      const trio = LINHA_DO_TEMPO[id];
      if (trio) usados.add(SEMPRE_ESTUDO.has(id) && hor < 2 ? 'estudo' : trio[hor]);
    });
    return (Object.keys(ESTADOS) as Estado[]).filter(e => usados.has(e));
  }, [cena, hor]);

  const cta = (tipo: 'conversa' | 'dataroom', url: string | null, rotulo: string, primario: boolean) =>
    url
      ? <a className={primario ? 'btn pri' : 'btn'} href={url} target="_blank" rel="noopener noreferrer">{rotulo}</a>
      : <button className={primario ? 'btn pri' : 'btn'} onClick={() => setModal(tipo)}>{rotulo}</button>;

  return (
    <div className={`tour modo-${modo}`}>
      <header className="topo">
        <div className="marca"><b>Chapéu do Sol</b><small>VISITA VIRTUAL</small></div>
        <div className="ctl">
          <div className="seg" role="group" aria-label={lang === 'en' ? 'Mode' : 'Modo'}>
            <button aria-pressed={modo === 'autoguiado'} onClick={() => setModo('autoguiado')}>{lang === 'en' ? 'Self-guided' : 'Autoguiado'}</button>
            <button aria-pressed={modo === 'apresentacao'} onClick={() => setModo('apresentacao')}>{lang === 'en' ? 'Presentation' : 'Apresentação'}</button>
          </div>
          <div className="seg" role="group" aria-label="Idioma">
            <button aria-pressed={lang === 'pt'} onClick={() => setLang('pt')}>PT</button>
            <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
      </header>

      <div className="mapa" ref={boxRef} aria-label={lang === 'en' ? 'Map of Distrito Chapéu do Sol' : 'Mapa do Distrito Chapéu do Sol'} />
      {!pronto && !erro && <div className="carga">{lang === 'en' ? 'Loading map…' : 'Carregando o mapa…'}</div>}
      {erro && <div className="carga">{lang === 'en' ? 'Could not load the map. Reload the page.' : 'Não foi possível carregar o mapa. Recarregue a página.'}</div>}

      <aside className="sheet" ref={sheetRef}
        onTouchStart={e => { touch.current = [e.touches[0].clientX, e.touches[0].clientY]; }}
        onTouchEnd={e => {
          const s = touch.current; touch.current = null; if (!s) return;
          const dx = e.changedTouches[0].clientX - s[0], dy = e.changedTouches[0].clientY - s[1];
          if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) (dx < 0 ? prox : ant)();
        }}>
        <div className="corpo" ref={corpoRef}>
          <div className="prog" role="tablist" aria-label={lang === 'en' ? 'Scenes' : 'Cenas'}>
            {CENAS.map((c, n) => <button key={c.id} role="tab" aria-selected={n === i} aria-label={`${n + 1}. ${t(c.titulo)}`} className={n === i ? 'on' : n < i ? 'fei' : ''} onClick={() => ir(n)} />)}
          </div>
          <p className="eyebrow">{lang === 'en' ? 'Scene' : 'Cena'} {i + 1} / {CENAS.length}{lang === 'en' && EN_RASCUNHO ? ' · EN draft for review' : ''}</p>
          <h1>{t(cena.titulo)}</h1>
          <p className="texto">{t(cena.texto)}</p>
          <p className="tags">{cena.etiquetas.map(e => <span key={e.pt}>[{t(e)}]</span>)}</p>

          {cena.estudoConceitual && <p className="estudo"><b>{lang === 'en' ? 'Conceptual study, not approved.' : 'Estudo conceitual, sem aprovação.'}</b> {lang === 'en' ? 'Lots and warehouse blocks shown are not approved and no construction exists.' : 'Lotes e quadras de galpão não têm aprovação e não há construção.'}</p>}

          {cena.imagem && <img className="eco" src={cena.imagem} alt={lang === 'en' ? 'Ecosystem cycle: land, companies, education, housing, services and capital around contracted recurring revenue' : 'Ciclo do ecossistema: território, empresas, educação, moradia, serviços e capital em torno da receita recorrente contratada'} />}

          {cena.painel && (
            <ul className="painel">
              {cena.painel.map(p => (
                <li key={p.rotulo.pt}>
                  <b>{t(p.rotulo)}</b>
                  <span>{t(p.detalhe)} <em>[{t(p.etiqueta)}]</em></span>
                  {p.semCoordenada && <small className="conf">{t(LOCALIZACAO_A_CONFIRMAR)}</small>}
                  {p.ativo && <button className="ver" onClick={() => verNoMapa(p.ativo!)}>{lang === 'en' ? 'See on map' : 'Ver no mapa'}</button>}
                </li>
              ))}
            </ul>
          )}

          {cena.destaque.length > 0 && <section className="tempo" aria-label={lang === 'en' ? 'Timeline' : 'Linha do tempo'}>
            <div className="seg claro" role="group">
              {HORIZONTES.map(h => <button key={h.id} aria-pressed={hor === h.id} onClick={() => setHor(h.id)}>{t(h.rotulo)}</button>)}
            </div>
            <ul className="leg">
              {estadosVisiveis.map(e => <li key={e}><i style={{ background: ESTADOS[e].cor }} />{t(ESTADOS[e].rotulo)}</li>)}
            </ul>
            {hor > 0 && <p className="nota">{t(NOTA_HORIZONTES)}</p>}
          </section>}

          {ultimo && (
            <div className="ctas">
              {cta('conversa', callUrl, lang === 'en' ? 'Schedule a conversation' : 'Agendar uma conversa', true)}
              {cta('dataroom', dataroomUrl, lang === 'en' ? 'Access the data room' : 'Acessar o data room', false)}
            </div>
          )}
          {pdfUrl && <a className="pdf" href={pdfUrl} target="_blank" rel="noopener noreferrer">{lang === 'en' ? 'Download presentation' : 'Baixar apresentação'}</a>}
          <p className="convite">{lang === 'en' ? 'Invitation' : 'Convite'}: {convite}</p>
        </div>

        <nav className="nav">
          <button className="btn" onClick={ant} disabled={i === 0}>{lang === 'en' ? 'Back' : 'Anterior'}</button>
          <button className="btn pri" onClick={prox} disabled={ultimo}>{lang === 'en' ? 'Next' : 'Próxima'}</button>
        </nav>
        <p className="aviso" role="note">{t(AVISO_LEGAL)}</p>
      </aside>

      {modal && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()}><PedidoAcesso modo={modal} onClose={() => setModal(null)} /></div>
        </div>
      )}
    </div>
  );
}
