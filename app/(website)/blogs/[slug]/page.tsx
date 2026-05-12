// app/blogs/[slug]/page.tsx
import {
  getPostBySlug,
  getAllPosts,
  type BlogPost,
  getPostsByCategory,
} from '@/lib/website/blogs/blog-data';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  ArrowLeft,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { Metadata } from 'next';

// ==================== METADATA ====================
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = getPostBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found | Shiksha Cloud',
    };
  }

  return {
    title: blog.title,
    description: blog.description,
    keywords: blog.tags,
    authors: [{ name: blog.author.name }],
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: 'article',
      publishedTime: blog.date,
      authors: [blog.author.name],
      tags: blog.tags,
      images: [blog.coverImage.src],
      url: `https://shiksha.cloud/blogs/${blog.slug}`,
      siteName: 'Shiksha Cloud',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.description,
      images: [blog.coverImage.src],
    },
    alternates: {
      canonical: `https://shiksha.cloud/blogs/${blog.slug}`,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = getPostBySlug(slug);

  if (!blog) {
    notFound();
  }

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    datePublished: blog.date,
    dateModified: blog.date,
    author: {
      '@type': 'Person',
      name: blog.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Shiksha Cloud',
      logo: {
        '@type': 'ImageObject',
        url: 'https://shiksha.cloud/logo.svg',
      },
    },
    image: blog.coverImage.src,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://shiksha.cloud/blogs/${blog.slug}`,
    },
    keywords: blog.tags.join(', '),
    articleSection: blog.category,
    wordCount: blog.content.sections.reduce((acc, section) => {
      const words = section.content.split(' ').length;
      return acc + words;
    }, 0) + blog.content.introduction.split(' ').length + blog.content.conclusion.split(' ').length,
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      {/* Header with Back Button */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/blogs"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Blogs</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{blog.readTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            {blog.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          {blog.description}
        </p>

        {/* Author & Date */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={blog.author.avatar}
                alt={blog.author.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{blog.author.name}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {format(new Date(blog.date), 'MMM dd, yyyy')}
                </span>
                <span>•</span>
                <span>{blog.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
          <Image
            src={blog.coverImage.src}
            alt={blog.coverImage.alt}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* Content Sections */}
        <article className="prose prose-gray max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <p className="text-gray-700 leading-relaxed mb-6">
              {blog.content.introduction}
            </p>
          </section>

          {/* Stats (if any) */}
          {blog.content.stats && blog.content.stats.length > 0 && (
            <section className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {blog.content.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 p-4 rounded-lg text-center"
                  >
                    <div className="text-2xl font-bold text-blue-700">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sections */}
          {blog.content.sections.map((section, index) => (
            <section key={index} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {section.title}
              </h2>

              <div className="text-gray-700 leading-relaxed mb-6">
                {section.content}
              </div>

              {/* Highlights */}
              {section.highlights && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <ul className="space-y-2">
                    {section.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Image */}
              {section.image && (
                <div className="my-8">
                  <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                    <Image
                      src={section.image.src}
                      alt={section.image.alt}
                      fill
                      sizes="(max-width: 896px) 100vw, 896px"
                      className="object-cover"
                    />
                  </div>
                  {section.image.caption && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {section.image.caption}
                    </p>
                  )}
                </div>
              )}
            </section>
          ))}

          {/* Conclusion */}
          <section className="bg-pink-100 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Conclusion
            </h3>
            <p className="text-gray-700">
              {blog.content.conclusion}
            </p>
          </section>
        </article>

        {/* Related Posts */}
        <RelatedPostsSection blog={blog} />
      </main>
    </div>
  );
}

// Component: RelatedPostsSection
function RelatedPostsSection({ blog }: { blog: BlogPost }) {
  const relatedPosts = getPostsByCategory(blog.category)
    .filter((post) => post.slug !== blog.slug)
    .slice(0, 2);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Related Articles
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blogs/${post.slug}`}
            className="group border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-blue-600">
                {post.category}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{post.author.name}</span>
              <span className="flex items-center gap-1 group-hover:text-blue-600">
                Read more
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}