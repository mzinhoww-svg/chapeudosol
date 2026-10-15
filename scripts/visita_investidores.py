"""Gera os dados derivados da visita virtual (/investidores) a partir dos dados do /mapa.

Uso, na raiz do repositório (requer: pip install shapely pyproj pillow):
  python3 scripts/visita_investidores.py              # prédios, contornos e satélite reduzido
  python3 scripts/visita_investidores.py --volumes    # também refaz content/investidores/volumes.ts

Saídas:
  public/mapa/data/predios_visita.json    recorte das construções do OSM: todas perto do Distrito e só as
                                          altas (12 m ou mais) no resto da Grande Cuiabá. Propriedade "a" =
                                          ativo existente ou em desenvolvimento que contém a construção.
  public/mapa/data/contornos_visita.json  contorno externo dos ativos existentes ou em desenvolvimento
                                          (sem espelhos d'água), usado nas faixas de luz em volta deles.
  public/mapa/data/sat_*_md.jpg           satélite com metade da resolução, para celular.
  content/investidores/volumes.ts         volumes ilustrativos das quadras de galpão.

Nada aqui altera o /mapa: os arquivos originais só são lidos.
"""
import json
import math
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DADOS = os.path.join(RAIZ, 'public', 'mapa', 'data')

PERTO = (-56.27, -15.65, -56.12, -15.535)  # oeste, sul, leste, norte
ALTURA_MINIMA_LONGE = 12


def ler_js(nome):
    txt = open(os.path.join(DADOS, nome), encoding='utf-8').read()
    ini = txt.index('=') + 1
    return json.loads(txt[ini:].strip().rstrip(';'))


def poligonos(g):
    if g['type'] == 'Polygon':
        return [g['coordinates']]
    if g['type'] == 'MultiPolygon':
        return g['coordinates']
    return []


