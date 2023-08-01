import { generateOpenApiDocument } from 'trpc-openapi';

import { appRouter } from "~/server/api/root";

/* 👇 */
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Chalge API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000',
});