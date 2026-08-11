import { defineCollection } from 'astro:content';

// Las páginas consumen estos Markdown mediante lib/legal.ts; Astro necesita la
// declaración explícita para no autogenerar la colección en cada build.
const legal = defineCollection({});

export const collections = { legal };
