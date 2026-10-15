// Roteiro da visita virtual. Edite este arquivo para mudar câmera, ativos em destaque e textos.
// Regras: texto de até 40 palavras por cena; só fatos aprovados, cada um com etiqueta de evidência.
// Textos em "en" são RASCUNHO para revisão (ver EN_RASCUNHO).
// IDs de ativos vêm de public/mapa/data (assets.js e entorno.js); nada é duplicado aqui.

export type Lang = 'pt' | 'en';
export type L10n = { pt: string; en: string };
export type Estado = 'existente' | 'desenvolvimento' | 'estudo';
export type Horizonte = 0 | 1 | 2; // Hoje, 2027, 2031

export const EN_RASCUNHO = true;

export const HORIZONTES: { id: Horizonte; rotulo: L10n }[] = [
  { id: 0, rotulo: { pt: 'Hoje', en: 'Today' } },
  { id: 1, rotulo: { pt: '2027', en: '2027' } },
  { id: 2, rotulo: { pt: '2031', en: '2031' } },
];

export const NOTA_HORIZONTES: L10n = {
  pt: '2027 e 2031 são horizontes de planejamento da gestão, não datas de entrega nem projeção de resultado.',
  en: '2027 and 2031 are management planning horizons, not delivery dates or projected results.',
};

// Cores pensadas para leitura sobre o satélite. A legenda usa as mesmas cores do mapa.
export const ESTADOS: Record<Estado, { cor: string; rotulo: L10n }> = {
  existente: { cor: '#1FA894', rotulo: { pt: 'Existente', en: 'Existing' } },
  desenvolvimento: { cor: '#F39224', rotulo: { pt: 'Em desenvolvimento', en: 'In development' } },
  estudo: { cor: '#6F9FDB', rotulo: { pt: 'Estudo conceitual, sem aprovação', en: 'Conceptual study, not approved' } },
};

// Estado de cada ativo. Não muda com a linha do tempo: obras públicas não são projetadas e lotes seguem como estudo.
// Ativos fora desta lista aparecem neutros.
const E: Estado = 'existente', D: Estado = 'desenvolvimento', S: Estado = 'estudo';
export const ESTADO: Record<string, Estado> = {
  IFMT: E, GEN: E, FLOR: E, 'CDS-BAIRRO': E, FLM: E, RDP: E, MDP: E, 'LAG-N': E, 'LAG-S': E, BR364: E, 'AV-CDS': E,
  CN: D, 'BR364-C': D, 'CAMPUS-VIAS': D, 'PQT-OSM': D, UNEMAT: D, 'UFMT-OSM': D, 'UFMT-PLAN': D,
  'LOT-A': S, 'LOT-B': S, 'LOT-C': S, 'PQT-PLAN': S, 'LB-1': S, 'LB-2': S, 'LB-3': S, 'AD-I': S,
};
export const SEMPRE_ESTUDO = new Set(Object.keys(ESTADO).filter(id => ESTADO[id] === 'estudo'));

// Metas de gestão na linha do tempo, desenhadas sobre as quadras de content/investidores/volumes.ts.
// 2027: 1º contrato de renda (BTS ou metade da 1ª quadra pré-locada), só a área no chão.
// 2031: série de quadras de galpões, em volume. Tudo ilustrativo, sem projeto nem aprovação.
export type Meta = { quadras: number[]; volume: boolean; rotulo: L10n };
export const METAS: Record<Horizonte, Meta | null> = {
  0: null,
  1: { quadras: [1], volume: false, rotulo: { pt: 'Meta 2027 · 1º contrato de renda na 1ª quadra', en: '2027 target · first income contract on block 1' } },
  2: { quadras: [1, 2], volume: true, rotulo: { pt: 'Meta 2031 · série de quadras de galpões', en: '2031 target · series of warehouse blocks' } },
};
export const META: { cor: string; rotulo: L10n; sufixo: L10n } = {
  cor: '#D6E6FA',
  rotulo: { pt: 'Meta de gestão, ilustrativa', en: 'Management target, illustrative' },
  sufixo: { pt: 'ilustrativo', en: 'illustrative' },
};

