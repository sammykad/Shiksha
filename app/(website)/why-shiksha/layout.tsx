import { Metadata } from 'next';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
    title: 'Why Choose Shiksha.cloud? Modern School ERP',
    description: 'Switch to Shiksha.cloud to save 60% on costs and automate 80% of admin tasks. Get 98% parent acknowledgment with automated WhatsApp notifications.',
    keywords: ['why shiksha cloud', 'school management comparison', 'traditional vs modern school software', 'whatsapp school notifications', 'roi on school software'],
    alternates: {
        canonical: `${appUrl.origin}/why-shiksha`,
    },
    openGraph: {
        title: 'Transform Your School with Shiksha Cloud | Why Us',
        description: 'Compare traditional systems with our modern, AI-powered school CRM.',
        url: `${appUrl.origin}/why-shiksha`,
        images: [`${appUrl.origin}/og-image.png`],
    },
};

export default function WhyShikshaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
