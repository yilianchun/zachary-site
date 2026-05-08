import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { sortPosts } from '../utils/blog';
import { entrySlug } from '../utils/content';

export async function GET(context: APIContext) {
  const posts = sortPosts(await getCollection('blog', ({ data }) => !data.draft));

  return rss({
    title: 'Zachary',
    description: 'Zachary 的博客更新。',
    site: context.site ?? 'https://993216.xyz',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/blog/${entrySlug(post.id)}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}