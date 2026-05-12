import { Metadata } from 'next';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
    title: 'Meet the Founder | sameer Kad | Shiksha.cloud',
    description: 'Learn about Sameer Kad, the founder of Shiksha.cloud, and his vision for modernizing education management in India through technology.',
    keywords: ['Sameer Kad', 'Shiksha.cloud founder', 'EdTech entrepreneur India', 'school management visionary'],
    alternates: {
        canonical: `${appUrl.origin}/founder`,
    },
    openGraph: {
        title: 'Sameer Kad - Founder of Shiksha.cloud',
        description: 'The story and vision behind India\'s fastest growing school CRM.',
        url: `${appUrl.origin}/founder`,
        images: [`${appUrl.origin}/og-image.png`],
    },
};

export default function FounderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
