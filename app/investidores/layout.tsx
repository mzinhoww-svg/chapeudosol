import type { Metadata } from 'next';
import './tour.css';

export const metadata: Metadata = {
  title: 'Visita virtual · Distrito Chapéu do Sol',
  robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
