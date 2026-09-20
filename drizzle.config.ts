import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import * as z from 'zod'

const EnvSchema = z
  .object({
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1).meta({
      description: 'Cloudflare アカウント ID（ダッシュボードの URL に含まれる 32 桁の hex）。',
      example: '0123456789abcdef0123456789abcdef',
    }),

    CLOUDFLARE_DATABASE_ID: z.string().min(1).meta({
      description: '対象 D1 データベースの UUID。`wrangler d1 list` で確認できる。',
      example: '00000000-0000-0000-0000-000000000000',
    }),

    CLOUDFLARE_API_TOKEN: z.string().min(1).meta({
      description: 'D1 の編集権限を持つ API トークン。',
      example: 'v1.0-abcdef0123456789abcdef0123456789abcdef01',
    }),
  })
  .meta({
    title: 'drizzle-kit environment',
    description: 'リモート D1 を操作する drizzle-kit の d1-http ドライバが必要とする資格情報。',
  })

const result = EnvSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(`環境変数が不正です: ${result.error.message}`)
}

const env = result.data

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: env.CLOUDFLARE_DATABASE_ID,
    token: env.CLOUDFLARE_API_TOKEN,
  },
})
