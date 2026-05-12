/**
 * BLOG DATA SYSTEM — Next.js compatible
 * ======================================
 * To add a blog post:
 *   1. Create  lib/website/posts/your-slug.ts
 *   2. Add it to  lib/website/posts/index.ts
 * Never touch this file.
 */

import blogPosts from './posts/index';
export type { BlogPost } from './blog-types';

export function getAllPosts() {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getFeaturedPosts() {
  return blogPosts.filter((post) => post.featured);
}

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string) {
  return blogPosts.filter((post) => post.category === category);
}

export function getPostsByTag(tag: string) {
  return blogPosts.filter((post) => post.tags.includes(tag));
}

export function getAllCategories() {
  return [...new Set(blogPosts.map((post) => post.category))];
}

export function getAllTags() {
  return [...new Set(blogPosts.flatMap((post) => post.tags))];
}