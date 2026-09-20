import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:8787' },
  webServer: {
    command:
      'env CLOUDFLARE_ACCOUNT_ID=e2e CLOUDFLARE_DATABASE_ID=e2e CLOUDFLARE_API_TOKEN=e2e pnpm generate && pnpm local:migrate && pnpm dev',
    url: 'http://localhost:8787',
    reuseExistingServer: true,
  },
})
