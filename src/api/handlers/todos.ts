import type { RouteHandler } from '@hono/zod-openapi'
import { Cause, Effect, Match } from 'effect'

import type {
  deleteTodosTodoIdRoute,
  getTodosRoute,
  getTodosTodoIdRoute,
  patchTodosTodoIdRoute,
  postTodosRoute,
} from '@/api/routes'
import { TodoListSchema, TodoSchema } from '@/api/routes'
import * as TodoUseCase from '@/api/usecases'

/**
 * `GET /todos` ハンドラ。Todo 一覧を新しい順にまるごと返す。
 *
 * エラーの対応: DatabaseError → 503。エラーは RFC 9457 の problem document（`application/problem+json`）で返す。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: GET /todos
 *   H->>U: readTodos()
 *   alt 成功
 *     U-->>H: rows
 *     H-->>C: 200 TodoList
 *   else D1 の障害
 *     U-->>H: DatabaseError
 *     Note over H: cause の連鎖ごとログに出す
 *     H-->>C: 503 Service Unavailable
 *   end
 *   Note over H: 成功時は TodoListSchema.parse でレスポンスを検証する（Date → ISO）。<br/>契約とずれていれば例外になり、app.onError が 500 を返す
 * ```
 */
export const getTodosRouteHandler: RouteHandler<typeof getTodosRoute> = (c) => {
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.readTodos(), {
      onSuccess: (value) => Effect.succeed(c.json(TodoListSchema.parse(value), 200)),
      onFailure: (error) =>
        Match.value(error).pipe(
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', Cause.fail(error)).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/service-unavailable' as const,
                    title: 'サービス利用不可' as const,
                    status: 503 as const,
                    detail: 'サービスが一時的に利用できません。時間をおいて再試行してください。',
                    instance: c.req.path,
                  },
                  503,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.exhaustive,
        ),
    }),
  )
}

/**
 * `GET /todos/{todoId}` ハンドラ。先にパスパラメータを検証して Todo を 1 件返す。
 *
 * エラーの対応: NotFoundError → 404 / DatabaseError → 503。エラーは RFC 9457 の problem document（`application/problem+json`）で返す。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: GET /todos/{todoId}
 *   H->>U: readTodo({ todoId })
 *   alt 成功
 *     U-->>H: row
 *     H-->>C: 200 Todo
 *   else Todo が無い
 *     U-->>H: NotFoundError
 *     H-->>C: 404 Not Found
 *   else D1 の障害
 *     U-->>H: DatabaseError
 *     Note over H: cause の連鎖ごとログに出す
 *     H-->>C: 503 Service Unavailable
 *   end
 *   Note over H: 成功時は TodoSchema.parse でレスポンスを検証する（Date → ISO）。<br/>契約とずれていれば例外になり、app.onError が 500 を返す
 * ```
 */
export const getTodosTodoIdRouteHandler: RouteHandler<typeof getTodosTodoIdRoute> = (c) => {
  const data = c.req.valid('param')
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.readTodo(data), {
      onSuccess: (value) => Effect.succeed(c.json(TodoSchema.parse(value), 200)),
      onFailure: (error) =>
        Match.value(error).pipe(
          Match.tag('NotFoundError', (error) =>
            Effect.succeed(
              c.json(
                {
                  type: '/problems/not-found' as const,
                  title: '見つかりません' as const,
                  status: 404 as const,
                  detail: error.message,
                  instance: c.req.path,
                },
                404,
                { 'Content-Type': 'application/problem+json' },
              ),
            ),
          ),
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', Cause.fail(error)).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/service-unavailable' as const,
                    title: 'サービス利用不可' as const,
                    status: 503 as const,
                    detail: 'サービスが一時的に利用できません。時間をおいて再試行してください。',
                    instance: c.req.path,
                  },
                  503,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.exhaustive,
        ),
    }),
  )
}

/**
 * `POST /todos` ハンドラ。検証済みの JSON ボディから Todo を作成する。
 *
 * エラーの対応: DatabaseError → 503。エラーは RFC 9457 の problem document（`application/problem+json`）で返す。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: POST /todos { title }
 *   H->>U: createTodo({ title })
 *   alt 成功
 *     U-->>H: 作成された row
 *     H-->>C: 201 Todo
 *   else D1 の障害
 *     U-->>H: DatabaseError
 *     Note over H: cause の連鎖ごとログに出す
 *     H-->>C: 503 Service Unavailable
 *   end
 *   Note over H: 成功時は TodoSchema.parse でレスポンスを検証する（Date → ISO）。<br/>契約とずれていれば例外になり、app.onError が 500 を返す
 * ```
 */
