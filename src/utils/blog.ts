import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function sortPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

export function taxonomySlug(value: string) {
  const normalized = value.trim().toLowerCase().normalize('NFKD');
  const slug = normalized
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s_/]+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || encodeURIComponent(value.trim());
}

export function sameTaxonomy(left: string, right: string) {
  return taxonomySlug(left) === taxonomySlug(right);
}