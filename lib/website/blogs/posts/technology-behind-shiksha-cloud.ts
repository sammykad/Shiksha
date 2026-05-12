// lib/website/posts/technology-behind-shiksha-cloud.ts
import type { BlogPost } from '../blog-types';

const post: BlogPost = {
    slug: 'technology-behind-shiksha-cloud',
    title: 'Scalable Technology Behind Shiksha.cloud CRM',
    description:
        'A technical deep dive into how we built Shiksha.cloud using modern web technologies like Next.js, Prisma, and more.',
    excerpt:
        'A technical deep dive into how we built Shiksha.cloud using modern web technologies like Next.js, Prisma, and more.',

    date: '2024-03-10',
    category: 'Engineering',
    tags: ['Technology', 'Next.js', 'Architecture', 'EdTech'],
    readTime: '8 min read',
    featured: false,
    views: '1.8K',

    author: {
        name: 'Sameer Kad',
        role: 'Software Developer',
        avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },

    coverImage: {
        src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
        alt: 'Technology and code representing modern development',
    },

    content: {
        introduction: `
      Shiksha.cloud isn't just another school management system—it's engineered for performance, security,
      and scalability. In this technical article, we pull back the curtain on our architecture and the
      decisions that make our platform robust and reliable.
    `,

        stats: [
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<200ms', label: 'Average Response' },
            { value: '100K+', label: 'Users Served' },
            { value: '256-bit', label: 'Encryption' },
        ],

        sections: [
            {
                title: 'Modern Tech Stack',
                content: `
          We use Next.js 15 with App Router for server-side rendering and optimal performance. Our database
          layer leverages Prisma ORM with PostgreSQL, providing type-safe queries and real-time capabilities.
        `,
                image: {
                    src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
                    alt: 'Modern development setup',
                    caption: 'Our modern, scalable architecture',
                },
                highlights: [
                    'Next.js 15 with App Router for performance',
                    'Prisma ORM for type-safe database operations',
                    'PostgreSQL for reliable data storage',
                    'Real-time notifications with WebSockets',
                ],
            },
            {
                title: 'Multi-Tenant Architecture',
                content: `
          Our multi-tenant design keeps data completely isolated between schools while maintaining a single
          codebase. Each organization operates in a secure, isolated environment.
        `,
                image: {
                    src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
                    alt: 'Cloud infrastructure and security',
                    caption: 'Secure multi-tenant cloud architecture',
                },
                highlights: [
                    'Complete data isolation between schools',
                    'Role-based access control (RBAC)',
                    'Clerk authentication integration',
                    'Regular automated backups',
                ],
            },
            {
                title: 'Notification Engine',
                content: `
          One of our proudest achievements is our custom notification engine that handles SMS, WhatsApp,
          email, and push notifications with intelligent queuing, rate limiting, and failover mechanisms.
        `,
                image: {
                    src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop',
                    alt: 'Notification and communication systems',
                    caption: 'Multi-channel notification delivery system',
                },
            },
        ],

        conclusion: `
      Building a scalable edtech platform requires careful consideration of performance, security, and user
      experience. Our technology choices enable us to serve thousands of users while maintaining the
      reliability and speed that schools depend on.
    `,
    },
};

export default post;