import { bindings, defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'todo',
    compatibilityDate: '2026-06-18',
    compatibilityFlags: ['nodejs_compat'],
    entrypoint: 'src/index.ts',
    assets: {
      notFoundHandling: 'single-page-application',
    },
    env: {
      DB: bindings.d1({
        name: 'todo',
        id: '00000000000000000000000000000000',
      }),
    },
  },
})
