import { defineConfig } from 'hono-takibi'

export default defineConfig({
  input: 'main.tsp',
  output: 'src/api/routes/index.ts',
  basePath: '/api',
  pathAlias: '@/api/',
  readonly: true,
  format: {
    printWidth: 100,
    singleQuote: true,
    semi: false,
    sortImports: {},
  },
  template: {
    routeHandler: true,
  },
  client: {
    output: 'src/lib/client.ts',
  },
  'tanstack-query': {
    output: 'src/hooks/index.ts',
  },
  exportSchemas: true,
  docs: {
    output: 'api.md',
    curl: true,
    baseUrl: 'http://localhost:8787',
  },
})
