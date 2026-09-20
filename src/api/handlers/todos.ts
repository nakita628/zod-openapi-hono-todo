import type { RouteHandler } from '@hono/zod-openapi'
import { Effect, Match } from 'effect'

import type {
  deleteTodosTodoIdRoute,
  getTodosRoute,
  getTodosTodoIdRoute,
  patchTodosTodoIdRoute,
  postTodosRoute,
} from '@/api/routes'
import * as TodoUseCase from '@/api/usecases'

/**
 * `GET /todos` ハンドラ。Todo 一覧をまるごと返す。
 *
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: GET /todos
 *   H->>U: readTodos()
 *   U-->>H: Todo 一覧
 *   H-->>C: 200 Todos
 *   Note over H: 失敗時の Match.tag: ContractViolationError → 500 / DatabaseError → 503
 * ```
 */
export const getTodosRouteHandler: RouteHandler<typeof getTodosRoute> = (c) => {
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.readTodos(), {
      onSuccess: (value) => Effect.succeed(c.json(value, 200)),
      onFailure: (error) =>
        Match.value(error).pipe(
          Match.tag('ContractViolationError', (error) =>
            Effect.logError('契約違反', error.message).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/internal-server-error' as const,
                    title: 'サーバー内部エラー' as const,
                    status: 500 as const,
                    detail: '予期しないエラーが発生しました。',
                    instance: c.req.path,
                  },
                  500,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', error.cause).pipe(
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
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: GET /todos/{todoId}
 *   H->>U: readTodo(data)
 *   U-->>H: Todo
 *   H-->>C: 200 Todo
 *   Note over H: 失敗時の Match.tag: NotFoundError → 404 / ContractViolationError → 500 / DatabaseError → 503
 * ```
 */
export const getTodosTodoIdRouteHandler: RouteHandler<typeof getTodosTodoIdRoute> = (c) => {
  const data = c.req.valid('param')
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.readTodo(data), {
      onSuccess: (value) => Effect.succeed(c.json(value, 200)),
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
          Match.tag('ContractViolationError', (error) =>
            Effect.logError('契約違反', error.message).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/internal-server-error' as const,
                    title: 'サーバー内部エラー' as const,
                    status: 500 as const,
                    detail: '予期しないエラーが発生しました。',
                    instance: c.req.path,
                  },
                  500,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', error.cause).pipe(
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
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: POST /todos { title }
 *   H->>U: createTodo(data)
 *   U-->>H: 作成された Todo
 *   H-->>C: 201 Todo
 *   Note over H: 失敗時の Match.tag: ContractViolationError → 500 / DatabaseError → 503
 * ```
 */
export const postTodosRouteHandler: RouteHandler<typeof postTodosRoute> = (c) => {
  const data = c.req.valid('json')
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.createTodo(data), {
      onSuccess: (value) => Effect.succeed(c.json(value, 201)),
      onFailure: (error) =>
        Match.value(error).pipe(
          Match.tag('ContractViolationError', (error) =>
            Effect.logError('契約違反', error.message).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/internal-server-error' as const,
                    title: 'サーバー内部エラー' as const,
                    status: 500 as const,
                    detail: '予期しないエラーが発生しました。',
                    instance: c.req.path,
                  },
                  500,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', error.cause).pipe(
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
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: PATCH /todos/{todoId} { title?, completed? }
 *   H->>U: updateTodo(data)
 *   U-->>H: 更新された Todo
 *   H-->>C: 200 Todo
 *   Note over H: 失敗時の Match.tag: NotFoundError → 404 / ContractViolationError → 500 / DatabaseError → 503
 * ```
 */
export const patchTodosTodoIdRouteHandler: RouteHandler<typeof patchTodosTodoIdRoute> = (c) => {
  const data = { ...c.req.valid('param'), ...c.req.valid('json') }
  return Effect.runPromise(
    Effect.matchEffect(TodoUseCase.updateTodo(data), {
      onSuccess: (value) => Effect.succeed(c.json(value, 200)),
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
          Match.tag('ContractViolationError', (error) =>
            Effect.logError('契約違反', error.message).pipe(
              Effect.as(
                c.json(
                  {
                    type: '/problems/internal-server-error' as const,
                    title: 'サーバー内部エラー' as const,
                    status: 500 as const,
                    detail: '予期しないエラーが発生しました。',
                    instance: c.req.path,
                  },
                  500,
                  { 'Content-Type': 'application/problem+json' },
                ),
              ),
            ),
          ),
          Match.tag('DatabaseError', (error) =>
            Effect.logError('データベースエラー', error.cause).pipe(
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
 * ```mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant H as Handler
 *   participant U as UseCase
 *   C->>H: DELETE /todos/{todoId}
 *   H->>U: deleteTodo(data)
 *   U-->>H: void
 *   H-->>C: 204 No Content
 *   Note over H: 失敗時の Match.tag: NotFoundError → 404 / DatabaseError → 503
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
            Effect.logError('データベースエラー', error.cause).pipe(
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
