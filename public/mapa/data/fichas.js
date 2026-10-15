// FICHAS DOS ATIVOS — edite este arquivo para atualizar o conteúdo das fichas.
// Campos: nome, resumo, evidencia (lista), pendencias (lista), proximo (próxima ação), operadores (alvos), produto, status.
// status: existente | desenvolvimento | estudo | diligencia
window.FICHAS = {
  "LOT-A": {
    "resumo": "Faixa de lotes empresariais entre o trevo da BR-364 e as lagoas norte, com testada para o Contorno Norte. Produto âncora da fase 1 proposta.",
    "produto": "Lote com infraestrutura, acesso de carreta, energia trifásica. Cliente constrói o próprio galpão, loja ou sede.",
    "evidencia": ["Desenhado na planta A como LOTE 01 a 13 [P]", "Contorno Norte (BR-163) em construção no eixo da testada, duas pistas [F: OSM]", "Trevo com a BR-364 existente [F: OSM]"],
    "pendencias": ["Medição de cada lote (frente, fundo, m²)", "Acesso marginal à rodovia concedida: consulta à Nova Rota do Oeste e ANTT", "Diretrizes urbanísticas da Prefeitura de VG", "Titularidade da faixa (matrícula)"],
    "proximo": "Consulta formal de acesso à concessionária e quadro de áreas dos lotes.",
    "operadores": ["Transportadoras regionais", "Serviços ao agro e a frotas (máquinas, pneus, oficinas)", "Posto e truck center", "Distribuidores de bebidas e alimentos"]
  },
  "LOT-B": {
    "resumo": "Trecho mais longo da faixa de lotes, das lagoas norte até o extremo nordeste, lado sul do Contorno Norte, encostado ao parque tecnológico.",
    "produto": "Lotes maiores (média de 12 ha por polígono na planta) para distribuição, indústria leve, condomínio logístico com parceiro e serviços.",
    "evidencia": ["Desenhado na planta A como LOTE 14 a 28 [P]", "Contorno Norte em construção [F: OSM]", "Parque Tecnológico e Unemat a menos de 1 km [F: OSM]"],
    "pendencias": ["Faixa de domínio da rodovia e recuo", "Linha de transmissão 138 kV cruza o setor: faixa de servidão com a Energisa", "Cota de cheia das lagoas norte"],
    "proximo": "Sobrepor faixa de servidão da LT e faixa de domínio; recalcular área útil.",
    "operadores": ["Operadores logísticos e 3PL", "E-commerce last-mile (módulos 1 a 3 mil m²)", "Desenvolvedores de galpão (JV com terra)", "Agroindústria leve"]
  },
  "LOT-C": {
    "resumo": "Lotes do lado norte do Contorno Norte, junto à gleba amarela. Dependem de acesso próprio pela rodovia.",
    "produto": "Lotes de rodovia para serviços de passagem (posto, truck center, hotel econômico).",
    "evidencia": ["Desenhado na planta A [P]"],
    "pendencias": ["Acesso independente do lado norte", "Titularidade (polígono amarelo vizinho sem uso definido)"],
    "proximo": "Confirmar se a faixa pertence à mesma matrícula e se há retorno ou alça prevista no projeto da rodovia.",
    "operadores": ["Postos e truck stop", "Hotelaria econômica", "Manutenção de frotas"]
  },
  "PQT-PLAN": {
    "resumo": "Quadras do parque tecnológico conforme a planta A (12 quadras e módulos junto às lagoas). O polígono oficial do parque no OSM tem 16 ha; a planta desenha uma área maior.",
    "produto": "Lotes e quadras para empresas de tecnologia, laboratórios, serviços às universidades e infraestrutura digital.",
    "evidencia": ["Grade de quadras na planta A [P]", "16 ha doados ao Parque Tecnológico de MT, R$ 21,3 mi de infra previstos [F: Câmara VG 03/07/2026]", "Unemat instalou hub de inovação no parque [F: Unemat 25/06/2026]", "Avenidas internas em construção [F: OSM]"],
    "pendencias": ["Qual parte da grade é a área doada e qual é expansão proposta", "Governança do parque (estado, prefeitura, universidades) e regra de ocupação por empresas"],
    "proximo": "Reunião com Secitec/governança do parque para alinhar as quadras privadas vizinhas à área pública.",
    "operadores": ["Startups e agtechs", "Laboratórios e serviços de P&D", "Centros de treinamento", "Operadores de edge data center (ver quadra DC)"]
  },
  "DC-Q": {
    "resumo": "Quadra candidata a data center edge, reservada em estudo. Fora da faixa da linha de transmissão a confirmar, acima da cota das lagoas a confirmar.",
    "produto": "Lote DC-ready: duto de fibra em dois acessos, ramal até a subestação, licença prévia e outorga. Venda com prêmio ou land lease.",
    "evidencia": ["Linha de transmissão 138 kV da Energisa passa pelo setor [F: OSM]", "Redata (set/2026) exige água ≤ 0,05 L/kWh e energia 100% renovável por contrato [F: Min. Fazenda]", "IX.br e PoP TelCables em Cuiabá [F]"],
    "pendencias": ["Carta da Energisa: subestação, tensão, MVA disponíveis", "Duas rotas de fibra orçadas", "Topografia e cota de cheia", "Operador interessado"],
    "proximo": "Consulta formal à Energisa (experimento D do estudo de data center).",
    "operadores": ["Scala (HyperEdge)", "Tecto", "Elea", "Governo de MT / MTI (site de DR)"]
  },
  "LB-1": {
    "resumo": "Maior gleba sem parcelamento, entre a faixa de lotes e o parque tecnológico. Landbank para fases 2 e 3.",
    "produto": "Fases futuras: condomínio logístico modular, agroindústria leve, lotes de serviços, energia solar compartilhada.",
    "evidencia": ["Polígono salmão na planta A [P]", "Pasto e cerrado no satélite (out/2026)"],
    "pendencias": ["Titularidade e controle (opção, permuta ou propriedade)", "Diretrizes de uso", "Cota de cheia junto às lagoas norte"],
    "proximo": "Confirmar matrícula e instrumento de controle antes de qualquer promessa comercial.",
    "operadores": ["Desenvolvedores de galpão (LOG CP, GLP, Fulwood)", "Cooperativas e tradings do agro", "Geração distribuída solar"]
  },
  "LB-2": {
    "resumo": "Gleba oeste, junto ao trevo da BR-364, com frente para o Contorno Norte e para a BR-364.",
    "produto": "Serviços de rodovia e logística pesada com acesso duplo.",
    "evidencia": ["Polígono salmão na planta A [P]", "Trevo BR-364 existente e trecho da BR-364 em obras [F: OSM]"],
    "pendencias": ["Titularidade", "Acessos pelas duas rodovias", "Ruído e tráfego pesado"],
    "proximo": "Confirmar controle e estudar como fase 2 de lotes empresariais.",
    "operadores": ["Truck center", "Distribuidoras de combustível e peças", "Pátio de carretas"]
  },
  "LB-3": {
    "resumo": "Gleba amarela a nordeste, sem uso definido na planta, do lado norte do Contorno Norte.",
    "produto": "Reserva de longo prazo.",
    "evidencia": ["Polígono amarelo na planta A [P]"],
    "pendencias": ["Titularidade", "Uso pretendido", "Acesso"],
    "proximo": "Identificar o proprietário e o motivo da cor distinta na planta.",
    "operadores": []
  },
  "INST-RES": {
    "resumo": "Quadras numeradas 2, 3 e vizinhas entre o parque e a UFMT, desenhadas como institucionais ou reservas. A legenda dos números 1 a 30 não foi fornecida.",
    "produto": "A definir após a legenda: escola técnica, clínica, serviços aos campi ou moradia estudantil.",
    "evidencia": ["Polígonos numerados na planta A [P]"],
    "pendencias": ["Legenda dos círculos 1 a 30", "Destinação pública ou privada (Lei 6.766/1979 e diretrizes municipais)"],
    "proximo": "Obter a legenda com o autor da planta.",
    "operadores": ["Escola técnica / cursos", "Clínica e laboratório", "Moradia estudantil"]
  },
  "UFMT-PLAN": {
    "resumo": "Área indicada como UFMT 80 ha na planta. Polígono aproximado a partir da planta; o campus em construção no OSM ocupa parte dessa área.",
    "produto": "Âncora pública. Chapéu do Sol não desenvolve o campus; atende a demanda que ele gera.",
    "evidencia": ["Inscrição UFMT 80ha na planta A [P]", "Campus UFMT Várzea Grande em construção [F: OSM]", "Licitação Sinfra-MT de R$ 18,0 mi para retomar as obras, concorrência em set/2026 [F: 29/06/2026]"],
    "pendencias": ["Instrumento de doação ou cessão da área", "Cronograma real de operação e número de alunos por fase"],
    "proximo": "Confirmar com UFMT e Sinfra o cronograma e o efetivo previsto.",
    "operadores": ["Alimentação, papelaria, copiadora", "Moradia estudantil", "Transporte", "Clínica e farmácia"]
  },
  "AD-I": {
    "resumo": "Área desmembrada I conforme planta: 658.643 m² totais, 81.853 m² de APP/lago e 576.790 m² úteis. Pasto entre o parque, a UFMT e o Parque Genebra.",
    "produto": "Fase residencial e de serviços de bairro (conveniência, escola, clínica) próxima ao Genebra e aos campi.",
    "evidencia": ["Quadro de áreas inscrito na planta A [P]", "Matrículas das áreas desmembradas vizinhas identificadas na planta [P]"],
    "pendencias": ["Certidão da matrícula", "Delimitação legal da APP (SEMA-MT)", "Cota de cheia das lagoas sul e do córrego Pari"],
    "proximo": "Certidão e levantamento topográfico com APP.",
    "operadores": ["Supermercado de bairro", "Farmácia", "Escola infantil e básica", "Clínica multiprofissional"]
  },
  "GEN": {
    "resumo": "Parque Genebra, condomínio residencial da Chapéu do Sol Urbanismo, já construído e ocupado. Corresponde à área 8 da planta (600 a 650 lotes de 250 m²).",
    "produto": "Demanda existente para comércio, serviços e educação. Base de dados de moradores para o estudo de demanda.",
    "evidencia": ["Casas visíveis no satélite (out/2026)", "Polígono residencial no OSM [F]", "Lotes anunciados a R$ 1.200 a 1.800/m² [F: anúncios out/2026]"],
    "pendencias": ["Número de domicílios ocupados e perfil (fonte interna da empresa)"],
    "proximo": "Levantar ocupação real e renda média para dimensionar conveniência e escola.",
    "operadores": ["Conveniência e padaria", "Farmácia", "Academia", "Escola infantil"]
  },
  "LAG-N": {
    "resumo": "Cadeia de lagoas junto ao parque tecnológico. Reserva hídrica de segurança e paisagem; não é fonte de resfriamento industrial.",
    "produto": "Parque linear, amortecimento de cheias, reserva de incêndio.",
    "evidencia": ["Espelhos d'água na planta e no satélite [P]"],
    "pendencias": ["Volume útil, regime e qualidade", "Outorga de captação (SEMA-MT)", "APP legal"],
    "proximo": "Levantamento batimétrico e consulta de outorga.",
    "operadores": []
  },
  "LAG-S": {
    "resumo": "Lagoas entre o Parque Genebra e o loteamento Chapéu do Sol.",
    "produto": "Parque linear e drenagem.",
    "evidencia": ["Lagoas no OSM e no satélite [F]"],
    "pendencias": ["APP legal", "Drenagem do bairro"],
    "proximo": "Incluir no projeto de drenagem da área desmembrada I.",
    "operadores": []
  },
  "APP": {
    "resumo": "Áreas verdes, APP e margens do córrego Pari conforme a planta. Delimitação legal pendente.",
    "produto": "Parque linear, caminhos, compensação ambiental.",
    "evidencia": ["Polígonos verdes na planta A [P]", "Rio Pari no OSM [F]"],
    "pendencias": ["Delimitação de APP pela SEMA-MT", "Licenciamento ambiental do parcelamento"],
    "proximo": "Estudo ambiental preliminar.",
    "operadores": []
  },
  "INST-21": {
    "resumo": "Quadra 21 na planta, com edificações em arco desenhadas. Função não identificada sem a legenda.",
    "produto": "A definir.",
    "evidencia": ["Edificações desenhadas na planta A [P]"],
    "pendencias": ["Legenda dos números 1 a 30"],
    "proximo": "Obter a legenda com o autor da planta.",
    "operadores": []
  },
  "PQT-OSM": {
    "resumo": "Polígono do Parque Tecnológico de Mato Grosso mapeado no OSM, compatível com os 16 ha doados pela Ductievicz Incorporadora.",
    "evidencia": ["OSM amenity=research_institute [F]", "Doação de ~16 ha e R$ 21,3 mi de infra [F: Câmara VG 03/07/2026]", "Centro de Inovação inaugurado; Unemat instalou hub [F]"],
    "pendencias": ["Regras de ocupação por empresas privadas"],
    "proximo": "Reunião com a governança do parque.",
    "operadores": []
  },
  "UNEMAT": {"resumo": "Área da Unemat junto ao parque, em construção no OSM. A Unemat instalou hub de inovação no parque em 25/06/2026.", "evidencia": ["OSM landuse=construction [F]", "Notícia Unemat 25/06/2026 [F]"], "pendencias": ["Efetivo de alunos e cronograma"], "proximo": "Confirmar cursos e turnos previstos.", "operadores": []},
  "UFMT-OSM": {"resumo": "Campus UFMT Várzea Grande, em construção, com obras paralisadas e retomada licitada pela Sinfra-MT (R$ 18,0 mi, set/2026).", "evidencia": ["OSM [F]", "Sinfra-MT [F: 29/06/2026]"], "pendencias": ["Adjudicação da licitação", "Cronograma de operação"], "proximo": "Acompanhar a concorrência pública.", "operadores": []},
  "IFMT": {"resumo": "Campus do IFMT Várzea Grande, existente. Na planta, o IFMT está desenhado cerca de 500 m a oeste do campus real.", "evidencia": ["OSM amenity=college [F]"], "pendencias": ["Conferir a posição na planta"], "proximo": "Corrigir a planta.", "operadores": []},
  "CDS-BAIRRO": {"resumo": "Loteamento Chapéu do Sol, bairro consolidado ao sul das lagoas, com o Fórum de Várzea Grande ao lado.", "evidencia": ["OSM [F]", "Satélite"], "pendencias": [], "proximo": "", "operadores": []},
  "CN": {"resumo": "Contorno Norte, BR-163, rodovia em construção com duas pistas (motorway no OSM), da BR-364 ao norte de Cuiabá. É a rodovia da testada dos lotes empresariais. Não é a BR-070 nem a Rodovia dos Imigrantes.", "evidencia": ["OSM highway=construction, construction=motorway, ref BR-163 [F]", "Terraplenagem visível no satélite"], "pendencias": ["Prazo de conclusão e regra de acesso marginal (concessão Nova Rota do Oeste)"], "proximo": "Consulta formal à concessionária e à ANTT.", "operadores": []},
  "LT138": {"resumo": "Linha de transmissão de 138 kV da Energisa atravessando a gleba no sentido norte-sul, coincidente com a faixa não edificante da planta.", "evidencia": ["OSM power=line, 138000 V, Energisa [F]", "Faixa não edificante na planta [P]"], "pendencias": ["Largura da faixa de servidão", "Possibilidade de conexão (não é automática)"], "proximo": "Carta da Energisa com faixa e ponto de conexão.", "operadores": []}
};
