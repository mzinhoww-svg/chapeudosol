// Volumes ILUSTRATIVOS das quadras de galpão (meta de gestão, sem projeto nem aprovação).
// Gerado por scripts/visita_investidores.py --volumes: 2 quadras de cerca de 50 mil m², cada uma com
// 2 galpões modulares de 120 x 210 m e 14 m de altura, no trecho B dos lotes empresariais.
// q = número da quadra; h = altura em metros.
export type Volume = { type: 'Feature'; properties: { id: string; q: number; h: number }; geometry: { type: 'Polygon'; coordinates: number[][][] } };
export const VOLUMES: { type: 'FeatureCollection'; features: Volume[] } = {
  "type": "FeatureCollection",
  "features": [
    {"type": "Feature", "properties": {"id": "q1m1", "q": 1, "h": 14}, "geometry": {"type": "Polygon", "coordinates": [[[-56.200844, -15.572249], [-56.199818, -15.571817], [-56.200597, -15.570076], [-56.201624, -15.570508], [-56.200844, -15.572249]]]}},
    {"type": "Feature", "properties": {"id": "q1m2", "q": 1, "h": 14}, "geometry": {"type": "Polygon", "coordinates": [[[-56.201713, -15.570309], [-56.200687, -15.569877], [-56.201466, -15.568136], [-56.202493, -15.568567], [-56.201713, -15.570309]]]}},
    {"type": "Feature", "properties": {"id": "q2m1", "q": 2, "h": 14}, "geometry": {"type": "Polygon", "coordinates": [[[-56.199096, -15.57155], [-56.198069, -15.571119], [-56.198845, -15.569377], [-56.199872, -15.569807], [-56.199096, -15.57155]]]}},
    {"type": "Feature", "properties": {"id": "q2m2", "q": 2, "h": 14}, "geometry": {"type": "Polygon", "coordinates": [[[-56.199963, -15.569608], [-56.198936, -15.569178], [-56.199712, -15.567436], [-56.20074, -15.567866], [-56.199963, -15.569608]]]}}
  ]
};
