# private/investidores

Insumos da Sala do Investidor. A pasta fica fora de `public/` para o site não servir os arquivos direto, mas o repositório é público: não coloque aqui nada restrito.

- `ecossistema.png`: flywheel do ecossistema com os três horizontes, usada no passo 8 do tour.
- A apresentação em PDF fica fora do Git. O site usa o link privado da variável `INVESTOR_PDF_URL`.

## Variáveis de ambiente (Vercel)

- `INVESTOR_KEYS`: convites no formato `nome:token`, separados por vírgula. Acesso em `/investidores?k=TOKEN`. Revogar = remover o par e republicar.
- `INVESTOR_PDF_URL` (opcional): link privado do PDF. O botão "Baixar apresentação" só aparece se existir.
- `INVESTOR_CALL_URL` (opcional): link para agendar a conversa. Sem ela, o botão abre um formulário (`/api/lead`, perfil "investidor").
- `INVESTOR_DATAROOM_URL` (opcional): link do data room. Sem ela, o botão abre um formulário de solicitação.

As cenas ficam em `content/investidores/cenas.ts` (pt e en; o en é rascunho para revisão).
