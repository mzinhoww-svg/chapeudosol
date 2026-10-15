'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PedidoAcesso from './PedidoAcesso';
import {
  AVISO_LEGAL, CENAS, ESTADO, ESTADOS, EN_RASCUNHO, HORIZONTES, LOCALIZACAO_A_CONFIRMAR, META, METAS, NOTA_HORIZONTES, ROTULOS,
  SEMPRE_ESTUDO, SUFIXO_ESTUDO, type Estado, type Horizonte, type Lang,
} from '@/content/investidores/cenas';
import { VOLUMES } from '@/content/investidores/volumes';

type Props = { convite: string; pdfUrl: string | null; callUrl: string | null; dataroomUrl: string | null };
type Modo = 'autoguiado' | 'apresentacao';
type Rotulo = { m: any; el: HTMLElement };

const D = '/mapa/data/';
// Motor e dados do /mapa público, sem cópia. Satélite reduzido (celular), recorte de prédios e contornos
// são derivados dos mesmos dados por scripts/visita_investidores.py.
const SCRIPTS = ['maplibre-gl-csp.js', 'assets.js', 'entorno.js', 'base.js'];
// Ativos que existem nos dados mas não entram na visita (fora dos fatos aprovados).
const OCULTOS = ['DC-Q', 'LT138', 'MANH', 'INST-RES', 'INST-21', 'APP', 'AV-UNIV', 'FORUM'];
const SRC = ['assets', 'entorno'] as const;
const SAT_REGIAO = [[-56.42578125, -15.411319377980991], [-55.96435546875, -15.411319377980991], [-55.96435546875, -15.79225357036244], [-56.42578125, -15.79225357036244]];
const SW = -56.25, SS = -15.623036831528259, SE = -56.1346435546875, SN = -15.543668254074865;
const SAT_MOSAICO = [[SW, SN], [SE, SN], [SE, SS], [SW, SS]];
const PAREDE = 26; // m: faixa de luz em volta de ativos existentes ou em desenvolvimento
const HASTE = 30; // px: haste dos rótulos (igual ao CSS)
const NADA = ['__nenhum'];
const lista = (ids: readonly string[]) => ['literal', ids.length ? [...ids] : NADA];
const POLY: any = ['==', ['geometry-type'], 'Polygon'];
const LIN: any = ['==', ['geometry-type'], 'LineString'];

const corDoEstado = (e?: Estado) => (e ? ESTADOS[e].cor : '#FFFFFF');
const COR_ATIVO: any = ['match', ['get', 'id'], ...Object.entries(ESTADO).flatMap(([id, e]) => [id, ESTADOS[e].cor]), '#FFFFFF'];
const NEUTRO: any = ['match', ['get', 'b'], 'house', '#EFE8DA', ['university', 'school', 'college', 'public', 'civic', 'hospital'], '#D6E2EE',
  ['industrial', 'warehouse'], '#DEDBE3', ['apartments', 'residential', 'commercial', 'retail', 'office', 'hotel'], '#F0DFCA', '#E9E3D6'];
// Construções dentro de um ativo em destaque ganham a cor do estado; as demais ficam neutras, como numa maquete.
function corPredios(ids: string[]): any {
  const pares = ids.filter(id => ESTADO[id] && ESTADO[id] !== 'estudo').flatMap(id => [id, ESTADOS[ESTADO[id]].cor]);
  return pares.length ? ['match', ['coalesce', ['get', 'a'], ''], ...pares, NEUTRO] : NEUTRO;
}

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
  carga.catch(() => { carga = null; });
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

// Contorno -> faixas finas (2,4 m) que viram paredes de luz em fill-extrusion.
function faixas(fc: any) {
  const out: any[] = [];
  for (const f of fc.features) {
    for (const anel of f.geometry.coordinates) {
      for (let k = 0; k < anel.length - 1; k++) {
        const a = anel[k], b = anel[k + 1];
        const kx = 111320 * Math.cos((a[1] * Math.PI) / 180), ky = 110574;
        const dx = (b[0] - a[0]) * kx, dy = (b[1] - a[1]) * ky, L = Math.hypot(dx, dy);
        if (L < 0.5) continue;
        const nx = ((-dy / L) * 1.2) / kx, ny = ((dx / L) * 1.2) / ky;
        out.push({ type: 'Feature', properties: { id: f.properties.id }, geometry: { type: 'Polygon', coordinates: [[[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny], [a[0] + nx, a[1] + ny]]] } });
      }
    }
  }
  return { type: 'FeatureCollection', features: out };
}