export const postTodosRouteHandler: RouteHandler<typeof postTodosRoute> = (c) => {
  const data = c.req.valid('json')
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.createTodo(data), {
      onSuccess: (value) => Effect.succeed(c.json(TodoSchema.parse(value), 201)),
      onFailure: (error) =>
        Match.value(error).pipe(
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', Cause.fail(error)).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/service-unavailable' as const,
                    title: 'サービス利用不可' as const,
                    status: 503 as const,
                    detail: 'サービスが一時的に利用できません。時間をおいて再試行してください。',
                    instance: c.req.path,
                  },
                  503,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.exhaustive,
        ),
    }),
  )
}

/**
 * `PATCH /todos/{todoId}` ハンドラ。パスパラメータと部分 JSON ボディを合わせて
 * 更新を適用する。
 *
 * エラーの対応: NotFoundError → 404 / DatabaseError → 503。エラーは RFC 9457 の problem document（`application/problem+json`）で返す。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: PATCH /todos/{todoId} { title?, completed? }
 *   H->>U: updateTodo({ todoId, title?, completed? })
 *   alt 成功
 *     U-->>H: 更新された row
 *     H-->>C: 200 Todo
 *   else Todo が無い
 *     U-->>H: NotFoundError
 *     H-->>C: 404 Not Found
 *   else D1 の障害
 *     U-->>H: DatabaseError
 *     Note over H: cause の連鎖ごとログに出す
 *     H-->>C: 503 Service Unavailable
 *   end
 *   Note over H: 成功時は TodoSchema.parse でレスポンスを検証する（Date → ISO）。<br/>契約とずれていれば例外になり、app.onError が 500 を返す
 * ```
 */
export const patchTodosTodoIdRouteHandler: RouteHandler<typeof patchTodosTodoIdRoute> = (c) => {
  const data = { ...c.req.valid('param'), ...c.req.valid('json') }
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.updateTodo(data), {
      onSuccess: (value) => Effect.succeed(c.json(TodoSchema.parse(value), 200)),
      onFailure: (error) =>
        Match.value(error).pipe(
          Match.tag('NotFoundError', (error) =>
            Effect.succeed(
              c.json(
                {
                  type: '/problems/not-found' as const,
                  title: '見つかりません' as const,
                  status: 404 as const,
                  detail: error.message,
                  instance: c.req.path,
                },
                404,
                { 'Content-Type': 'application/problem+json' },
              ),
            ),
          ),
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', Cause.fail(error)).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/service-unavailable' as const,
                    title: 'サービス利用不可' as const,
                    status: 503 as const,
                    detail: 'サービスが一時的に利用できません。時間をおいて再試行してください。',
                    instance: c.req.path,
                  },
                  503,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.exhaustive,
        ),
    }),
  )
}

/**
 * `DELETE /todos/{todoId}` ハンドラ。Todo を 1 件削除し、ボディ無しの 204 を返す。
 *
 * エラーの対応: NotFoundError → 404 / DatabaseError → 503。エラーは RFC 9457 の problem document（`application/problem+json`）で返す。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: DELETE /todos/{todoId}
 *   H->>U: deleteTodo({ todoId })
 *   alt 成功
 *     U-->>H: 完了
 *     H-->>C: 204 No Content
 *   else Todo が無い
 *     U-->>H: NotFoundError
 *     H-->>C: 404 Not Found
 *   else D1 の障害
 *     U-->>H: DatabaseError
 *     Note over H: cause の連鎖ごとログに出す
 *     H-->>C: 503 Service Unavailable
 *   end
 * ```
 */
export const deleteTodosTodoIdRouteHandler: RouteHandler<typeof deleteTodosTodoIdRoute> = (c) => {
  const data = c.req.valid('param')
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.deleteTodo(data), {
      onSuccess: () => Effect.succeed(c.body(null, 204)),
      onFailure: (error) =>
        Match.value(error).pipe(
          Match.tag('NotFoundError', (error) =>
            Effect.succeed(
              c.json(
                {
                  type: '/problems/not-found',
                  title: '見つかりません',
                  status: 404,
                  detail: error.message,
                  instance: c.req.path,
                },
                404,
                { 'Content-Type': 'application/problem+json' },
              ),
            ),
          ),
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', Cause.fail(error)).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/service-unavailable',
                    title: 'サービス利用不可',
                    status: 503,
                    detail: 'サービスが一時的に利用できません。時間をおいて再試行してください。',
                    instance: c.req.path,
                  },
                  503,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.exhaustive,
        ),
    }),
  )
}
