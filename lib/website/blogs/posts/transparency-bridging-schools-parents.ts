// lib/website/posts/transparency-bridging-schools-parents.ts
import type { BlogPost } from '../blog-types';

const post: BlogPost = {
    slug: 'transparency-bridging-schools-parents',
    title: 'How Shiksha.cloud Bridges School-Parent Gaps',
    description:
        'Explore how real-time access to attendance, fees, and academic progress is changing parent-school relationships.',
    excerpt:
        'Explore how real-time access to attendance, fees, and academic progress is changing parent-school relationships.',

    date: '2024-03-05',
    category: 'Best Practices',
    tags: ['Parent Engagement', 'Transparency', 'Communication'],
    readTime: '5 min read',
    featured: false,
    views: '2.1K',

    author: {
        name: 'Shiksha.cloud Team',
        role: 'Customer Success',
        avatar:
            'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face',
    },

    coverImage: {
        src: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1200&h=600&fit=crop',
        alt: 'Parents and schools working together',
    },

    content: {
        introduction: `
      Traditional school communication often left parents in the dark. They'd wait for quarterly meetings
      to learn about attendance issues or discover fee dues only when reminders came home. Shiksha.cloud
      changes this dynamic completely.
    `,

        stats: [
            { value: '100%', label: 'Parent Visibility' },
            { value: '24/7', label: 'Portal Access' },
            { value: '90%', label: 'Parent Satisfaction' },
            { value: '50%', label: 'Faster Response' },
        ],

        sections: [
            {
                title: 'Real-Time Access to Information',
                content: `
          Parents now receive real-time notifications when their child is marked absent—allowing immediate
          follow-up. They can view detailed fee breakdowns, payment history, and upcoming dues anytime
          through the parent portal.
        `,
                image: {
                    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
                    alt: 'Parent using mobile app for school information',
                    caption: 'Parents get instant access to all school information',
                },
                highlights: [
                    'Instant attendance notifications',
                    'Real-time fee payment tracking',
                    'Academic progress updates',
                    'Direct communication with teachers',
                ],
            },
            {
                title: 'Building Trust Through Transparency',
                content: `
          When parents have visibility, they become partners in education rather than passive observers.
          The data shows that transparency drives engagement, improves fee collection rates, and reduces
          administrative overhead.
        `,
                image: {
                    src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&h=400&fit=crop',
                    alt: 'School and parent partnership',
                    caption: 'Transparency builds lasting trust',
                },
            },
        ],

        conclusion: `
      When parents have real-time access to information, they become true partners in education. This
      transparency benefits everyone: students get better support, parents feel engaged, and schools
      reduce administrative burden while building lasting trust.
    `,
    },
};

export default post;