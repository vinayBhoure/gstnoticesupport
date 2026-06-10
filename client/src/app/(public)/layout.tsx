import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollShell } from '@/components/layout/ScrollShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema } from '@/lib/structured-data';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <ScrollShell />
    </>
  );
}