// Rótulos no mapa. Ativos de estudo ganham o sufixo "estudo conceitual".
export const ROTULOS: Record<string, L10n> = {
  'LOT-A': { pt: 'Lotes empresariais', en: 'Business lots' },
  'LOT-B': { pt: 'Lotes empresariais', en: 'Business lots' },
  'LOT-C': { pt: 'Lotes empresariais', en: 'Business lots' },
  'PQT-PLAN': { pt: 'Quadras do Parque na planta', en: 'Park blocks in the plan' },
  'LB-1': { pt: 'Landbank', en: 'Landbank' },
  'LB-2': { pt: 'Landbank', en: 'Landbank' },
  'AD-I': { pt: 'Área desmembrada I', en: 'Subdivided area I' },
  GEN: { pt: 'Parque Genebra', en: 'Parque Genebra' },
  'LAG-N': { pt: 'Lagoas', en: 'Lakes' },
  CN: { pt: 'Contorno Norte', en: 'Contorno Norte' },
  'BR364-C': { pt: 'BR-364 · trecho em obras', en: 'BR-364 · section under works' },
  BR364: { pt: 'BR-364 / BR-163', en: 'BR-364 / BR-163' },
  'UFMT-OSM': { pt: 'Campus UFMT Várzea Grande', en: 'UFMT Várzea Grande campus' },
  'PQT-OSM': { pt: 'Parque Tecnológico Mato Grosso', en: 'Mato Grosso Technology Park' },
  UNEMAT: { pt: 'Unemat', en: 'Unemat' },
  IFMT: { pt: 'IFMT Várzea Grande', en: 'IFMT Várzea Grande' },
  FLOR: { pt: 'Condomínio Florença', en: 'Florença community' },
  'CDS-BAIRRO': { pt: 'Loteamento Chapéu do Sol', en: 'Chapéu do Sol subdivision' },
  FLM: { pt: 'Florais da Mata', en: 'Florais da Mata' },
  RDP: { pt: 'Recanto do Pari', en: 'Recanto do Pari' },
  MDP: { pt: 'Mirante do Pari', en: 'Mirante do Pari' },
  'CAMPUS-VIAS': { pt: 'Vias do Parque e do campus', en: 'Park and campus roads' },
};
export const SUFIXO_ESTUDO: L10n = { pt: 'estudo conceitual', en: 'conceptual study' };

export type Etiqueta = { pt: string; en: string };
const T = {
  empresa: { pt: 'dado da empresa', en: 'company data' },
  meta: { pt: 'meta de gestão', en: 'management target' },
  levantar: { pt: 'a levantar', en: 'to be surveyed' },
  iNFRA: { pt: 'Agência iNFRA, 31/10/2025', en: 'Agência iNFRA, 10/31/2025' },
  vgn: { pt: 'VG Notícias, 18/03/2026', en: 'VG Notícias, 03/18/2026' },
  pvg0321: { pt: 'Prefeitura de VG, 21/03/2026', en: 'Várzea Grande City Hall, 03/21/2026' },
  pvg02: { pt: 'Prefeitura de VG, 02/2026', en: 'Várzea Grande City Hall, 02/2026' },
  pvg08: { pt: 'Prefeitura de VG, 08/2026', en: 'Várzea Grande City Hall, 08/2026' },
  midia: { pt: 'MidiaNews, 06/2026', en: 'MidiaNews, 06/2026' },
  ibge: { pt: 'IBGE', en: 'IBGE' },
  parque: { pt: 'Prefeitura de VG e Cenário MT, 06/2026', en: 'Várzea Grande City Hall and Cenário MT, 06/2026' },
  camara: { pt: 'Câmara de VG, 03/07/2026', en: 'Várzea Grande City Council, 07/03/2026' },
  almt: { pt: 'ALMT, PL 2181/2023', en: 'ALMT, Bill 2181/2023' },
  tela: { pt: 'Portal Tela, 02/2026', en: 'Portal Tela, 02/2026' },
  moodys: { pt: "Moody's Local, 01/2025", en: "Moody's Local, 01/2025" },
  log: { pt: 'LOG, 4T25', en: 'LOG, 4Q25' },
  rzzr: { pt: 'relatório do fundo, 04/2026', en: 'fund report, 04/2026' },
  ggrc: { pt: 'FIIs.com.br, 11/2024', en: 'FIIs.com.br, 11/2024' },
};

