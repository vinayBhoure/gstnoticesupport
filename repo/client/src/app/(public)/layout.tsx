import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollShell } from '@/components/layout/ScrollShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema } from '@/lib/structured-data';
import { WHATSAPP_LINKS } from '@/data/common';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <ScrollShell whatsappHref={WHATSAPP_LINKS.generalQuery} />
    </>
  );
}
