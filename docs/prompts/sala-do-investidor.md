# Prompt: Sala do Investidor

Como usar: abra o Claude Code neste repositório, no branch `sala-do-investidor`, e peça "Execute o prompt de docs/prompts/sala-do-investidor.md". Antes, crie na Vercel as variáveis `INVESTOR_KEYS` (formato nome:token, separados por vírgula) e `INVESTOR_PDF_URL` (link privado da apresentação em PDF).

Este repositório é público: aqui só entra conteúdo que pode ser público. A apresentação em PDF fica fora do Git. Arquivo de apoio no repositório: `private/investidores/ecossistema.png`.

---

Contexto
Repositório chapeudosol: Next.js 15 (App Router) na Vercel. Já existem a landing (app/page.tsx com components/home.html), o formulário de leads (/api/lead) e o mapa público /mapa (public/mapa/index.html, MapLibre GL, dados em public/mapa/data/*.js: DATA_ASSETS com status existente, desenvolvimento, estudo e diligencia; FICHAS; um modo apresentação simples com a lista TOUR).
Na reunião de 14/10 com a diretoria, o gargalo ficou claro: a captação de investidores depende de visita presencial e não existe apresentação interativa.

Objetivo
Criar /investidores, uma visita virtual guiada ao Distrito Chapéu do Sol que substitui a primeira visita ao local, com dois modos:
- Apresentação: eu conduzo em reunião ou tela compartilhada; as setas do teclado avançam e voltam.
- Autoguiado: o investidor abre o link do convite no celular e avança sozinho.
A visita termina com dois pedidos: agendar uma conversa ou acessar o data room.

Roteiro em 10 cenas
Cada cena define câmera, camadas, ativos em destaque e um texto de até 40 palavras com etiqueta de evidência.
1 O território · 2 Como se chega: Contorno Norte, via de acesso e ponte · 3 Investimentos públicos ao redor · 4 Parque Tecnológico e universidades · 5 Logística da Grande Cuiabá · 6 Galpões para locar · 7 Residencial e comercial · 8 Ecossistema, com a imagem private/investidores/ecossistema.png · 9 Hoje, 2027 e 2031 · 10 Próximos passos: conversa, visita guiada, data room, term sheet e compromisso.
Uma linha do tempo Hoje · 2027 · 2031 recolore os ativos entre existente, em desenvolvimento e previsto. Lotes e quadras de galpão aparecem sempre como "estudo conceitual, sem aprovação".

Fatos que pode usar (só estes; etiqueta entre colchetes)
- Mais de 200 ha com zonas residencial, comercial e industrial; 8 km do Contorno Norte dentro da área; ampliação da ETA de 7.500 para 15.000 famílias [dado da empresa].
- Contorno Norte: 52 km, Lote 1 (21,5 km) em obras, R$ 540 mi no Novo PAC [Agência iNFRA, 31/10/2025]. Via de acesso de 1,6 km licitada, R$ 5,1 mi; interseções a confirmar [VG Notícias, 18/03/2026]. Nova ponte para Santa Rosa, em Cuiabá, com licitação anunciada [Prefeitura de VG, 21/03/2026].
- Parque Tecnológico Mato Grosso: inaugurado em 25/06/2026, Centro de Inovação de 3.920 m², gestão do Parque Tecnológico de São José dos Campos, cerca de 50 empresas interessadas [Prefeitura de VG e Cenário MT, 06/2026]; 80 ha planejados, 64 ha para empresas privadas em área do Estado [ALMT, PL 2181/2023]; cerca de 16 ha doados pela incorporadora do grupo [Câmara de VG, 03/07/2026].
- IFMT Várzea Grande: sede própria desde 04/02/2026, 12 cursos, 1,6 mil alunos [Portal Tela, 02/2026]. UFMT VG: retomada das obras licitada, R$ 18 mi, resultado a confirmar [MidiaNews, 06/2026].
- Hospital e Maternidade Municipal: 127 leitos SUS, R$ 103 mi do Novo PAC e cerca de R$ 5 mi do município [Prefeitura de VG, 02/2026]. Água: 5 reservatórios, R$ 16,4 mi, 82% executado [Prefeitura de VG, 08/2026]. Várzea Grande: 300 mil habitantes no Censo 2022, 323 mil na estimativa recente [IBGE].
- Logística: 115 mi de veículos equivalentes em 2023 nas 9 praças da concessão BR-163/MT e MT-407, contra 87 mi em 2016, cerca de 90% pesados [Moody's Local, 01/2025]. LOG Cuiabá: 38,6 mil m² entregues no 1º tri de 2025 [LOG, 4T25]. RZZR11: CDs sob medida em Cuiabá, vacância zero [relatório do fundo, 04/2026]. GGRC11: contrato atípico até 2037 [FIIs.com.br, 11/2024]. Aluguel e vacância em Cuiabá: "a levantar".
- Florença quase sem estoque; Genebra em andamento; GINCO parceira em condomínios; centro comercial previsto com academia de 1.500 m², posto e prédio de 10 andares; condomínio sênior previsto junto ao lago [dado da empresa].
- Modelo [meta]: quadras de galpões de 50 mil m²; obra só com BTS assinado ou 50% pré-locado; SPE por fase de renda; terra a valor de laudo independente; capital por marco; saída por FII ou refinanciamento; grupo fechado de investidores.
- Métrica-guia: receita recorrente contratada, em R$ por mês.

Regras
1. O repositório é público: nada de valores de aporte, termos de investimento, tokens ou PDF no Git.
2. Acesso por convite: /investidores?k=TOKEN validado contra INVESTOR_KEYS (nome:token, separados por vírgula), cookie httpOnly de 30 dias revalidado a cada acesso e log do servidor com o nome do convite. Sem token: formulário de pedido de acesso via /api/lead com perfil "investidor". noindex e nenhum link a partir da landing ou do /mapa.
3. O botão "Baixar apresentação" só aparece se INVESTOR_PDF_URL existir.
4. Reaproveite o motor do mapa e os dados de public/mapa/data sem duplicar. O /mapa público continua igual.
5. As 10 cenas ficam num arquivo de dados editável fora de public/, com textos em pt e en (en marcado como rascunho para revisão) e seletor PT/EN.
6. Investimentos públicos só com coordenadas que já existem nos dados. Sem coordenada, liste no painel com "localização a confirmar".
7. Visual do site: Manrope, Inter e DM Mono; #087E73, #073E3B e #F39224; fundo claro, painéis escuros só como acento; pensado primeiro para celular.
8. Aviso legal visível em todas as cenas: "Material informativo, de uso restrito e individual, destinado a investidores qualificados. Não constitui oferta nem solicitação de oferta de valores mobiliários, nem recomendação de investimento. Informações preliminares. Investimentos imobiliários envolvem risco de perda do capital e baixa liquidez. Metas são objetivos de gestão, não promessa de resultado."
9. Não faça: projeção de retorno ou valorização; empresas privadas como interessadas, parceiras ou inquilinas, exceto a GINCO em condomínios; afirmar acesso direto ao Contorno Norte; atribuir à empresa áreas do Parque; banco de dados, login, dark mode ou qualquer recurso fora desta lista.

Como trabalhar
1. Leia os arquivos citados e me entregue um plano curto: abordagem, arquivos a criar e alterar, mapeamento de cada ativo na linha do tempo e rascunho das 10 cenas. Pare e espere minha aprovação.
2. Implemente em três entregas: acesso; cenas e linha do tempo; fechamento e versão en. Ao fim de cada uma, rode npm run build, diga o que mudou e como testar em 375px e 1440px, e pare para revisão.
3. Pergunte antes de instalar dependência, apagar arquivo, mudar next.config.mjs ou o /mapa público, e antes de commit, push ou deploy. Faça só o que está aqui.
