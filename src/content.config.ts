import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.{json,yaml,yml}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.string(),
    url: z.url(),
    tags: z.array(z.string()).default([]),
  }),
});

const life = defineCollection({
  loader: glob({ base: './src/content/life', pattern: '**/*.{json,yaml,yml}' }),
  schema: z.object({
    date: z.coerce.date(),
    text: z.string(),
    location: z.string().optional(),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string().default(''),
    })).default([]),
  }),
});

export const collections = { blog, docs, life };