import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/select-organization',
          '/sign-in',
          '/sign-up',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/select-organization',
          '/sign-in',
          '/sign-up',
          '/_next/',
        ],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/select-organization',
          '/sign-in',
          '/sign-up',
          '/_next/',
        ],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/select-organization',
          '/sign-in',
          '/sign-up',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://shiksha.cloud/sitemap.xml',
    host: 'https://shiksha.cloud',
  };
}
