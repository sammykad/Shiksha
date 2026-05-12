import { PrincipalBenefits } from '@/components/website/principal/PrincipalBenefits';
import PrincipalConvincer from '@/components/website/principal/PrincipalConvincer';
import { SecurityTrust } from '@/components/website/security/SecurityTrust';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'School Management for Principals',
  description:
    'Discover why principals trust Shiksha.cloud. Save 60% in costs, automate fees, and get bank-grade security. Setup in 24 hours. Join 50+ schools today.',
  keywords: [
    'School Management Software',
    'Principal Benefits',
    'Fee Collection Automation',
    'School Security',
    'Education Technology',
    'Shiksha.cloud',
  ],
  openGraph: {
    title: 'Why Choose Shiksha.cloud | Smart School Management for Principals',
    description:
      'Discover why principals trust Shiksha.cloud. Cut costs by 60%, automate fee collection, and ensure bank-grade security. Setup in 24 hours. Join 50+ schools today.',
  },
  alternates: {
    canonical: 'https://shiksha.cloud/why-us',
  },
};

const page = () => {
  return (
    <div>
      <PrincipalConvincer />

      <SecurityTrust />
      <PrincipalBenefits />

    </div>
  );
};

export default page;
