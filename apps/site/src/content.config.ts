import { defineCollection } from 'astro:content';

// La prosa se resuelve con import.meta.glob en lib/docs.ts. Declarar la
// colección evita que Astro dependa de su autogeneración obsoleta al indexarla.
const docs = defineCollection({});

export const collections = { docs };
