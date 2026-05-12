import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/website/blogs/blog-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = 'https://shiksha.cloud';
  const currentDate = new Date();

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((blog) => ({
    url: `${appUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Location pages for dynamic paths
  const locations = [
    'pune', 'mumbai', 'delhi', 'bangalore', 'hyderabad',
    'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'lucknow',
  ];
  const locationEntries: MetadataRoute.Sitemap = locations.map((loc) => ({
    url: `${appUrl}/${loc}/school-management-software`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: `${appUrl}/`,
      changeFrequency: 'daily',
      priority: 1,
    },

    // About & Company pages
    {
      url: `${appUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${appUrl}/founder`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${appUrl}/why-shiksha`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${appUrl}/why-us`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${appUrl}/for-schools`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/for-admins`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${appUrl}/for-teachers`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${appUrl}/for-parents`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.85,
    },

    // Features pages
    {
      url: `${appUrl}/features`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/features/anonymous-complaints`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/attendance`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/fee-management`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/holidays`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/by-role`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/exam-management`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/document-verification`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/student-management`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/ai-reports`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/notification-engine`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/lead-management`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/features/integration`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/industries`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/industries/k-12-schools`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/industries/coaching-centers`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/industries/coaching-classes`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/industries/colleges-higher-education`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/industries/pre-schools`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/industries/degree-colleges`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/industries/junior-colleges`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/industries/professional-institutes`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/industries/skill-academies`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${appUrl}/industries/small-tutors-academies`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // Blogs
    {
      url: `${appUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // Other pages
    {
      url: `${appUrl}/pricing`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${appUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${appUrl}/changelog`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${appUrl}/guide`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Legal pages
    {
      url: `${appUrl}/privacy-policy`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${appUrl}/terms-and-conditions`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${appUrl}/refund-policy`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${appUrl}/support`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${appUrl}/time-blog`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${appUrl}/sitemap-page`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...blogEntries,
    ...locationEntries,
  ];
}
