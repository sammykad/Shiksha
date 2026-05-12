// lib/website/posts/why-indian-schools-choosing-shiksha-cloud.ts

import { BlogPost } from "../blog-data";

const post: BlogPost = {
    slug: 'why-indian-schools-choosing-shiksha-cloud',
    title: 'Why Schools Choose Shiksha.cloud Over Expensive ERPs',
    description:
        "Discover how schools across India are saving ₹5,000-10,000 monthly while getting better features with Shiksha.cloud's transparent pricing model.",
    excerpt:
        "Indian schools are saving thousands monthly with Shiksha.cloud's fair pricing - only ₹79 per student with unlimited free access for parents, teachers, and admins.",

    date: '2024-03-20',
    category: 'Product',
    tags: ['Pricing', 'School Management', 'Cost Savings', 'Indian Education'],
    readTime: '5 min read',
    featured: true,
    views: '4.1K',

    author: {
        name: 'Sameer Kad',
        role: 'Founder & Developer',
        avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },

    coverImage: {
        src: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=600&fit=crop',
        alt: 'School administrators reviewing cost-effective solutions',
    },

    content: {
        introduction: `
      Most school management systems charge separately for every user - students, parents, teachers, and admins.
      A school with 140 users could pay ₹8,000-13,000 monthly. Shiksha.cloud changes this completely with
      transparent, fair pricing that saves schools thousands every month.
    `,

        stats: [
            { value: '₹79', label: 'Per Student Only' },
            { value: '₹0', label: 'For Parents & Staff' },
            { value: '8+', label: 'Schools Using Us' },
            { value: '60%', label: 'Average Savings' },
        ],

        sections: [
            {
                title: "The Hidden Costs Other Platforms Don't Tell You",
                content: `
          Most competitors advertise attractive per-student pricing, but the real cost becomes clear only after
          you sign up. They charge ₹50-100 per parent, ₹50-100 per teacher, and ₹50-100 per admin. For a
          typical school with 40 students, 80 parents, 10 teachers, and 10 admins, you could be paying
          ₹8,160-13,160 monthly instead of the advertised ₹3,160.
        `,
                highlights: [
                    'Hidden per-user fees can double or triple your actual cost',
                    'Setup fees ranging from ₹5,000-25,000 are common',
                    'Payment gateway charges are often higher than industry standards',
                    'Training and support come with additional yearly costs',
                ],
            },
            {
                title: 'How Shiksha.cloud Pricing Actually Works',
                content: `
          We believe in complete transparency. You pay only ₹79 per enrolled student per month. That's it.
          Parents get full portal access for free. Teachers get complete classroom management tools for free.
          Admins get the entire dashboard for free. No setup fees, no hidden costs, no surprises.
          A school with 40 students pays exactly ₹3,160 monthly, regardless of how many parents, teachers,
          or admins use the system.
        `,
                image: {
                    src: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=400&fit=crop',
                    alt: 'Transparent pricing comparison chart',
                    caption: 'Save ₹5,000-10,000 monthly compared to competitors',
                },
                highlights: [
                    'Only ₹79 per student - nothing else',
                    'Unlimited parents, teachers, and admins included',
                    'Zero setup or onboarding fees',
                    'Competitive payment gateway rates',
                ],
            },
            {
                title: 'What You Get for ₹79 Per Student',
                content: `
          Unlike competitors who lock features behind expensive tiers, our ₹79 per student pricing includes
          everything: online fee payments with automated receipts, real-time attendance tracking with parent
          notifications, multi-channel notifications via SMS, WhatsApp, and email, anonymous complaint system,
          document management with verification workflow, holiday calendar, bulk student imports, comprehensive
          analytics dashboards, and dedicated support. Schools get enterprise-grade features at a fraction of
          competitor pricing.
        `,
            },
            {
                title: 'Real Schools, Real Savings',
                content: `
          Schools switching to Shiksha.cloud report average savings of ₹60,000-1,20,000 annually while getting
          better features and support. One principal shared: "पहले हमें हर user के लिए अलग से पैसे देने पड़ते थे।
          अब सिर्फ students के लिए payment करते हैं और पूरा staff free में इस्तेमाल करता है। यह बहुत बड़ी राहत है।"
          These savings can be redirected toward educational resources, teacher training, or infrastructure improvements.
        `,
            },
        ],

        conclusion: `
      Shiksha.cloud proves that powerful school management software doesn't have to be expensive. Our transparent
      pricing model - only ₹79 per student with unlimited free access for parents and staff - saves schools
      thousands monthly while delivering superior features and support. Join 8+ schools already experiencing
      the difference.
    `,
    },
};

export default post;