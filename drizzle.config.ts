import { defineConfig } from 'drizzle-kit'

/**
 * drizzle-kit はマイグレーション SQL の生成（`pnpm generate`）だけを担う。
 * 適用は cf が行う（`cf d1 migrations apply <id>`。cf の既定のディレクトリ `migrations/` に出力する）。
 * - ローカル: `pnpm local:migrate`
 * - リモート: `pnpm remote:migrate`
 */
export default defineConfig({
  out: './migrations',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
})
