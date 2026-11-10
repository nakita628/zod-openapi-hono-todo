import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:8787' },
  webServer: {
    command: 'pnpm generate && pnpm local:migrate && pnpm dev',
    url: 'http://localhost:8787',
    reuseExistingServer: true,
  },
})