export type ItemPainel = {
  rotulo: L10n;
  detalhe: L10n;
  etiqueta?: Etiqueta;
  ativo?: string; // id com coordenada nos dados (public/mapa/data)
  semCoordenada?: boolean; // investimento público sem coordenada nos dados: mostra "localização a confirmar"
};

export type Cena = {
  id: string;
  // pitch = inclinação em graus (0 = visto de cima); bearing = rumo em graus (0 = norte para cima).
  camera: { center: [number, number]; zoom: number; pitch: number; bearing: number };
  destaque: string[];
  estudoConceitual?: boolean;
  linhaDoTempo?: boolean; // mostra Hoje · 2027 · 2031 e as metas de gestão (volumes ilustrativos)
  imagem?: string;
  titulo: L10n;
  texto: L10n;
  etiquetas: Etiqueta[];
  painel?: ItemPainel[];
};

export const LOCALIZACAO_A_CONFIRMAR: L10n = { pt: 'localização a confirmar', en: 'location to be confirmed' };

export const CENAS: Cena[] = [
  {
    id: 'territorio',
    camera: { center: [-56.205, -15.582], zoom: 12.75, pitch: 52, bearing: -28 },
    destaque: ['LOT-B', 'LOT-A', 'LOT-C', 'PQT-PLAN', 'LB-1', 'LB-2', 'GEN', 'LAG-N'],
    estudoConceitual: true,
    titulo: { pt: 'O território', en: 'The territory' },
    texto: {
      pt: 'Mais de 200 ha em Várzea Grande, com zonas residencial, comercial e industrial. A ampliação da ETA vai de 7.500 para 15.000 famílias atendidas.',
      en: 'Over 200 ha in Várzea Grande, with residential, commercial and industrial zones. The water treatment plant expansion goes from 7,500 to 15,000 households served.',
    },
    etiquetas: [T.empresa],
  },
  {
    id: 'acesso',
    camera: { center: [-56.207, -15.583], zoom: 12.35, pitch: 50, bearing: 22 },
    destaque: ['CN', 'BR364-C', 'BR364'],
    titulo: { pt: 'Como se chega', en: 'How to get there' },
    texto: {
      pt: 'Contorno Norte: 52 km, Lote 1 (21,5 km) em obras e R$ 540 mi no Novo PAC; 8 km ficam na área. Via de acesso de 1,6 km licitada; licitação da ponte para Santa Rosa anunciada.',
      en: 'Contorno Norte: 52 km, Lot 1 (21.5 km) under construction and R$ 540 mn in Novo PAC; 8 km lie inside the area. 1.6 km access road tendered; Santa Rosa bridge tender announced.',
    },
    etiquetas: [T.iNFRA, T.vgn, T.pvg0321, T.empresa],
    painel: [
      { rotulo: { pt: 'Contorno Norte', en: 'Contorno Norte' }, detalhe: { pt: '52 km · Lote 1 (21,5 km) em obras · R$ 540 mi no Novo PAC', en: '52 km · Lot 1 (21.5 km) under construction · R$ 540 mn Novo PAC' }, etiqueta: T.iNFRA, ativo: 'CN' },
      { rotulo: { pt: 'Via de acesso', en: 'Access road' }, detalhe: { pt: '1,6 km licitada · R$ 5,1 mi · interseções a confirmar', en: '1.6 km tendered · R$ 5.1 mn · intersections to be confirmed' }, etiqueta: T.vgn, semCoordenada: true },
      { rotulo: { pt: 'Nova ponte para Santa Rosa (Cuiabá)', en: 'New bridge to Santa Rosa (Cuiabá)' }, detalhe: { pt: 'Licitação anunciada', en: 'Tender announced' }, etiqueta: T.pvg0321, semCoordenada: true },
    ],
  },
  {
    id: 'publicos',
    camera: { center: [-56.193, -15.589], zoom: 12.9, pitch: 54, bearing: 38 },
    destaque: ['UFMT-OSM', 'CN'],
    titulo: { pt: 'Investimentos públicos ao redor', en: 'Public investment nearby' },
    texto: {
      pt: 'Hospital e Maternidade Municipal com 127 leitos SUS, reservatórios de água com 82% executado e retomada das obras da UFMT licitada, com resultado a confirmar. Várzea Grande tem 323 mil habitantes na estimativa recente.',
      en: 'Municipal Hospital and Maternity with 127 SUS beds, water reservoirs 82% built, and UFMT works resumption tendered, with result to be confirmed. Várzea Grande has 323 thousand inhabitants in the latest estimate.',
    },
    etiquetas: [T.pvg02, T.pvg08, T.midia, T.ibge],
    painel: [
      { rotulo: { pt: 'Hospital e Maternidade Municipal', en: 'Municipal Hospital and Maternity' }, detalhe: { pt: '127 leitos SUS · R$ 103 mi do Novo PAC e cerca de R$ 5 mi do município', en: '127 SUS beds · R$ 103 mn from Novo PAC and about R$ 5 mn from the city' }, etiqueta: T.pvg02, semCoordenada: true },
      { rotulo: { pt: 'Abastecimento de água', en: 'Water supply' }, detalhe: { pt: '5 reservatórios · R$ 16,4 mi · 82% executado', en: '5 reservoirs · R$ 16.4 mn · 82% built' }, etiqueta: T.pvg08, semCoordenada: true },
      { rotulo: { pt: 'UFMT Várzea Grande', en: 'UFMT Várzea Grande' }, detalhe: { pt: 'Retomada das obras licitada · R$ 18 mi · resultado a confirmar', en: 'Works resumption tendered · R$ 18 mn · result to be confirmed' }, etiqueta: T.midia, ativo: 'UFMT-OSM' },
      { rotulo: { pt: 'População de Várzea Grande', en: 'Várzea Grande population' }, detalhe: { pt: '300 mil (Censo 2022) · 323 mil (estimativa recente)', en: '300 thousand (2022 Census) · 323 thousand (latest estimate)' }, etiqueta: T.ibge },
    ],
  },
  {
    id: 'parque',
    camera: { center: [-56.191, -15.588], zoom: 13.25, pitch: 56, bearing: 42 },
    destaque: ['PQT-OSM', 'UNEMAT', 'UFMT-OSM', 'IFMT'],
    titulo: { pt: 'Parque Tecnológico e universidades', en: 'Technology Park and universities' },
    texto: {
      pt: 'O Parque Tecnológico Mato Grosso foi inaugurado em 25/06/2026, com Centro de Inovação de 3.920 m². Cerca de 16 ha foram doados pela incorporadora do grupo. O IFMT, com 1,6 mil alunos, tem sede própria desde 02/2026.',
      en: 'The Mato Grosso Technology Park opened on 06/25/2026, with a 3,920 m² Innovation Center. About 16 ha were donated by the group’s developer. IFMT, with 1,600 students, has had its own campus since 02/2026.',
    },
    etiquetas: [T.parque, T.camara, T.tela],
    painel: [
      { rotulo: { pt: 'Parque Tecnológico Mato Grosso', en: 'Mato Grosso Technology Park' }, detalhe: { pt: 'Gestão do Parque Tecnológico de São José dos Campos · cerca de 50 empresas interessadas', en: 'Managed by the São José dos Campos Technology Park · about 50 interested companies' }, etiqueta: T.parque, ativo: 'PQT-OSM' },
      { rotulo: { pt: 'Área planejada', en: 'Planned area' }, detalhe: { pt: '80 ha planejados, 64 ha para empresas privadas em área do Estado', en: '80 ha planned, 64 ha for private companies on State land' }, etiqueta: T.almt },
      { rotulo: { pt: 'IFMT Várzea Grande', en: 'IFMT Várzea Grande' }, detalhe: { pt: 'Sede própria desde 04/02/2026 · 12 cursos · 1,6 mil alunos', en: 'Own campus since 02/04/2026 · 12 courses · 1,600 students' }, etiqueta: T.tela, ativo: 'IFMT' },
    ],
  },
  {
    id: 'logistica',
    camera: { center: [-56.165, -15.6], zoom: 11.45, pitch: 42, bearing: 8 },
    destaque: ['BR364', 'CN', 'BR364-C'],
    titulo: { pt: 'Logística da Grande Cuiabá', en: 'Greater Cuiabá logistics' },
    texto: {
      pt: 'Nas 9 praças da concessão BR-163/MT e MT-407, o tráfego foi de 87 mi para 115 mi de veículos equivalentes entre 2016 e 2023, cerca de 90% pesados. Aluguel e vacância em Cuiabá: a levantar.',
      en: 'At the 9 toll plazas of the BR-163/MT and MT-407 concession, traffic grew from 87 mn to 115 mn equivalent vehicles between 2016 and 2023, about 90% heavy. Rent and vacancy in Cuiabá: to be surveyed.',
    },
    etiquetas: [T.moodys, T.levantar],
    painel: [
      { rotulo: { pt: 'Tráfego na concessão', en: 'Concession traffic' }, detalhe: { pt: '115 mi de veículos equivalentes em 2023 contra 87 mi em 2016', en: '115 mn equivalent vehicles in 2023 vs 87 mn in 2016' }, etiqueta: T.moodys },
      { rotulo: { pt: 'LOG Cuiabá', en: 'LOG Cuiabá' }, detalhe: { pt: '38,6 mil m² entregues no 1º trimestre de 2025', en: '38,600 m² delivered in Q1 2025' }, etiqueta: T.log },
      { rotulo: { pt: 'RZZR11', en: 'RZZR11' }, detalhe: { pt: 'CDs sob medida em Cuiabá, vacância zero', en: 'Build-to-suit distribution centers in Cuiabá, zero vacancy' }, etiqueta: T.rzzr },
      { rotulo: { pt: 'GGRC11', en: 'GGRC11' }, detalhe: { pt: 'Contrato atípico até 2037', en: 'Atypical lease until 2037' }, etiqueta: T.ggrc },
      { rotulo: { pt: 'Aluguel e vacância em Cuiabá', en: 'Rent and vacancy in Cuiabá' }, detalhe: { pt: 'Pesquisa de mercado pendente', en: 'Market survey pending' }, etiqueta: T.levantar },
    ],
  },
  {
    id: 'galpoes',
    camera: { center: [-56.2004, -15.5702], zoom: 15.35, pitch: 62, bearing: 18 },
    destaque: ['LOT-B', 'LOT-A', 'LOT-C'],
    estudoConceitual: true,
    linhaDoTempo: true,
    titulo: { pt: 'Galpões para locar', en: 'Warehouses for lease' },
    texto: {
      pt: 'Estudo conceitual, sem aprovação: quadras de galpões de 50 mil m². Obra só com BTS assinado ou 50% pré-locado, em SPE por fase de renda. Meta de gestão: 1º contrato em 2027 e série de quadras até 2031.',
      en: 'Conceptual study, not approved: warehouse blocks of 50,000 m². Construction only with a signed BTS or 50% pre-leased, in an SPE per income phase. Management target: first contract in 2027 and a series of blocks by 2031.',
    },
    etiquetas: [T.meta],
  },
  {
    id: 'residencial',
    camera: { center: [-56.176, -15.594], zoom: 13.55, pitch: 56, bearing: -22 },
    destaque: ['GEN', 'FLOR', 'CDS-BAIRRO', 'FLM', 'RDP', 'MDP'],
    titulo: { pt: 'Residencial e comercial', en: 'Residential and commercial' },
    texto: {
      pt: 'Florença está quase sem estoque e Genebra segue em andamento. A GINCO é parceira em condomínios. Previstos: centro comercial (academia de 1.500 m², posto e prédio de 10 andares) e condomínio sênior junto ao lago.',
      en: 'Florença is almost sold out and Genebra is under way. GINCO is a partner in gated communities. Planned: a commercial center (1,500 m² gym, gas station and 10-story building) and a senior community by the lake.',
    },
    etiquetas: [T.empresa],
    painel: [
      { rotulo: { pt: 'Centro comercial (previsto)', en: 'Commercial center (planned)' }, detalhe: { pt: 'Academia de 1.500 m², posto e prédio de 10 andares', en: '1,500 m² gym, gas station and 10-story building' }, etiqueta: T.empresa },
      { rotulo: { pt: 'Condomínio sênior (previsto)', en: 'Senior community (planned)' }, detalhe: { pt: 'Junto ao lago', en: 'By the lake' }, etiqueta: T.empresa },
    ],
  },
  {
    id: 'ecossistema',
    camera: { center: [-56.196, -15.584], zoom: 12.7, pitch: 62, bearing: 64 },
    destaque: [],
    imagem: '/investidores/ecossistema',
    titulo: { pt: 'Ecossistema', en: 'Ecosystem' },
    texto: {
      pt: 'O ciclo liga território, empresas, educação, moradia, serviços e capital em torno de uma métrica: receita recorrente contratada, em R$ por mês. O objetivo é crescer sem depender só da venda de lotes.',
      en: 'The cycle links land, companies, education, housing, services and capital around one metric: contracted recurring revenue, in R$ per month. The goal is to grow without relying only on lot sales.',
    },
    etiquetas: [T.meta],
  },
  {
    id: 'linha-do-tempo',
    camera: { center: [-56.1995, -15.5745], zoom: 14.15, pitch: 60, bearing: -18 },
    destaque: ['LOT-B', 'PQT-OSM', 'UNEMAT', 'CN', 'CAMPUS-VIAS', 'UFMT-OSM', 'PQT-PLAN', 'LOT-A', 'LOT-C', 'BR364-C', 'IFMT', 'GEN', 'FLOR', 'AD-I'],
    estudoConceitual: true,
    linhaDoTempo: true,
    titulo: { pt: 'Hoje, 2027 e 2031', en: 'Today, 2027 and 2031' },
    texto: {
      pt: 'A linha do tempo mostra metas de gestão: 1º contrato de renda em 2027 e série de quadras de galpões em 2031, em volumes ilustrativos. Obras públicas seguem em desenvolvimento e lotes, como estudo conceitual.',
      en: 'The timeline shows management targets: first income contract in 2027 and a series of warehouse blocks by 2031, as illustrative volumes. Public works remain in development and lots remain a conceptual study.',
    },
    etiquetas: [T.meta],
  },
  {
    id: 'proximos-passos',
    camera: { center: [-56.195, -15.583], zoom: 12.5, pitch: 48, bearing: -12 },
    destaque: [],
    titulo: { pt: 'Próximos passos', en: 'Next steps' },
    texto: {
      pt: 'Conversa, visita guiada, data room, term sheet e compromisso. Terra a valor de laudo independente, capital por marco e saída por FII ou refinanciamento, em grupo fechado de investidores.',
      en: 'Conversation, guided visit, data room, term sheet and commitment. Land at independent appraisal value, capital by milestone and exit via REIT or refinancing, in a closed investor group.',
    },
    etiquetas: [T.meta],
    painel: [
      { rotulo: { pt: '1 · Conversa', en: '1 · Conversation' }, detalhe: { pt: 'Apresentar a tese e tirar dúvidas', en: 'Walk through the thesis and answer questions' } },
      { rotulo: { pt: '2 · Visita guiada', en: '2 · Guided visit' }, detalhe: { pt: 'Conhecer o território no local', en: 'See the site in person' } },
      { rotulo: { pt: '3 · Data room', en: '3 · Data room' }, detalhe: { pt: 'Documentos e diligência', en: 'Documents and due diligence' } },
      { rotulo: { pt: '4 · Term sheet', en: '4 · Term sheet' }, detalhe: { pt: 'Condições em documento', en: 'Terms in writing' } },
      { rotulo: { pt: '5 · Compromisso', en: '5 · Commitment' }, detalhe: { pt: 'Formalização por marco', en: 'Formalization by milestone' } },
    ],
  },
];

export const AVISO_LEGAL: L10n = {
  pt: 'Material informativo, de uso restrito e individual, destinado a investidores qualificados. Não constitui oferta nem solicitação de oferta de valores mobiliários, nem recomendação de investimento. Informações preliminares. Investimentos imobiliários envolvem risco de perda do capital e baixa liquidez. Metas são objetivos de gestão, não promessa de resultado.',
  en: 'Informational material, for restricted and individual use, intended for qualified investors. It is not an offer or solicitation of an offer of securities, nor investment advice. Preliminary information. Real estate investments involve risk of capital loss and low liquidity. Targets are management objectives, not a promise of results.',
};
