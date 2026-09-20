import { z } from '@hono/zod-openapi'
import { Effect } from 'effect'

import { ContractViolationError, NotFoundError } from '@/api/errors'
import { TodoListSchema, TodoSchema } from '@/api/routes'
import * as TodoService from '@/api/services'

/**
 * コレクションエンドポイント向けに Todo を全件返す。入力なし。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant U as readTodos
 *   participant S as TodoService (D1)
 *   U->>S: readTodos()
 *   S-->>U: rows (Date timestamps)
 *   Note over U: TodoListSchema.safeParse(...) が Date → ISO へ変換;<br/>不一致なら ContractViolationError で失敗（→ 500）
 * ```
 *
 * @returns レスポンス検証済みの Todo 一覧。スキーマの日付コーデックが各 `createdAt` /
 *   `updatedAt` の `Date` をワイヤ上の ISO 8601 文字列へ変換する。
 */
export function readTodos() {
  return Effect.gen(function* () {
    const todoList = yield* TodoService.readTodos()
    const result = TodoListSchema.safeParse(todoList)
    if (!result.success) {
      return yield* Effect.fail(new ContractViolationError({ message: result.error.message }))
    }
    return result.data
  })
}

const ReadTodoInput = z
  .object({
    todoId: z.string().brand<'TodoId'>().meta({
      description: 'Todo ID（サーバーが発行する cuid2、英数字 24 文字）。',
      example: 'tz4a98xxat96iws9zmbrgj3a',
    }),
  })
  .meta({
    description: 'Todo を 1 件取得するための入力',
    example: { todoId: 'tz4a98xxat96iws9zmbrgj3a' },
  })

/**
 * id を指定して Todo を 1 件取得する。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant U as readTodo
 *   participant S as TodoService (D1)
 *   U->>S: readTodo(todoId)
 *   S-->>U: value | undefined
 *   alt 見つからない
 *     U-->>U: NotFoundError で失敗（→ 404）
 *   else 見つかった
 *     Note over U: TodoSchema.safeParse(...) が Date → ISO へ変換;<br/>不一致なら ContractViolationError で失敗（→ 500）
 *   end
 * ```
 *
 * @param input - パスパラメータ
 * @param input.todoId - Todo の id（brand 付き `TodoId`）
 * @returns レスポンス検証済みの Todo。
 * @throws NotFoundError - その id の Todo が無いとき（→ 404）。
 */
export function readTodo(input: z.infer<typeof ReadTodoInput>) {
  return Effect.gen(function* () {
    const todo = yield* TodoService.readTodo({ todoId: input.todoId })
    if (todo === undefined) {
      return yield* Effect.fail(new NotFoundError({ message: 'Todo が見つかりません' }))
    }
    const result = TodoSchema.safeParse(todo)
    if (!result.success) {
      return yield* Effect.fail(new ContractViolationError({ message: result.error.message }))
    }
    return result.data
  })
}

const CreateTodoInput = z
  .object({
    title: z
      .string()
      .meta({ description: '一覧とリンクに表示される見出し。', example: '牛乳を買う' }),
  })
  .meta({ description: 'Todo を作成するための入力', example: { title: '牛乳を買う' } })

/**
 * Todo を作成する。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant U as createTodo
 *   participant S as TodoService (D1)
 *   U->>S: createTodo({ title })
 *   S-->>U: created row (INSERT ... RETURNING *)
 *   Note over U: TodoSchema.safeParse(...) が Date → ISO へ変換;<br/>不一致なら ContractViolationError で失敗（→ 500）
 * ```
 *
 * @param input - リクエストボディ
 * @param input.title - タイトル（やること）
 * @returns レスポンス検証済みの、作成された Todo。
 */
export function createTodo(input: z.infer<typeof CreateTodoInput>) {
  return Effect.gen(function* () {
    const todo = yield* TodoService.createTodo({ title: input.title })
    const result = TodoSchema.safeParse(todo)
    if (!result.success) {
      return yield* Effect.fail(new ContractViolationError({ message: result.error.message }))
    }
    return result.data
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
  .meta({
    description: 'Todo を部分更新するための入力 — ボディに存在するフィールドだけが変わる',
    example: { todoId: 'tz4a98xxat96iws9zmbrgj3a', completed: true },
  })

/**
 * Todo を部分更新する。ボディに存在するフィールドだけが変わる。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant U as updateTodo
 *   participant S as TodoService (D1)
 *   Note over U: { todoId, ...values } に分割 — values が更新ペイロード
 *   U->>S: updateTodo({ todoId, ...values })
 *   S-->>U: updated row | undefined (UPDATE ... RETURNING *)
 *   alt 見つからない
 *     U-->>U: NotFoundError で失敗（→ 404）
 *   else 更新した
 *     Note over U: TodoSchema.safeParse(...) が Date → ISO へ変換;<br/>不一致なら ContractViolationError で失敗（→ 500）
 *   end
 * ```
 *
 * @param input - パスパラメータ + 部分ボディ
 * @param input.todoId - Todo の id（brand 付き `TodoId`）
 * @param input.title - 変更する場合の新しいタイトル
 * @param input.completed - 変更する場合の新しい完了フラグ
 * @returns レスポンス検証済みの更新後 Todo。
 * @throws NotFoundError - その id の Todo が無いとき（→ 404）。
 */
export function updateTodo(input: z.infer<typeof UpdateTodoInput>) {
  return Effect.gen(function* () {
    const { todoId, ...values } = input

    const todo = yield* TodoService.updateTodo({ todoId, ...values })
    if (todo === undefined) {
      return yield* Effect.fail(new NotFoundError({ message: 'Todo が見つかりません' }))
    }
    const result = TodoSchema.safeParse(todo)
    if (!result.success) {
      return yield* Effect.fail(new ContractViolationError({ message: result.error.message }))
    }
    return result.data
  })
}

const DeleteTodoInput = z
  .object({
    todoId: z.string().brand<'TodoId'>().meta({
      description: 'Todo ID（サーバーが発行する cuid2、英数字 24 文字）。',
      example: 'tz4a98xxat96iws9zmbrgj3a',
    }),
  })
  .meta({
    description: 'Todo を削除するための入力',
    example: { todoId: 'tz4a98xxat96iws9zmbrgj3a' },
  })

/**
 * Todo を削除する。ボディは返さない — ハンドラが成功を 204 に対応づける。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant U as deleteTodo
 *   participant S as TodoService (D1)
 *   U->>S: deleteTodo(todoId)
 *   S-->>U: { id } | undefined (DELETE ... RETURNING id)
 *   alt 見つからない
 *     U-->>U: NotFoundError で失敗（→ 404）
 *   else 削除した
 *     U-->>U: void
 *   end
 * ```
 *
 * @param input - パスパラメータ
 * @param input.todoId - Todo の id（brand 付き `TodoId`）
 * @throws NotFoundError - その id の Todo が無いとき（→ 404）。
 */
export function deleteTodo(input: z.infer<typeof DeleteTodoInput>) {
  return Effect.gen(function* () {
    const deleted = yield* TodoService.deleteTodo({ todoId: input.todoId })
    if (deleted === undefined) {
      return yield* Effect.fail(new NotFoundError({ message: 'Todo が見つかりません' }))
    }
  })
}
