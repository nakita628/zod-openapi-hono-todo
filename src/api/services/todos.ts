import { z } from '@hono/zod-openapi'
import { desc, eq } from 'drizzle-orm'
import { Effect } from 'effect'

import { DatabaseError } from '@/api/errors'
import { db } from '@/api/infra'
import { todos } from '@/db'

/**
 * Todo を新しい順に全件取得する（テーブルは `todos` 1 つだけ）。
 *
 * ```mermaid
 * erDiagram
 *   todos {
 *     string id PK "Todo ID（サーバー発行の cuid2）"
 *     string title "タイトル（やること）"
 *     boolean completed "完了フラグ"
 *     datetime createdAt "作成日時"
 *     datetime updatedAt "最終更新日時"
 *   }
 * ```
 *
 * 発行される SQL（並び順は `idx_todos_createdAt` インデックスが担う。`createdAt` の
 * ミリ秒が同じ行があっても `id` のタイブレークで順序が安定する）:
 *
 * ```sql
 * SELECT id, title, completed, createdAt, updatedAt
 * FROM todos
 * ORDER BY createdAt DESC, id DESC
 * ```
 *
 * @returns Todo の全行。`createdAt` / `updatedAt` は `Date` にデコードされる（timestamp_ms モード）。
 */
export function readTodos() {
  return Effect.tryPromise({
    try: () => db.select().from(todos).orderBy(desc(todos.createdAt), desc(todos.id)).all(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}

const ReadTodoInput = z
  .object({
    todoId: z.string().brand<'TodoId'>().meta({
      description: 'Todo ID（サーバーが発行する cuid2、英数字 24 文字）。',
      example: 'tz4a98xxat96iws9zmbrgj3a',
    }),
  })
  .readonly()
  .meta({
    description: 'Todo を 1 件取得するための入力',
    example: { todoId: 'tz4a98xxat96iws9zmbrgj3a' },
  })

/**
 * 主キーを指定して Todo を 1 件取得する。
 *
 * ```mermaid
 * erDiagram
 *   todos {
 *     string id PK "Todo ID（サーバー発行の cuid2）"
 *     string title "タイトル（やること）"
 *     boolean completed "完了フラグ"
 *     datetime createdAt "作成日時"
 *     datetime updatedAt "最終更新日時"
 *   }
 * ```
 *
 * 発行される SQL（`.get()` は先頭の行、結果が空なら `undefined` を返す）:
 *
 * ```sql
 * SELECT id, title, completed, createdAt, updatedAt
 * FROM todos
 * WHERE id = ?
 * LIMIT 1
 * ```
 *
 * @param input - todoId: Todo の主キー（サーバー発行の cuid2）
 * @returns 該当する Todo の行。該当なしなら `undefined`。
 */
export function readTodo(input: z.infer<typeof ReadTodoInput>) {
  return Effect.tryPromise({
    try: () => db.select().from(todos).where(eq(todos.id, input.todoId)).get(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}

const CreateTodoInput = z
  .object({
    title: z
      .string()
      .meta({ description: '一覧とリンクに表示される見出し。', example: '牛乳を買う' }),
  })
  .readonly()
  .meta({ description: 'Todo を作成するための入力', example: { title: '牛乳を買う' } })

/**
 * Todo を 1 件挿入し、作成された行を返す。
 *
 * ```mermaid
 * erDiagram
 *   todos {
 *     string id PK "Todo ID（サーバー発行の cuid2）"
 *     string title "タイトル（やること）"
 *     boolean completed "完了フラグ"
 *     datetime createdAt "作成日時"
 *     datetime updatedAt "最終更新日時"
 *   }
 * ```
 *
 * 発行される SQL（`id` は JS 側の `$defaultFn(cuid2)` が生成して `?` にバインドされ、
 * `completed` の JS リテラル既定値 `false` も `?` にバインドされる。`createdAt` /
 * `updatedAt` は DB 側の既定式から来る）:
 *
 * ```sql
 * INSERT INTO todos (id, title, completed, createdAt, updatedAt)
 * VALUES (?, ?, ?, (unixepoch() * 1000), (unixepoch() * 1000))
 * RETURNING *
 * ```
 *
 * @param input - title: タイトル（やること）
 * @returns 挿入された Todo の行（`RETURNING *`）。`createdAt` / `updatedAt` は `Date`。
 */
export function createTodo(input: z.infer<typeof CreateTodoInput>) {
  return Effect.tryPromise({
    try: () => db.insert(todos).values({ title: input.title }).returning().get(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}

const UpdateTodoInput = z
  .object({
    todoId: z.string().brand<'TodoId'>().meta({
      description: 'Todo ID（サーバーが発行する cuid2、英数字 24 文字）。',
      example: 'tz4a98xxat96iws9zmbrgj3a',
    }),
    title: z
      .string()
      .exactOptional()
      .meta({ description: '一覧とリンクに表示される見出し。', example: '牛乳を買う' }),
    completed: z.boolean().exactOptional().meta({ description: '完了フラグ。', example: true }),
  })
  .readonly()
  .meta({
    description: 'Todo を部分更新するための入力 — 存在するフィールドだけが変わる',
    example: { todoId: 'tz4a98xxat96iws9zmbrgj3a', completed: true },
  })

/**
 * Todo を部分更新し、更新後の行を返す。
 *
 * ```mermaid
 * erDiagram
 *   todos {
 *     string id PK "Todo ID（サーバー発行の cuid2）"
 *     string title "タイトル（やること）"
 *     boolean completed "完了フラグ"
 *     datetime createdAt "作成日時"
 *     datetime updatedAt "最終更新日時"
 *   }
 * ```
 *
 * 発行される SQL（SET 句に載るのは `values` に存在するキーと、常に JS の `Date` を `?` に
 * バインドして更新する `updatedAt` だけ。これを必ず更新することで、drizzle が要求する
 * 「SET 句が空でない」も満たす）:
 *
 * ```sql
 * UPDATE todos
 * SET title = ?, completed = ?, updatedAt = ?
 * WHERE id = ?
 * RETURNING *
 * ```
 *
 * @param input - todoId と変更するフィールド。省略したキーはそのまま残る
 * @returns 更新後の Todo の行。該当なしなら `undefined`。
 */
export function updateTodo(input: z.infer<typeof UpdateTodoInput>) {
  return Effect.tryPromise({
    try: () => {
      const { todoId, ...values } = input
      return db
        .update(todos)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(todos.id, todoId))
        .returning()
        .get()
    },
    catch: (cause) => new DatabaseError({ cause }),
  })
}

const DeleteTodoInput = z
  .object({
    todoId: z.string().brand<'TodoId'>().meta({
      description: 'Todo ID（サーバーが発行する cuid2、英数字 24 文字）。',
      example: 'tz4a98xxat96iws9zmbrgj3a',
    }),
  })
  .readonly()
  .meta({
    description: 'Todo を削除するための入力',
    example: { todoId: 'tz4a98xxat96iws9zmbrgj3a' },
  })

/**
 * Todo を 1 件削除し、その id を返す。
 *
 * ```mermaid
 * erDiagram
 *   todos {
 *     string id PK "Todo ID（サーバー発行の cuid2）"
 *     string title "タイトル（やること）"
 *     boolean completed "完了フラグ"
 *     datetime createdAt "作成日時"
 *     datetime updatedAt "最終更新日時"
 *   }
 * ```
 *
 * 発行される SQL（`RETURNING id` により、実際に削除したのか空振りかを呼び出し元が判別できる）:
 *
 * ```sql
 * DELETE FROM todos
 * WHERE id = ?
 * RETURNING id
 * ```
 *
 * @param input - todoId: Todo の主キー（サーバー発行の cuid2）
 * @returns 削除した行の `{ id }`。該当なしなら `undefined`。
 */
export function deleteTodo(input: z.infer<typeof DeleteTodoInput>) {
  return Effect.tryPromise({
    try: () => db.delete(todos).where(eq(todos.id, input.todoId)).returning({ id: todos.id }).get(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}
