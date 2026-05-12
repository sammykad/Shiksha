// components/websiteComp/blog/featured-blog-section.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { getFeaturedPosts } from '@/lib/website/blogs/blog-data';

export function FeaturedBlogSection() {
  // Always uses the first featured post (set featured: true in the post file)
  const featuredBlog = getFeaturedPosts()[0];
  if (!featuredBlog) return null;

  const formattedDate = new Date(featuredBlog.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className="relative mx-2 mb-4 sm:mx-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="font-medium text-black/40 text-xs uppercase tracking-wider dark:text-white/40">
            Featured
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Link
            href={`/blogs/${featuredBlog.slug}`}
            className="group block overflow-hidden rounded-2xl border border-black/10 bg-black/5 transition-all duration-300 hover:border-black/30 dark:border-white/5 dark:bg-zinc-900/50 dark:hover:border-white/30"
          >
            <div className="grid grid-cols-1 gap-8 p-6 sm:p-12 lg:grid-cols-2">
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-lg bg-red-500/10 px-3 py-1 text-red-500 text-xs tracking-tighter">
                    {featuredBlog.category}
                  </div>
                  <h2 className="font-medium text-3xl text-black tracking-tighter transition-colors sm:text-3xl md:text-4xl dark:text-white group-hover:text-red-500/85 dark:group-hover:text-red-500/85">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-base text-black/60 tracking-tighter sm:text-lg dark:text-white/60">
                    {featuredBlog.excerpt}
                  </p>
                </div>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-black/50 text-sm tracking-tighter dark:text-white/50">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{featuredBlog.readTime}</span>
                    </div>
                  </div>
                  <span className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap text-sm font-medium shadow-sm h-10 rounded-lg bg-black px-6 text-white tracking-tighter transition-all duration-300 hover:bg-black/90 sm:w-auto dark:bg-white dark:text-black dark:hover:bg-white/90 group/btn">
                    <span className="flex items-center gap-2">
                      Read Article
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </span>
                  </span>
                </div>
              </div>
              <div className="relative min-h-[300px] overflow-hidden rounded-xl">
                <Image
                  src={featuredBlog.coverImage.src}
                  alt={featuredBlog.coverImage.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}