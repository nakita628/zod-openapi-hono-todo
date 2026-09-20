import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const uniqueTitle = (prefix: string) =>
  `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const createTodo = async (page: Page, title: string) => {
  await page.getByPlaceholder('なにをする？').fill(title)
  await page.getByRole('button', { name: '追加' }).click()
  await expect(page.getByRole('link', { name: title })).toBeVisible()
}

test('Todo を作成して一覧に表示する', async ({ page }) => {
  await page.goto('/')
  await createTodo(page, uniqueTitle('買い物'))
})

test('空のタイトルは送信しない', async ({ page }) => {
  await page.goto('/')
  const input = page.getByPlaceholder('なにをする？')

  await page.getByRole('button', { name: '追加' }).click()

  await expect(input).toHaveJSProperty('validity.valid', false)
  await expect(page.getByRole('status')).toHaveCount(0)
})

test('詳細ページを開いてそこで完了状態を切り替える', async ({ page }) => {
  const title = uniqueTitle('詳細確認')
  await page.goto('/')
  await createTodo(page, title)

  await page.getByRole('link', { name: title }).click()

  await expect(page).toHaveURL(/\/todos\/[a-z0-9]+$/)
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await expect(page.getByText('未完了', { exact: true })).toBeVisible()
  await expect(page.getByText('作成日時', { exact: true })).toBeVisible()
  await expect(page.getByText('更新日時', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: '完了にする' }).click()
  await expect(page.getByText('完了', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '未完了にする' })).toBeVisible()

  await page.getByRole('link', { name: '一覧に戻る' }).click()
  await expect(page).toHaveURL('/')
})

test('一覧で Todo を完了にして削除する', async ({ page }) => {
  const title = uniqueTitle('掃除')
  await page.goto('/')
  await createTodo(page, title)

  const item = page.getByRole('listitem').filter({ hasText: title })
  await item.getByRole('checkbox').click()
  await expect(item.getByRole('checkbox')).toBeChecked()
  await expect(item.getByRole('link')).toHaveClass(/line-through/)

  await item.getByRole('button', { name: '削除' }).click()
  await expect(page.getByRole('link', { name: title })).toHaveCount(0)
})
