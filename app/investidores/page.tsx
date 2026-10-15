import { headers } from 'next/headers';
import { HEADER } from '@/lib/investidores';
import PedidoAcesso from '@/components/investidores/PedidoAcesso';
import Tour from '@/components/investidores/Tour';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const convite = (await headers()).get(HEADER);
  if (!convite) {
    return (
      <main className="gate">
        <div className="gate-card">
          <p className="eyebrow">Distrito Chapéu do Sol · Várzea Grande, MT</p>
          <h1>Visita virtual para investidores</h1>
          <p>O acesso é por convite. Se você ainda não recebeu o link, deixe seu contato.</p>
          <PedidoAcesso modo="acesso" />
        </div>
      </main>
    );
  }
  return (
    <Tour
      convite={convite}
      pdfUrl={process.env.INVESTOR_PDF_URL || null}
      callUrl={process.env.INVESTOR_CALL_URL || null}
      dataroomUrl={process.env.INVESTOR_DATAROOM_URL || null}
    />
  );
}
