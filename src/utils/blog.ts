import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function sortPosts(posts: BlogPost[]) {
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function uniqueValues(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

export function sameTag(left: string, right: string) {
  return left.toLowerCase() === right.toLowerCase();
}