def dentro(pt, poligono):
    x, y, ins = pt[0], pt[1], False
    for anel in poligono:
        j = len(anel) - 1
        for i in range(len(anel)):
            xi, yi = anel[i]
            xj, yj = anel[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                ins = not ins
            j = i
    return ins


def caixa(coords):
    xs = [p[0] for anel in coords for p in anel]
    ys = [p[1] for anel in coords for p in anel]
    return min(xs), min(ys), max(xs), max(ys)


def predios():
    build = ler_js('buildings.js')
    ativos = ler_js('assets.js')['features'] + ler_js('entorno.js')['features']
    alvos = []
    for f in ativos:
        p = f['properties']
        if p.get('status') not in ('existente', 'desenvolvimento'):
            continue
        for pol in poligonos(f['geometry']):
            alvos.append((p['id'], pol, caixa(pol)))
    w, s, e, n = PERTO
    saida, marcados = [], 0
    for f in build['features']:
        anel = f['geometry']['coordinates'][0]
        cx = sum(p[0] for p in anel) / len(anel)
        cy = sum(p[1] for p in anel) / len(anel)
        perto = w <= cx <= e and s <= cy <= n
        h = f['properties'].get('h') or 0
        if not perto and h < ALTURA_MINIMA_LONGE:
            continue
        props = {'h': h, 'b': f['properties'].get('b', 'yes')}
        for aid, pol, bb in alvos:
            if bb[0] <= cx <= bb[2] and bb[1] <= cy <= bb[3] and dentro((cx, cy), pol):
                props['a'] = aid
                marcados += 1
                break
        saida.append({'type': 'Feature', 'properties': props, 'geometry': f['geometry']})
    destino = os.path.join(DADOS, 'predios_visita.json')
    with open(destino, 'w', encoding='utf-8') as fp:
        json.dump({'type': 'FeatureCollection', 'features': saida}, fp, separators=(',', ':'))
    print(f'{destino}: {len(saida)} de {len(build["features"])} construções, {marcados} dentro de ativos, '
          f'{os.path.getsize(destino) // 1024} KB')


SEM_CONTORNO = {'LAG-N', 'LAG-S', 'LAGOS-OSM', 'RIOS'}


def contornos():
    import shapely
    from shapely.geometry import shape, mapping
    from shapely.ops import unary_union
    saida = []
    for f in ler_js('assets.js')['features'] + ler_js('entorno.js')['features']:
        p = f['properties']
        if p.get('status') not in ('existente', 'desenvolvimento') or p['id'] in SEM_CONTORNO:
            continue
        g = shape(f['geometry'])
        if not g.geom_type.endswith('Polygon'):
            continue
        # junta quadras separadas por ruas internas (cerca de 0,0002 grau = 20 m) e guarda só o contorno externo
        u = unary_union([g.buffer(0.0002, join_style='mitre')]).buffer(-0.0002, join_style='mitre')
        partes = list(u.geoms) if u.geom_type == 'MultiPolygon' else [u]
        aneis = [[[round(x, 6), round(y, 6)] for x, y in q.exterior.simplify(0.00001).coords] for q in partes if q.area > 1e-7]
        if aneis:
            saida.append({'type': 'Feature', 'properties': {'id': p['id']}, 'geometry': {'type': 'MultiLineString', 'coordinates': aneis}})
    destino = os.path.join(DADOS, 'contornos_visita.json')
    with open(destino, 'w', encoding='utf-8') as fp:
        json.dump({'type': 'FeatureCollection', 'features': saida}, fp, separators=(',', ':'))
    print(f'{destino}: {len(saida)} ativos, {os.path.getsize(destino) // 1024} KB')


def satelite():
    try:
        from PIL import Image
    except ImportError:
        print('Pillow ausente: satélite reduzido não foi refeito')
        return
    for nome, q in (('sat_mosaico', 74), ('sat_regiao', 70)):
        im = Image.open(os.path.join(DADOS, nome + '.jpg'))
        w, h = im.size
        destino = os.path.join(DADOS, nome + '_md.jpg')
        im.resize((w // 2, h // 2), Image.LANCZOS).save(destino, quality=q, optimize=True, progressive=True)
        print(f'{destino}: {w // 2}x{h // 2}, {os.path.getsize(destino) // 1024} KB')


# Quadras de galpão ilustrativas: 2 quadras de cerca de 50 mil m², cada uma com 2 galpões modulares de 120 x 210 m,
# nas faixas 6 e 7 do trecho B dos lotes empresariais (de frente para o Parque), a 85 m do Contorno Norte.
MODULO_L, MODULO_C, VAO, RECUO, ALTURA = 120, 210, 24, 85, 14
FAIXAS = ((1, 6), (2, 7))


def volumes():
    import numpy as np
    import shapely
    from pyproj import Transformer
    from shapely import affinity
    from shapely.geometry import box, shape
    ida = Transformer.from_crs(4326, 31981, always_xy=True)  # SIRGAS 2000 / UTM 21S
    volta = Transformer.from_crs(31981, 4326, always_xy=True)
    utm = lambda g: shapely.transform(g, lambda xy: np.column_stack(ida.transform(xy[:, 0], xy[:, 1])))
    geo = lambda g: shapely.transform(g, lambda xy: np.column_stack(volta.transform(xy[:, 0], xy[:, 1])))
    feats = {f['properties']['id']: f for f in ler_js('assets.js')['features'] + ler_js('entorno.js')['features']}
    lotes = list(utm(shape(feats['LOT-B']['geometry'])).geoms)
    contorno = utm(shape(feats['CN']['geometry']))
    saida = []
    for quadra, faixa in FAIXAS:
        pol = lotes[faixa]
        c = list(pol.minimum_rotated_rectangle.exterior.coords)
        a, b = (c[0], c[1]) if math.dist(c[0], c[1]) > math.dist(c[1], c[2]) else (c[1], c[2])
        ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
        org = pol.centroid
        rp, rc = affinity.rotate(pol, -ang, origin=org), affinity.rotate(contorno, -ang, origin=org)
        x0, y0, x1, y1 = rp.bounds
        ini, sentido = (x0, 1) if box(x0, y0, x0 + 5, y1).distance(rc) < box(x1 - 5, y0, x1, y1).distance(rc) else (x1, -1)
        for m in range(2):
            xa = ini + sentido * (RECUO + m * (MODULO_C + VAO))
            lo, hi = sorted((xa, xa + sentido * MODULO_C))
            faixa_y = rp.intersection(box(lo, y0 - 10, hi, y1 + 10)).bounds
            ym = (faixa_y[1] + faixa_y[3]) / 2
            ret = box(lo, ym - MODULO_L / 2, hi, ym + MODULO_L / 2)
            assert ret.within(rp.buffer(-12)), f'galpão {quadra}.{m + 1} fora da faixa'
            g = geo(affinity.rotate(ret, ang, origin=org))
            coords = [[round(x, 6), round(y, 6)] for x, y in g.exterior.coords]
            saida.append({'type': 'Feature', 'properties': {'id': f'q{quadra}m{m + 1}', 'q': quadra, 'h': ALTURA},
                          'geometry': {'type': 'Polygon', 'coordinates': [coords]}})
    linhas = ',\n'.join('    ' + json.dumps(f, separators=(', ', ': ')) for f in saida)
    corpo = '{\n  "type": "FeatureCollection",\n  "features": [\n' + linhas + '\n  ]\n}'
    destino = os.path.join(RAIZ, 'content', 'investidores', 'volumes.ts')
    with open(destino, 'w', encoding='utf-8') as fp:
        fp.write('// Volumes ILUSTRATIVOS das quadras de galpão (meta de gestão, sem projeto nem aprovação).\n'
                 '// Gerado por scripts/visita_investidores.py --volumes: 2 quadras de cerca de 50 mil m², cada uma com\n'
                 f'// 2 galpões modulares de {MODULO_L} x {MODULO_C} m e {ALTURA} m de altura, no trecho B dos lotes empresariais.\n'
                 '// q = número da quadra; h = altura em metros.\n'
                 "export type Volume = { type: 'Feature'; properties: { id: string; q: number; h: number }; "
                 "geometry: { type: 'Polygon'; coordinates: number[][][] } };\n"
                 f"export const VOLUMES: {{ type: 'FeatureCollection'; features: Volume[] }} = {corpo};\n")
    print(f'{destino}: {len(saida)} galpões')


if __name__ == '__main__':
    predios()
    contornos()
    satelite()
    if '--volumes' in sys.argv:
        volumes()
