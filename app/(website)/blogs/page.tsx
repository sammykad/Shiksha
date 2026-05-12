import { BlogCard } from '@/components/website/blog/BlogCard';
import { FeaturedBlogSection } from '@/components/website/blog/FeaturedBlogSection';
import { CallToAction } from '@/components/website/shared/CallToAction';
import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/website/blogs/blog-data';

export const metadata: Metadata = {
  title: 'School Management Blog | Tips, Guides & Insights',
  description: 'Expert insights on school management, edtech trends, and digital transformation for Indian schools. Stay ahead with Shiksha Cloud.',
  keywords: [
    'school management blog',
    'education technology India',
    'school ERP tips',
    'school administration best practices',
    'digital school India',
    'school management guides',
    'education CRM insights',
    'school technology trends',
  ],
  alternates: {
    canonical: 'https://shiksha.cloud/blogs',
    languages: {
      en: 'https://shiksha.cloud/blogs',
      'x-default': 'https://shiksha.cloud/blogs',
    },
  },
  openGraph: {
    title: 'School Management Insights & Tips | Shiksha Cloud Blog',
    description: 'Expert insights on school management, edtech trends, and digital transformation.',
    url: 'https://shiksha.cloud/blogs',
    siteName: 'Shiksha Cloud',
    images: ['https://shiksha.cloud/og-image.png'],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shiksha_cloud',
    title: 'School Management Insights | Shiksha Cloud Blog',
    description: 'Expert insights on school management and edtech trends.',
    images: ['https://shiksha.cloud/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Shiksha Cloud Blog — School Management Insights',
  description: 'Expert insights on school management, edtech trends, and digital transformation for Indian schools.',
  url: 'https://shiksha.cloud/blogs',
  hasPart: getAllPosts().map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: `https://shiksha.cloud/blogs/${post.slug}`,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author.name },
  })),
};


const BlogPage = () => {
  const blogs = getAllPosts();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      {/* Blog Hero/Header */}
      <section className="relative mx-2 mb-4 overflow-hidden rounded-xl bg-white py-16 sm:mx-4 sm:py-24 dark:bg-black">
        <div
          className="-bottom-12 -right-16 sm:-bottom-16 sm:-right-20 pointer-events-none absolute origin-bottom-right"
          style={{ writingMode: 'vertical-rl' }}
        >
          <span className="select-none font-bold text-[12rem] text-black/[0.03] tracking-tighter sm:text-[14rem] md:text-[16rem] lg:text-[18rem] dark:text-white/[0.03]">
            Education
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="inline-flex items-center text-black/70 text-md tracking-tighter dark:text-white/70">
                Updates, guides, and best practices.
              </div>
            </div>
            <h1 className="font-semibold text-4xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Shiksha Cloud{' '}
              <span className="text-red-500/85 dark:text-red-500/85">
                Blogs
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-black/60 tracking-tighter sm:text-lg md:text-xl dark:text-white/60">
              Discover insights, tutorials, and stories about school management.
              Stay updated with the latest in education technology.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Blog */}
      <FeaturedBlogSection />

      {/* Latest Articles */}
      <section className="relative mx-2 mb-4 py-12 sm:mx-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="font-medium text-black/40 text-xs uppercase tracking-wider dark:text-white/40">
              Latest Articles
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* You can replace this with an array map for multiple articles */}
            {blogs.map((blog) => (
              <BlogCard
                key={blog.slug}
                title={blog.title}
                description={blog.excerpt}
                date={blog.date}
                readingTime={blog.readTime}
                image={blog.coverImage.src}
                tags={blog.tags}
                category={blog.category}
                slug={blog.slug}
              />
            ))}
          </div>
        </div>
      </section>
      <CallToAction
        variant="bordered"
        heading="Ready to See It in Action?"
        description="Everything you've read about — explore it live in your own free trial."
      />
    </div>
  );
};

export default BlogPage;