function criarPin(texto: string, cor: string, classe = '') {
  const el = document.createElement('div');
  el.className = `pin ${classe}`.trim();
  el.style.setProperty('--c', cor);
  const s = document.createElement('span');
  s.textContent = texto;
  el.append(s, document.createElement('i'));
  return el;
}

export default function Tour({ convite, pdfUrl, callUrl, dataroomUrl }: Props) {
  const [i, setI] = useState(0);
  const [lang, setLang] = useState<Lang>('pt');
  const [modo, setModo] = useState<Modo>('autoguiado');
  const [hor, setHor] = useState<Horizonte>(0);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);
  const [recolhido, setRecolhido] = useState(false);
  const [dica, setDica] = useState(true); // como girar o mapa; some no primeiro toque
  const [toque, setToque] = useState(false);
  const [modal, setModal] = useState<null | 'conversa' | 'dataroom'>(null);
  const mapRef = useRef<any>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const corpoRef = useRef<HTMLDivElement>(null);
  const rotulos = useRef<Rotulo[]>([]);
  const rotuloMeta = useRef<Rotulo | null>(null);
  const dados = useRef<{ feats: Record<string, any> }>({ feats: {} });
  const touch = useRef<[number, number] | null>(null);
  const voo = useRef(0);
  const orbita = useRef(0);
  const parado = useRef(false); // o usuário mexeu no mapa: sem órbita até a próxima cena
  const tocouLinha = useRef(false);
  const autoplay = useRef<number[]>([]);
  const anim = useRef(0);
  const quadro = useRef(0);
  const reduz = useRef(false);
  const prediosPedidos = useRef(false);
  const modoRef = useRef(modo);
  modoRef.current = modo;
  const cena = CENAS[i];
  const cenaRef = useRef(cena);
  cenaRef.current = cena;
  const t = (x: { pt: string; en: string }) => x[lang];
  const ultimo = i === CENAS.length - 1;

  useEffect(() => { corpoRef.current?.scrollTo({ top: 0 }); }, [i]);
  useEffect(() => { setToque(window.matchMedia('(pointer: coarse)').matches); }, []);
  useEffect(() => { document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'; }, [lang]);

  const ir = useCallback((n: number) => { setI(Math.max(0, Math.min(CENAS.length - 1, n))); setHor(0); }, []);
  const prox = useCallback(() => { setI(x => Math.min(CENAS.length - 1, x + 1)); setHor(0); }, []);
  const ant = useCallback(() => { setI(x => Math.max(0, x - 1)); setHor(0); }, []);
  const pararAutoplay = () => { autoplay.current.forEach(clearTimeout); autoplay.current = []; };

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

  // Espaço livre do mapa: o painel cobre a esquerda (desktop) ou a parte de baixo (celular).
  const folga = useCallback(() => {
    const sh = sheetRef.current;
    return window.innerWidth < 900
      ? { top: 70, left: 18, right: 18, bottom: (sh?.offsetHeight || 320) + 8 }
      : { top: 70, bottom: 40, right: 70, left: (sh?.offsetWidth || 440) + 40 };
  }, []);

  // Rótulos: esconde os que saem da área livre ou batem em outro de maior prioridade (meta primeiro, depois a ordem do destaque).
  const arrumar = useCallback(() => {
    const map = mapRef.current, box = boxRef.current;
    if (!map || !box) return;
    const W = box.clientWidth, H = box.clientHeight, sh = sheetRef.current;
    const celular = W < 900;
    const x0 = celular ? 6 : (sh?.offsetWidth || 440) + 8, x1 = W - 8;
    const y0 = celular ? 56 : 60, y1 = celular ? H - (sh?.offsetHeight || 0) - 6 : H - 28;
    const usados: number[][] = [];
    for (const r of [...(rotuloMeta.current ? [rotuloMeta.current] : []), ...rotulos.current]) {
      const p = map.project(r.m.getLngLat());
      const tx = r.el.firstElementChild as HTMLElement;
      const w = tx.offsetWidth, h = tx.offsetHeight + HASTE;
      const b = [p.x - w / 2, p.y - h, p.x + w / 2, p.y + 4];
      const fora = b[0] < x0 || b[2] > x1 || b[1] < y0 || b[3] > y1;
      const bate = usados.some(o => !(b[2] + 6 < o[0] || b[0] - 6 > o[2] || b[3] < o[1] || b[1] > o[3]));
      const ok = !fora && !bate;
      r.el.classList.toggle('oculto', !ok);
      if (ok) usados.push([b[0], b[1], b[2], b[1] + tx.offsetHeight + 4]);
    }
  }, []);

  const aplicarCena = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const hl = cenaRef.current.destaque;
    const estudo = hl.filter(id => SEMPRE_ESTUDO.has(id));
    const real = hl.filter(id => ESTADO[id] && ESTADO[id] !== 'estudo');
    const inHl: any = ['in', ['get', 'id'], lista(hl)];
    const inEstudo: any = ['in', ['get', 'id'], lista(estudo)];
    for (const s of SRC) {
      if (!map.getLayer(`${s}-dim`)) continue;
      map.setFilter(`${s}-dim`, ['all', ['any', POLY, LIN], ['!', ['in', ['get', 'id'], lista([...OCULTOS, ...hl])]]]);
      map.setFilter(`${s}-fill`, ['all', POLY, inHl]);
      map.setFilter(`${s}-hatch`, ['all', POLY, inEstudo]);
      map.setFilter(`${s}-casing`, ['all', ['any', POLY, LIN], inHl]);
      map.setFilter(`${s}-line`, ['all', POLY, inHl, ['!', inEstudo]]);
      map.setFilter(`${s}-line-estudo`, ['all', POLY, inEstudo]);
      map.setFilter(`${s}-road`, ['all', LIN, inHl]);
    }
    if (map.getLayer('paredes')) map.setFilter('paredes', ['in', ['get', 'id'], lista(real)]);
    if (map.getLayer('predios')) map.setPaintProperty('predios', 'fill-extrusion-color', corPredios(hl));
  }, []);

  const carregarPredios = useCallback(() => {
    const map = mapRef.current;
    if (!map || prediosPedidos.current) return;
    prediosPedidos.current = true;
    // Só construções reais do OpenStreetMap. Carrega depois da primeira cena para não pesar a abertura.
    map.addSource('predios', { type: 'geojson', data: D + 'predios_visita.json' });
    map.addLayer({
      id: 'predios', type: 'fill-extrusion', source: 'predios', minzoom: 11,
      paint: { 'fill-extrusion-color': corPredios(cenaRef.current.destaque), 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.95, 'fill-extrusion-vertical-gradient': true },
    }, map.getLayer('paredes') ? 'paredes' : 'meta-vol');
  }, []);

  // Órbita lenta no modo Apresentação. Para de vez quando o usuário mexe no mapa, até a próxima cena.
  const orbitar = useCallback(() => {
    const map = mapRef.current;
    if (!map || modoRef.current !== 'apresentacao' || reduz.current || parado.current) return;
    const ficha = ++orbita.current;
    const alvo = map.getBearing() + 36;
    map.easeTo({ bearing: alvo, duration: 42000, easing: (x: number) => x, essential: true });
    map.once('moveend', () => {
      if (ficha !== orbita.current) return;
      const resto = Math.abs((((map.getBearing() - alvo) % 360) + 540) % 360 - 180);
      if (resto < 0.6) orbitar();
    });
  }, []);

  const chegou = useCallback((n: number) => {
    if (n !== voo.current) return;
    if (!prediosPedidos.current) {
      const w = window as any;
      if (w.requestIdleCallback) w.requestIdleCallback(carregarPredios, { timeout: 1500 }); else setTimeout(carregarPredios, 300);
    }
    if (cenaRef.current.linhaDoTempo && !reduz.current && !tocouLinha.current) {
      autoplay.current.push(window.setTimeout(() => setHor(1), 1100), window.setTimeout(() => setHor(2), 3600));
    }
    orbitar();
  }, [carregarPredios, orbitar]);

  // ---- mapa ----
  useEffect(() => {
    let vivo = true;
    reduz.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    carregarMotor().then(() => {
      if (!vivo || !boxRef.current) return;
      const W = window as any;
      const ml = W.maplibregl;
      ml.setWorkerUrl(D + 'maplibre-gl-csp-worker.js');
      const feats: Record<string, any> = {};
      W.DATA_ASSETS.features.forEach((f: any) => { feats[f.properties.id] = f; });
      W.DATA_ENTORNO.features.forEach((f: any) => { feats[f.properties.id] = f; });
      dados.current = { feats };

      const leve = window.innerWidth < 900 || window.matchMedia('(pointer: coarse)').matches;
      const sfx = leve ? '_md' : '';
      const c0 = CENAS[0].camera;
      let map: any;
      try {
        map = new ml.Map({
          container: boxRef.current, center: c0.center, zoom: c0.zoom - 1.7, pitch: 0, bearing: 0,
          minZoom: 9.5, maxZoom: 17.5, maxPitch: 68, attributionControl: false, keyboard: false,
          style: {
            version: 8, sources: {},
            layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#3A4532' } }],
            sky: { 'sky-color': '#AFC9D6', 'horizon-color': '#E3EBE7', 'fog-color': '#E3EBE7', 'sky-horizon-blend': 0.7, 'horizon-fog-blend': 0.8, 'fog-ground-blend': 0.6, 'atmosphere-blend': 0 },
            light: { anchor: 'viewport', color: '#FFFFFF', intensity: 0.34, position: [1.2, 205, 32] },
          },
        });
      } catch {
        setErro(true);
        return;
      }
      mapRef.current = map;
      map.addControl(new ml.NavigationControl({ showZoom: !leve, visualizePitch: true }), 'top-right');
      map.addControl(new ml.AttributionControl({ compact: true, customAttribution: 'Imagens: Esri World Imagery (Esri, Maxar, Earthstar Geographics) · Dados: © OpenStreetMap (ODbL)' }), leve ? 'top-right' : 'bottom-right');
      // No celular a atribuição começa recolhida (botão "i"); no desktop fica aberta no canto.
      if (leve) map.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
      map.on('error', () => undefined);

      const neblina = document.createElement('div');
      neblina.className = 'neblina';
      map.getCanvasContainer().appendChild(neblina);
      const mexeu = () => { parado.current = true; setDica(false); };
      const cont = map.getContainer();
      cont.addEventListener('pointerdown', mexeu);
      cont.addEventListener('wheel', mexeu, { passive: true });
      cont.addEventListener('touchstart', mexeu, { passive: true });
      // Um ajuste de rótulos por quadro durante o movimento (sem cancelar: o mapa dispara "move" a cada quadro).
      let agendado = false;
      map.on('move', () => {
        neblina.style.opacity = String(Math.max(0, Math.min(1, (map.getPitch() - 22) / 30)));
        if (agendado) return;
        agendado = true;
        quadro.current = requestAnimationFrame(() => { agendado = false; arrumar(); });
      });

      map.on('load', () => {
        if (!vivo) return;
        map.addSource('satr', { type: 'image', url: D + `sat_regiao${sfx}.jpg`, coordinates: SAT_REGIAO });
        map.addSource('sat', { type: 'image', url: D + `sat_mosaico${sfx}.jpg`, coordinates: SAT_MOSAICO });
        map.addSource('base', { type: 'geojson', data: W.DATA_BASE });
        map.addSource('assets', { type: 'geojson', data: W.DATA_ASSETS });
        map.addSource('entorno', { type: 'geojson', data: W.DATA_ENTORNO });
        map.addSource('metas', { type: 'geojson', data: VOLUMES as any, promoteId: 'id' });

        // Hachura do estudo conceitual, desenhada na densidade da tela para não engrossar no celular.
        const dpr = Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)));
        const lado = 16 * dpr;
        const c = document.createElement('canvas'); c.width = c.height = lado;
        const x = c.getContext('2d')!; x.strokeStyle = 'rgba(214,230,250,.95)'; x.lineWidth = 1.6 * dpr; x.beginPath();
        for (let k = -lado; k <= 2 * lado; k += lado / 2) { x.moveTo(k, lado); x.lineTo(k + lado, 0); }
        x.stroke(); map.addImage('hatch', x.getImageData(0, 0, lado, lado), { pixelRatio: dpr });

        map.addLayer({ id: 'satr', type: 'raster', source: 'satr', paint: { 'raster-fade-duration': 0, 'raster-saturation': -0.12, 'raster-brightness-max': 0.93 } });
        map.addLayer({ id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-fade-duration': 0, 'raster-saturation': -0.08, 'raster-brightness-max': 0.96 } });
        map.addLayer({ id: 'water', type: 'fill', source: 'base', filter: ['==', ['get', 'k'], 'water'], paint: { 'fill-color': '#3E7FA6', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.12, 14, 0.3] } });
        map.addLayer({ id: 'road-minor', type: 'line', source: 'base', minzoom: 13, filter: ['all', ['==', ['get', 'k'], 'road'], ['==', ['get', 'r'], 3]], paint: { 'line-color': '#FFFFFF', 'line-opacity': 0.4, 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.6, 17, 3] } });
        map.addLayer({ id: 'road-major', type: 'line', source: 'base', filter: ['all', ['==', ['get', 'k'], 'road'], ['<=', ['get', 'r'], 2]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FFE8B0', 'line-opacity': 0.75, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 13, 2.2, 16, 6] } });

        for (const s of SRC) {
          map.addLayer({ id: `${s}-dim`, type: 'line', source: s, filter: ['all', ['any', POLY, LIN], ['!', ['in', ['get', 'id'], lista(OCULTOS)]]], paint: { 'line-color': '#FFFFFF', 'line-opacity': 0.3, 'line-width': 0.8 } });
          map.addLayer({ id: `${s}-fill`, type: 'fill', source: s, filter: ['all', POLY, ['in', ['get', 'id'], lista([])]], paint: { 'fill-color': COR_ATIVO, 'fill-opacity': ['match', ['get', 'id'], [...SEMPRE_ESTUDO], 0.12, 0.3] } });
          map.addLayer({ id: `${s}-hatch`, type: 'fill', source: s, filter: ['all', POLY, ['in', ['get', 'id'], lista([])]], paint: { 'fill-pattern': 'hatch', 'fill-opacity': 0.55 } });
          map.addLayer({ id: `${s}-casing`, type: 'line', source: s, filter: ['all', POLY, ['in', ['get', 'id'], lista([])]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-opacity': 0.85, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, ['case', LIN, 4.5, 3], 16, ['case', LIN, 11, 5.5]] } });
          map.addLayer({ id: `${s}-line`, type: 'line', source: s, filter: ['all', POLY, ['in', ['get', 'id'], lista([])]], layout: { 'line-join': 'round' }, paint: { 'line-color': COR_ATIVO, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.4, 16, 3] } });
          map.addLayer({ id: `${s}-line-estudo`, type: 'line', source: s, filter: ['all', POLY, ['in', ['get', 'id'], lista([])]], paint: { 'line-color': COR_ATIVO, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.4, 16, 3], 'line-dasharray': [2.2, 1.6] } });
          map.addLayer({ id: `${s}-road`, type: 'line', source: s, filter: ['all', LIN, ['in', ['get', 'id'], lista([])]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': COR_ATIVO, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.6, 16, 7] } });
        }

        map.addLayer({ id: 'meta-base', type: 'fill', source: 'metas', filter: ['in', ['get', 'id'], lista([])], paint: { 'fill-color': META.cor, 'fill-opacity': 0.5 } });
        map.addLayer({ id: 'meta-line', type: 'line', source: 'metas', filter: ['in', ['get', 'id'], lista([])], paint: { 'line-color': '#FFFFFF', 'line-width': 2, 'line-dasharray': [2, 1.5] } });
        map.addLayer({
          id: 'meta-vol', type: 'fill-extrusion', source: 'metas', filter: ['in', ['get', 'id'], lista([])],
          paint: { 'fill-extrusion-color': META.cor, 'fill-extrusion-height': ['*', ['get', 'h'], ['coalesce', ['feature-state', 'k'], 0]], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.88, 'fill-extrusion-vertical-gradient': true },
        });

        fetch(D + 'contornos_visita.json').then(r => r.json()).then(fc => {
          if (!vivo || !mapRef.current) return;
          map.addSource('paredes', { type: 'geojson', data: faixas(fc) });
          map.addLayer({
            id: 'paredes', type: 'fill-extrusion', source: 'paredes', filter: ['in', ['get', 'id'], lista([])],
            paint: { 'fill-extrusion-color': COR_ATIVO, 'fill-extrusion-height': PAREDE, 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.4, 'fill-extrusion-vertical-gradient': false },
          }, 'meta-vol');
          aplicarCena();
        }).catch(() => undefined);

        // Abre quando o satélite chega (ou depois de 7 s, para não travar a visita).
        let aberto = false;
        const abrir = () => { if (aberto || !vivo) return; aberto = true; setPronto(true); };
        map.once('idle', abrir);
        setTimeout(abrir, 7000);
      });
    }).catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
      pararAutoplay();
      cancelAnimationFrame(anim.current);
      cancelAnimationFrame(quadro.current);
      rotulos.current.forEach(r => r.m.remove());
      rotuloMeta.current?.m.remove();
      mapRef.current?.remove();
      mapRef.current = null;
      prediosPedidos.current = false;
    };
  }, [arrumar, aplicarCena]);

  // cena: destaque e câmera
  useEffect(() => {
    const map = mapRef.current;
    if (!pronto || !map) return;
    pararAutoplay();
    orbita.current++;
    parado.current = false;
    tocouLinha.current = false;
    aplicarCena();
    const c = cena.camera;
    const celular = window.innerWidth < 900;
    const alvo = { center: c.center, zoom: c.zoom - (celular ? 0.6 : 0), pitch: c.pitch, bearing: c.bearing, padding: folga() };
    const n = ++voo.current;
    if (reduz.current) { map.jumpTo(alvo); chegou(n); return; }
    map.flyTo({ ...alvo, duration: n === 1 ? 3600 : 2600, curve: 1.3, essential: true });
    map.once('moveend', () => chegou(n));
  }, [pronto, i, cena, aplicarCena, folga, chegou]);

  // rótulos dos ativos
  useEffect(() => {
    const map = mapRef.current;
    if (!pronto || !map) return;
    const ml = (window as any).maplibregl;
    rotulos.current.forEach(r => r.m.remove());
    rotulos.current = [];
    const vistos = new Set<string>();
    for (const id of cena.destaque) {
      const f = dados.current.feats[id];
      if (!f) continue;
      const base = ROTULOS[id]?.[lang] ?? String(f.properties.nome || id).replace(/\s*\(.*$/, '').split(' · ')[0];
      const texto = SEMPRE_ESTUDO.has(id) ? `${base} · ${SUFIXO_ESTUDO[lang]}` : base;
      if (vistos.has(texto)) continue;
      vistos.add(texto);
      const el = criarPin(texto, corDoEstado(ESTADO[id]));
      rotulos.current.push({ m: new ml.Marker({ element: el, anchor: 'bottom' }).setLngLat(bboxCentro(f)).addTo(map), el });
    }
    arrumar();
  }, [pronto, cena, lang, arrumar]);

  // metas de gestão: área no chão (2027) e volumes que sobem (2031)
  useEffect(() => {
    const map = mapRef.current;
    if (!pronto || !map) return;
    const meta = cena.linhaDoTempo ? METAS[hor] : null;
    const fs = meta ? VOLUMES.features.filter(f => meta.quadras.includes(f.properties.q)) : [];
    const ids = fs.map(f => f.properties.id);
    const vol = meta?.volume ? ids : [];
    cancelAnimationFrame(anim.current);
    vol.forEach(id => map.setFeatureState({ source: 'metas', id }, { k: 0 }));
    map.setFilter('meta-base', ['in', ['get', 'id'], lista(ids)]);
    map.setFilter('meta-line', ['in', ['get', 'id'], lista(ids)]);
    map.setFilter('meta-vol', ['in', ['get', 'id'], lista(vol)]);
    if (vol.length) {
      const t0 = performance.now(), dur = reduz.current ? 0 : 1900;
      const passo = (agora: number) => {
        const p = dur ? Math.min(1, (agora - t0) / dur) : 1;
        const k = 1 - Math.pow(1 - p, 3);
        vol.forEach(id => map.setFeatureState({ source: 'metas', id }, { k }));
        if (p < 1) anim.current = requestAnimationFrame(passo);
      };
      anim.current = requestAnimationFrame(passo);
    }
    rotuloMeta.current?.m.remove();
    rotuloMeta.current = null;
    if (meta && fs.length) {
      const ml = (window as any).maplibregl;
      const pts = fs.flatMap(f => f.geometry.coordinates[0].slice(0, -1));
      const centro = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
      const el = criarPin(`${meta.rotulo[lang]} · ${META.sufixo[lang]}`, META.cor, 'meta');
      rotuloMeta.current = { m: new ml.Marker({ element: el, anchor: 'bottom' }).setLngLat(centro).addTo(map), el };
    }
    arrumar();
  }, [pronto, cena, hor, lang, arrumar]);

  // painel recolhido (celular) ou troca de modo: recalcula o espaço livre sem refazer o voo da cena
  const leiaute = useRef('');
  const alvoPendente = useRef<{ center: [number, number]; zoom: number } | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    const chave = `${recolhido}|${modo}`;
    if (!pronto || !map || leiaute.current === '') { leiaute.current = chave; return; }
    if (leiaute.current === chave) return;
    leiaute.current = chave;
    orbita.current++;
    const id = window.setTimeout(() => {
      map.resize();
      // "Ver no mapa" no celular recolhe o painel e só então voa, já com o espaço livre novo.
      const destino = alvoPendente.current;
      alvoPendente.current = null;
      const mov = { ...(destino || {}), padding: folga() };
      if (reduz.current) { map.jumpTo(mov); arrumar(); return; }
      if (destino) map.flyTo({ ...mov, duration: 1400, essential: true });
      else map.easeTo({ ...mov, duration: 500 });
      map.once('moveend', () => { arrumar(); if (!destino) orbitar(); });
    }, 60);
    return () => clearTimeout(id);
  }, [recolhido, modo, pronto, folga, arrumar, orbitar]);

  useEffect(() => {
    const h = () => { mapRef.current?.resize(); arrumar(); };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [arrumar]);

  const verNoMapa = (id: string) => {
    const f = dados.current.feats[id], map = mapRef.current;
    if (!f || !map) return;
    parado.current = true;
    orbita.current++;
    const destino = { center: bboxCentro(f), zoom: Math.max(cena.camera.zoom, 14) - (window.innerWidth < 900 ? 0.4 : 0) };
    if (window.innerWidth < 900 && !recolhido) { alvoPendente.current = destino; setRecolhido(true); return; }
    map.flyTo({ ...destino, padding: folga(), duration: 1400, essential: true });
  };

  const escolherHorizonte = (h: Horizonte) => { tocouLinha.current = true; pararAutoplay(); setHor(h); };

  const legenda = useMemo(() => {
    const usados = new Set<Estado>();
    cena.destaque.forEach(id => { if (ESTADO[id]) usados.add(ESTADO[id]); });
    return (Object.keys(ESTADOS) as Estado[]).filter(e => usados.has(e));
  }, [cena]);
  const comMeta = !!cena.linhaDoTempo && hor > 0;

  const cta = (tipo: 'conversa' | 'dataroom', url: string | null, rotulo: string, primario: boolean) =>
    url
      ? <a className={primario ? 'btn pri' : 'btn'} href={url} target="_blank" rel="noopener noreferrer">{rotulo}</a>
      : <button className={primario ? 'btn pri' : 'btn'} onClick={() => setModal(tipo)}>{rotulo}</button>;

  return (
    <div className={`tour modo-${modo}`}>
      <header className="topo">
        <div className="marca"><b>Chapéu do Sol</b><small>VISITA VIRTUAL</small></div>
        <div className="ctl">
          <div className="seg modo" role="group" aria-label={lang === 'en' ? 'Mode' : 'Modo'}>
            <button aria-pressed={modo === 'autoguiado'} onClick={() => setModo('autoguiado')}>{lang === 'en' ? 'Self-guided' : 'Autoguiado'}</button>
            <button aria-pressed={modo === 'apresentacao'} onClick={() => setModo('apresentacao')}>{lang === 'en' ? 'Presentation' : 'Apresentação'}</button>
          </div>
          <div className="seg" role="group" aria-label="Idioma">
            <button aria-pressed={lang === 'pt'} onClick={() => setLang('pt')}>PT</button>
            <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
      </header>

      <div className="mapa" ref={boxRef} aria-label={lang === 'en' ? '3D map of Distrito Chapéu do Sol' : 'Mapa 3D do Distrito Chapéu do Sol'} />
      {!pronto && !erro && <div className="carga"><b>Chapéu do Sol</b>{lang === 'en' ? 'Loading the 3D map…' : 'Carregando o mapa 3D…'}</div>}
      {pronto && dica && <p className="dica" role="note">{toque
        ? (lang === 'en' ? 'Use two fingers to rotate and tilt the map' : 'Use dois dedos para girar e inclinar o mapa')
        : (lang === 'en' ? 'Right-drag (or Ctrl + drag) to rotate and tilt the map' : 'Arraste com o botão direito (ou Ctrl) para girar e inclinar o mapa')}</p>}
      {erro && <div className="carga"><b>Chapéu do Sol</b>{lang === 'en' ? 'Could not load the map. Reload the page.' : 'Não foi possível carregar o mapa. Recarregue a página.'}</div>}

      <aside className={`sheet${recolhido ? ' min' : ''}`} ref={sheetRef}
        onTouchStart={e => { touch.current = [e.touches[0].clientX, e.touches[0].clientY]; }}
        onTouchEnd={e => {
          const s = touch.current; touch.current = null; if (!s) return;
          const dx = e.changedTouches[0].clientX - s[0], dy = e.changedTouches[0].clientY - s[1];
          if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) (dx < 0 ? prox : ant)();
          else if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.6 && (e.target as HTMLElement).closest('.alca,.mini')) setRecolhido(dy > 0);
        }}>
        <button className="alca" aria-expanded={!recolhido} onClick={() => setRecolhido(r => !r)}
          aria-label={recolhido ? (lang === 'en' ? 'Expand panel' : 'Abrir painel') : (lang === 'en' ? 'Collapse panel to see the map' : 'Recolher painel para ver o mapa')}><span /></button>
        <p className="mini" onClick={() => setRecolhido(false)}>{i + 1}/{CENAS.length} · {t(cena.titulo)}</p>
        <div className="corpo" ref={corpoRef}>
          <div className="prog" role="tablist" aria-label={lang === 'en' ? 'Scenes' : 'Cenas'}>
            {CENAS.map((c, n) => <button key={c.id} role="tab" aria-selected={n === i} aria-label={`${n + 1}. ${t(c.titulo)}`} className={n === i ? 'on' : n < i ? 'fei' : ''} onClick={() => ir(n)} />)}
          </div>
          <p className="eyebrow">{lang === 'en' ? 'Scene' : 'Cena'} {i + 1} / {CENAS.length}{lang === 'en' && EN_RASCUNHO ? ' · EN draft for review' : ''}</p>
          <h1>{t(cena.titulo)}</h1>
          <p className="texto">{t(cena.texto)}</p>
          {cena.etiquetas.length > 0 && <p className="tags">{cena.etiquetas.map(e => <span key={e.pt}>[{t(e)}]</span>)}</p>}

          {cena.estudoConceitual && <p className="estudo"><b>{lang === 'en' ? 'Conceptual study, not approved.' : 'Estudo conceitual, sem aprovação.'}</b> {lang === 'en' ? 'Lots and warehouse blocks shown are not approved and no construction exists.' : 'Lotes e quadras de galpão não têm aprovação e não há construção.'}</p>}

          {cena.linhaDoTempo && <section className="tempo" aria-label={lang === 'en' ? 'Timeline' : 'Linha do tempo'}>
            <div className="seg claro" role="group">
              {HORIZONTES.map(h => <button key={h.id} aria-pressed={hor === h.id} onClick={() => escolherHorizonte(h.id)}>{t(h.rotulo)}</button>)}
            </div>
            <p className="nota">{t(NOTA_HORIZONTES)}</p>
          </section>}

          {(legenda.length > 0 || comMeta) && <ul className="leg">
            {legenda.map(e => <li key={e}><i style={{ background: ESTADOS[e].cor }} />{t(ESTADOS[e].rotulo)}</li>)}
            {comMeta && <li><i className="meta" />{t(META.rotulo)}</li>}
          </ul>}

          {cena.imagem && <img className="eco" src={cena.imagem} alt={lang === 'en' ? 'Ecosystem cycle: land, companies, education, housing, services and capital around contracted recurring revenue' : 'Ciclo do ecossistema: território, empresas, educação, moradia, serviços e capital em torno da receita recorrente contratada'} />}

          {cena.painel && (
            <ul className="painel">
              {cena.painel.map(p => (
                <li key={p.rotulo.pt}>
                  <b>{t(p.rotulo)}</b>
                  <span>{t(p.detalhe)}{p.etiqueta && <> <em>[{t(p.etiqueta)}]</em></>}</span>
                  {p.semCoordenada && <small className="conf">{t(LOCALIZACAO_A_CONFIRMAR)}</small>}
                  {p.ativo && <button className="ver" onClick={() => verNoMapa(p.ativo!)}>{lang === 'en' ? 'See on map' : 'Ver no mapa'}</button>}
                </li>
              ))}
            </ul>
          )}

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
