# Prompt: Sala do Investidor

Como usar: abra o Claude Code neste repositório, no branch `sala-do-investidor`, e peça "Execute o prompt de docs/prompts/sala-do-investidor.md". Antes, crie na Vercel as variáveis `INVESTOR_KEYS` (formato nome:token, separados por vírgula) e `INVESTOR_PDF_URL` (link privado da apresentação em PDF).

Este repositório é público: aqui só entra conteúdo que pode ser público. A apresentação em PDF fica fora do Git. Arquivo de apoio no repositório: `private/investidores/ecossistema.png`.

---

Você vai trabalhar no repositório chapeudosol (Next.js 15, App Router, deploy na Vercel). Objetivo: criar a "Sala do Investidor", um visualizador guiado do Distrito Chapéu do Sol para mostrar a investidores antes de qualquer visita ao local. Hoje a captação depende de visita presencial; este visualizador resolve esse gargalo. Faça só o que está pedido aqui. Sem refatorações, arquivos ou recursos extras.

<estado_atual>
- Landing: app/page.tsx injeta components/home.html; formulário em components/LeadForm.tsx; leads via app/api/lead/route.ts (Resend ou formsubmit, destino LEAD_TO_EMAIL).
- Mapa público em public/mapa/index.html (MapLibre GL). Dados em public/mapa/data/*.js como globais: DATA_ASSETS (ativos do masterplan com id, nome, camada, uso, status, fonte, area_ha), FICHAS (resumo, produto, evidencia, pendencias, proximo), DATA_META, entorno, pois, isocronas, buildings e base.
- Status existentes: existente, desenvolvimento, estudo, diligencia. O "Modo apresentação" usa a constante TOUR (lista de ids) e mostra legenda com status, nome e resumo.
- next.config.mjs redireciona /mapa para /mapa/index.html.
</estado_atual>

<requisitos>
1. Acesso por convite: link individual /investidores?k=TOKEN. Nomes e tokens na variável de ambiente INVESTOR_KEYS (formato nome:token, separados por vírgula). Token válido grava cookie httpOnly por 30 dias e redireciona para /investidores sem o parâmetro; o token é revalidado a cada acesso, então revogar = remover do INVESTOR_KEYS. Sem token válido: página simples de pedido de acesso que envia para /api/lead com perfil "investidor". Registrar cada acesso válido no log do servidor (nome do convite e data). Incluir um comando simples para gerar token novo.
2. Privacidade: o repositório é público, então tudo que entra no Git é público. Os textos do tour usam só os fatos de <fatos_permitidos>; nada restrito vai para o código. Dados do tour fora de public/, importados no código da rota para entrarem no bundle da Vercel. Página com noindex e nofollow, sem link a partir da landing ou do /mapa público.
3. Reaproveitar o motor do mapa e os dados de public/mapa/data sem duplicar datasets. Pode adaptar index.html para aceitar um tour externo, desde que /mapa continue igual para o público.
4. Tour em arquivo de dados editável sem mexer em código (ex.: private/investidores/tour.json). Campos por passo: id, título, texto (até 45 palavras), câmera {centro, zoom, pitch, bearing} ou id de ativo, camadas visíveis, ativos destacados, status visíveis, etiqueta de evidência e fonte. Textos em pt e en; o en sai marcado como rascunho para minha revisão. Seletor PT/EN visível.
5. Etiquetas de evidência no visual do site: "dado da empresa", "fonte pública" (com fonte e data), "estudo conceitual" e "meta".
6. Visão por horizonte: seletor H1/H2/H3 que recolore os ativos por horizonte. Proponha o mapeamento ativo para horizonte no plano; eu aprovo antes de implementar.
7. Investimentos públicos: pinos com fonte e data. Use só coordenadas que já existem nos dados ou que eu fornecer. Sem coordenada, liste no painel lateral com "localização a confirmar". Nunca invente coordenadas.
8. Final do tour: botões "Agendar conversa" e "Solicitar acesso ao data room" via /api/lead (perfil investidor, nome do convite no assunto). Botão "Baixar apresentação" só para quem entrou pelo convite, apontando para INVESTOR_PDF_URL; sem a variável, o botão fica oculto. O PDF nunca entra no Git. O passo 8 mostra private/investidores/ecossistema.png; se o arquivo não existir, esconda o elemento e me avise.
9. Aviso legal acessível em todos os passos (texto em <aviso_legal>).
10. Identidade igual à do site: Manrope nos títulos, Inter no texto, DM Mono nos rótulos; teal #087E73 e #073E3B, laranja #F39224; fundos claros com painéis escuros só como acento. Precisa funcionar no celular, porque o link vai por WhatsApp.
</requisitos>

<fatos_permitidos>
Use SOMENTE estes fatos. Não crie números, nomes de empresas, coordenadas ou projeções.
- Território: mais de 200 ha na área do projeto, com zonas residencial, comercial e industrial [dado da empresa]; 8 km do Contorno Norte dentro da área [dado da empresa].
- Contorno Norte: 52 km; Lote 1 (21,5 km) em obras; Lote 2 (30,2 km) em aprovação de projeto; R$ 540 mi no Novo PAC [Agência iNFRA, 31/10/2025].
- Via de acesso: 1,6 km ligando o Chapéu do Sol ao Contorno Norte, R$ 5,1 mi, licitação concluída; interseções a confirmar [VG Notícias, 18/03/2026].
- Nova ponte Chapéu do Sol a Santa Rosa, em Cuiabá: licitação anunciada [Prefeitura de VG, 21/03/2026].
- Parque Tecnológico Mato Grosso: inaugurado em 25/06/2026; Centro de Inovação de 3.920 m²; gestão do Parque Tecnológico de São José dos Campos; cerca de 50 empresas interessadas [Prefeitura de VG e Cenário MT, 06/2026]. 80 ha planejados, sendo 64 ha para empresas privadas, em área do Estado [ALMT, Req. 594/2020 e PL 2181/2023]. Cerca de 16 ha doados pela incorporadora do grupo [Câmara de VG, 03/07/2026].
- IFMT Várzea Grande: sede própria desde 04/02/2026, R$ 17,2 mi, 12 cursos, 1,6 mil alunos [Portal Tela, 02/2026]. UFMT VG: retomada das obras licitada, R$ 18 mi [MidiaNews, 06/2026].
- Hospital e Maternidade Municipal: R$ 103 mi do Novo PAC e cerca de R$ 5 mi do município; 127 leitos SUS [Prefeitura de VG, 02/2026]. Água: 5 reservatórios, R$ 16,4 mi, 82% executado [Prefeitura de VG, 08/2026]. Várzea Grande: 300 mil habitantes no Censo 2022 e 323 mil na estimativa recente [IBGE].
- Logística: 115 mi de veículos equivalentes em 2023 nas 9 praças da concessão BR-163/MT e MT-407, contra 87 mi em 2016, cerca de 90% pesados [Moody's Local, 01/2025]. LOG Cuiabá: 38,6 mil m² entregues no 1º tri de 2025 [LOG, release do 4T25]. RZZR11: CDs sob medida em Cuiabá com vacância zero [relatório do fundo, 04/2026]. GGRC11: contrato atípico até 2037 [FIIs.com.br, 11/2024]. Aluguel e vacância em Cuiabá: "a levantar".
- Residencial e comercial [dado da empresa]: Florença quase sem estoque; Genebra em andamento; GINCO parceira em condomínios; centro comercial previsto com academia de 1.500 m², posto e prédio de 10 andares; condomínio sênior previsto junto ao lago.
- Modelo [meta]: quadras de galpões de 50 mil m²; obra só com BTS assinado ou 50% pré-locado; SPE por fase de renda; terra aportada a valor de laudo independente; capital em tranches por marco; saída por FII ou refinanciamento; grupo fechado de investidores. Valores de aporte e termos ficam fora do tour: estão na apresentação e no term sheet.
- Horizontes [meta]: H1, 2026 e 2027, base pronta (data room, carteira com auditoria externa, aprovações, grupo de investidores e SPE). H2, 2027 a 2029, renda contratada (primeiras quadras de galpões, centro comercial, serviços nos condomínios, sênior com operador, FII ou FIP com gestora parceira). H3, 2029 em diante, opções com gate (data center com operador, energia, investimento aberto, replicar o modelo).
- Métrica-guia: receita recorrente contratada, em R$ por mês.
</fatos_permitidos>

<tour>
1 O território · 2 Acesso e Contorno Norte · 3 Oito investimentos públicos · 4 Parque Tecnológico e universidades · 5 Logística na Grande Cuiabá · 6 Primeira tese de renda: galpões · 7 Residencial e comercial · 8 Ecossistema e métrica-guia · 9 Três horizontes · 10 Como investir e próximos passos (conversa individual, visita guiada, data room com NDA, term sheet, compromisso).
Lotes empresariais e quadras de galpão aparecem sempre como "estudo conceitual, sem aprovação".
</tour>

<aviso_legal>
Material informativo, de uso restrito e individual, destinado a investidores qualificados. Não constitui oferta nem solicitação de oferta de valores mobiliários, nem recomendação de investimento. Informações preliminares; dados da empresa serão documentados no data room. Investimentos imobiliários envolvem risco de perda do capital e baixa liquidez. Metas são objetivos de gestão, não promessa de resultado.
</aviso_legal>

<proibido>
- Projeção de TIR, rentabilidade, valorização ou retorno.
- Empresas privadas apresentadas como interessadas, parceiras ou inquilinas, exceto a GINCO como parceira em condomínios; os arquivos de public/logos não entram aqui.
- Qualquer informação da empresa que não esteja em <fatos_permitidos>.
- Atribuir à empresa áreas do Parque Tecnológico ou afirmar "acesso direto" ao Contorno Norte.
- Banco de dados, provedor de login, dark mode ou qualquer recurso fora desta lista.
</proibido>

<como_trabalhar>
Fase 0: leia os arquivos de <estado_atual> e me entregue um plano curto com a abordagem para reaproveitar o mapa, os arquivos a criar e alterar, o mapeamento ativo para horizonte e o rascunho do tour.json. PARE e espere minha aprovação.
Fase 1: acesso por convite, rota protegida e noindex.
Fase 2: motor do tour e dados.
Fase 3: botões finais, aviso legal e versão en.
Ao fim de cada fase: rode npm run build, liste o que mudou, os arquivos tocados e como testar. Se houver navegador disponível, valide em 375px e 1440px. Depois pare para minha revisão.
Pare e pergunte antes de: instalar dependência, apagar ou renomear arquivo, mudar next.config.mjs, alterar o /mapa público, fazer commit, push ou deploy.
Nunca grave no Git tokens, o PDF da apresentação ou valores de aporte.
</como_trabalhar>
