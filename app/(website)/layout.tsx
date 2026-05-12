import Footer from '@/components/website/shared/Footer';
import { MegaNavbar } from '@/components/website/shared/MegaNavbar';

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MegaNavbar />
      {children}
      <Footer />
    </div>
  );
}
