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
 */
export function readTodos() {
  return Effect.tryPromise({
    try: () => db.select().from(todos).orderBy(desc(todos.createdAt), desc(todos.id)).all(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}

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
 */
export function readTodo(id: string) {
  return Effect.tryPromise({
    try: () => db.select().from(todos).where(eq(todos.id, id)).get(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}

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
 */
export function createTodo(values: { title: string }) {
  return Effect.tryPromise({
    try: () => db.insert(todos).values(values).returning().get(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}

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
 */
export function updateTodo(id: string, values: { title?: string; completed?: boolean }) {
  return Effect.tryPromise({
    try: () =>
      db
        .update(todos)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(todos.id, id))
        .returning()
        .get(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}

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
 */
export function deleteTodo(id: string) {
  return Effect.tryPromise({
    try: () => db.delete(todos).where(eq(todos.id, id)).returning({ id: todos.id }).get(),
    catch: (cause) => new DatabaseError({ cause }),
  })
}
