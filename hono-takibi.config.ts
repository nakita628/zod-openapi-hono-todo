import { defineConfig } from 'hono-takibi'

export default defineConfig({
  input: 'main.tsp',
  output: 'src/api/routes/index.ts',
  basePath: '/api',
  format: {
    printWidth: 100,
    singleQuote: true,
    semi: false,
    sortImports: {},
  },
  'tanstack-query': {
    output: 'src/hooks/index.ts',
    import: '@/lib',
  },
  template: {
    pathAlias: '@/api',
    routeHandler: true,
  },
  exportSchemas: true,
  docs: {
    output: 'api.md',
    curl: true,
    baseUrl: 'http://localhost:8787',
  },
})
