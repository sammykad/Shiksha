import { Metadata } from 'next';

const appUrl = new URL('https://shiksha.cloud');

export const metadata: Metadata = {
    title: 'School Management Software Features — By Role | Shiksha',
    description: 'Complete role-based feature breakdown for admins, teachers, parents & students. See what each role gets in Shiksha Cloud. Trusted by 1,200+ schools.',
    keywords: ['school management software features', 'role-based school software', 'school admin dashboard features', 'teacher dashboard features', 'parent portal features', 'student dashboard features', 'school management roles'],
    alternates: {
        canonical: `${appUrl.origin}/features/by-role`,
    },
    openGraph: {
        title: 'School Management Features by Role | Shiksha Cloud',
        description: 'See how Shiksha Cloud provides a unique experience for every user role in your institution.',
        url: `${appUrl.origin}/features/by-role`,
        siteName: 'Shiksha Cloud',
        images: [{
            url: `${appUrl.origin}/og-image.png`,
            width: 1200,
            height: 630,
            alt: 'Shiksha Cloud - Features by Role',
        }],
    },
};

const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Shiksha Cloud — Complete School Management Platform',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web, Android, iOS',
    'description': 'Complete school management platform with role-based dashboards for admins, teachers, parents, and students. 100+ features across attendance, fees, exams, communication, and more.',
    'url': `${appUrl.origin}/features/by-role`,
    'offers': {
        '@type': 'Offer',
        'price': '79',
        'priceCurrency': 'INR',
        'description': 'Per student per month, no setup fees',
    },
    'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'reviewCount': '1200',
        'bestRating': '5',
    },
    'audience': {
        '@type': 'Audience',
        'audienceType': 'School administrators, teachers, parents, and students in India',
    },
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://shiksha.cloud/' },
        { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://shiksha.cloud/features' },
        { '@type': 'ListItem', position: 3, name: 'Features by Role', item: `${appUrl.origin}/features/by-role` },
    ],
};

export default function ByRoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {children}
        </>
    );
}
