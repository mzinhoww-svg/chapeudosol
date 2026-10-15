import fs from 'node:fs';
import path from 'node:path';
import LeadForm from '@/components/LeadForm';

export default function Page() {
  const html = fs.readFileSync(path.join(process.cwd(), 'components/home.html'), 'utf8');
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <LeadForm />
    </>
  );
}
