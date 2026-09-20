import { createRoute, z } from '@hono/zod-openapi'

export const TodoIdSchema = z
  .cuid2({ error: 'Todo ID の形式が不正です' })
  .brand<'TodoId'>()
  .openapi({
    description:
      'Todo ID（サーバーが発行する cuid2、英数字 24 文字）。パスパラメータの取り違えを防ぐため brand する。',
  })
  .openapi('TodoId')

export type TodoId = z.infer<typeof TodoIdSchema>

export const TodoSchema = z
  .object({
    id: TodoIdSchema.openapi({ description: 'Todo ID' }),
    title: z.string().openapi({ description: 'タイトル（やること）' }),
    completed: z.boolean().openapi({ description: '完了フラグ' }),
    createdAt: z
      .date()
      .transform((date) => date.toISOString())
      .openapi({ description: '作成日時（ISO 8601）' }),
    updatedAt: z
      .date()
      .transform((date) => date.toISOString())
      .openapi({ description: '最終更新日時（ISO 8601）' }),
  })
  .openapi({
    required: ['id', 'title', 'completed', 'createdAt', 'updatedAt'],
    description: 'Todo（ワイヤ表現）。',
    example: {
      id: 'kx9a2b3c4d5e6f7g8h9i0j1k',
      title: '牛乳を買う',
      completed: false,
      createdAt: '2026-07-18T00:00:00.000Z',
      updatedAt: '2026-07-18T00:00:00.000Z',
    },
  })
  .openapi('Todo')

export type Todo = z.infer<typeof TodoSchema>

export const TodoListSchema = z
  .array(TodoSchema)
  .openapi({ description: 'Todo 一覧（新しい順）' })
  .openapi('TodoList')

export type TodoList = z.infer<typeof TodoListSchema>

export const InternalServerProblemSchema = z
  .object({
    type: z
      .literal('/problems/internal-server-error')
      .openapi({
        description: 'problem type 識別子（相対 URI 参照。API のベース URI から解決される）',
      }),
    title: z
      .literal('サーバー内部エラー')
      .openapi({ description: 'problem type の短い人間可読なまとめ' }),
    status: z
      .literal(500)
      .openapi({ description: 'HTTP ステータスコード。RFC 9457 に従いボディにも再掲する' }),
    detail: z.string().openapi({ description: 'この発生事象に固有の人間可読な説明' }),
    instance: z
      .string()
      .openapi({ description: 'この発生事象を識別する URI 参照（リクエストパス）' }),
  })
  .openapi({
    required: ['type', 'title', 'status', 'detail', 'instance'],
    description: '契約違反やその他の想定外のサーバー障害を表す RFC 9457 Problem Details。',
    example: {
      type: '/problems/internal-server-error',
      title: 'サーバー内部エラー',
      status: 500,
      detail: '予期しないエラーが発生しました。',
      instance: '/api/todos',
    },
  })
  .openapi('InternalServerProblem')

export type InternalServerProblem = z.infer<typeof InternalServerProblemSchema>

export const ServiceUnavailableProblemSchema = z
  .object({
    type: z
      .literal('/problems/service-unavailable')
      .openapi({
        description: 'problem type 識別子（相対 URI 参照。API のベース URI から解決される）',
      }),
    title: z
      .literal('サービス利用不可')
      .openapi({ description: 'problem type の短い人間可読なまとめ' }),
    status: z
      .literal(503)
      .openapi({ description: 'HTTP ステータスコード。RFC 9457 に従いボディにも再掲する' }),
    detail: z.string().openapi({ description: 'この発生事象に固有の人間可読な説明' }),
    instance: z
      .string()
      .openapi({ description: 'この発生事象を識別する URI 参照（リクエストパス）' }),
  })
  .openapi({
    required: ['type', 'title', 'status', 'detail', 'instance'],
    description: 'DB へ到達できないなど、一時的な下流障害を表す RFC 9457 Problem Details。',
    example: {
      type: '/problems/service-unavailable',
      title: 'サービス利用不可',
      status: 503,
      detail: 'サービスが一時的に利用できません。時間をおいて再試行してください。',
      instance: '/api/todos',
    },
  })
  .openapi('ServiceUnavailableProblem')

export type ServiceUnavailableProblem = z.infer<typeof ServiceUnavailableProblemSchema>

export const NotFoundProblemSchema = z
  .object({
    type: z
      .literal('/problems/not-found')
      .openapi({
        description: 'problem type 識別子（相対 URI 参照。API のベース URI から解決される）',
      }),
    title: z
      .literal('見つかりません')
      .openapi({ description: 'problem type の短い人間可読なまとめ' }),
    status: z
      .literal(404)
      .openapi({ description: 'HTTP ステータスコード。RFC 9457 に従いボディにも再掲する' }),
    detail: z.string().openapi({ description: 'この発生事象に固有の人間可読な説明' }),
    instance: z
      .string()
      .openapi({ description: 'この発生事象を識別する URI 参照（リクエストパス）' }),
  })
  .openapi({
    required: ['type', 'title', 'status', 'detail', 'instance'],
    description: '対象が存在しないときの RFC 9457 Problem Details。',
    example: {
      type: '/problems/not-found',
      title: '見つかりません',
      status: 404,
      detail: 'Todo が見つかりません',
      instance: '/api/todos/kx9a2b3c4d5e6f7g8h9i0j1k',
    },
  })
  .openapi('NotFoundProblem')

export type NotFoundProblem = z.infer<typeof NotFoundProblemSchema>

export const FieldErrorSchema = z
  .object({
    field: z.string().openapi({ description: 'エラーが発生したフィールドのドット区切りパス' }),
    message: z.string().openapi({ description: 'エラーメッセージ' }),
  })
  .openapi({
    required: ['field', 'message'],
    description: '検証に失敗したフィールド 1 件。',
    example: { field: 'title', message: 'タイトルは必須です' },
  })
  .openapi('FieldError')

export type FieldError = z.infer<typeof FieldErrorSchema>

export const ValidationProblemSchema = z
  .object({
    type: z
      .literal('/problems/validation-failed')
      .openapi({
        description: 'problem type 識別子（相対 URI 参照。API のベース URI から解決される）',
      }),
    title: z
      .literal('検証に失敗しました')
      .openapi({ description: 'problem type の短い人間可読なまとめ' }),
    status: z
      .literal(422)
      .openapi({ description: 'HTTP ステータスコード。RFC 9457 に従いボディにも再掲する' }),
    detail: z.string().openapi({ description: 'この発生事象に固有の人間可読な説明' }),
    instance: z
      .string()
      .openapi({ description: 'この発生事象を識別する URI 参照（リクエストパス）' }),
    errors: z
      .array(FieldErrorSchema)
      .openapi({ description: '拡張メンバー: 検証に失敗したフィールドごとに 1 件' }),
  })
  .openapi({
    required: ['type', 'title', 'status', 'detail', 'instance', 'errors'],
    description:
      'リクエストの検証に失敗したときの RFC 9457 Problem Details。\n`errors` は拡張メンバー — RFC 9457 §3.2 が problem type 独自のメンバー追加を認めている。',
    example: {
      type: '/problems/validation-failed',
      title: '検証に失敗しました',
      status: 422,
      detail:
        'リクエストの検証に失敗しました。問題のあったフィールドは `errors` を参照してください。',
      instance: '/api/todos',
      errors: [{ field: 'title', message: 'タイトルは必須です' }],
    },
  })
  .openapi('ValidationProblem')

export type ValidationProblem = z.infer<typeof ValidationProblemSchema>

export const CreateTodoRequestSchema = z
  .object({
    title: z
      .string({ error: 'タイトルは文字列で指定してください' })
      .trim()
      .min(1, { error: 'タイトルは必須です' })
      .max(200, { error: 'タイトルは 200 文字以内で入力してください' })
      .openapi({ description: 'タイトル（やること）' }),
  })
  .openapi({
    required: ['title'],
    description: 'Todo 作成リクエスト',
    example: { title: '牛乳を買う' },
  })
  .openapi('CreateTodoRequest')

export type CreateTodoRequest = z.infer<typeof CreateTodoRequestSchema>

export const UpdateTodoRequestSchema = z
  .object({
    title: z
      .string({ error: 'タイトルは文字列で指定してください' })
      .trim()
      .min(1, { error: 'タイトルは必須です' })
      .max(200, { error: 'タイトルは 200 文字以内で入力してください' })
      .exactOptional()
      .openapi({ description: 'タイトル（やること）' }),
    completed: z.boolean().exactOptional().openapi({ description: '完了フラグ' }),
  })
  .openapi({
    required: [],
    description: 'Todo 部分更新リクエスト（タイトル・完了フラグのいずれか、または両方）',
    example: { title: 'オーツミルクを買う', completed: true },
  })
  .openapi('UpdateTodoRequest')

export type UpdateTodoRequest = z.infer<typeof UpdateTodoRequestSchema>

export const getTodosRoute = createRoute({
  method: 'get',
  path: '/todos',
  tags: ['todos'],
  description: 'Todo を一覧する（新しい順）。',
  operationId: 'readTodos',
  responses: {
    200: {
      description: 'The request has succeeded.',
      content: { 'application/json': { schema: TodoListSchema } },
    },
    500: {
      description: '500 Internal Server Error（`application/problem+json`）',
      content: { 'application/problem+json': { schema: InternalServerProblemSchema } },
    },
    503: {
      description: '503 Service Unavailable（`application/problem+json`）',
      content: { 'application/problem+json': { schema: ServiceUnavailableProblemSchema } },
    },
  },
})

export const postTodosRoute = createRoute({
  method: 'post',
  path: '/todos',
  tags: ['todos'],
  description: 'Todo を作成する。',
  operationId: 'createTodo',
  request: {
    body: { content: { 'application/json': { schema: CreateTodoRequestSchema } }, required: true },
  },
  responses: {
    201: {
      description: 'The request has succeeded and a new resource has been created as a result.',
      content: { 'application/json': { schema: TodoSchema } },
    },
    422: {
      description:
        '422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す',
      content: { 'application/problem+json': { schema: ValidationProblemSchema } },
    },
    500: {
      description: '500 Internal Server Error（`application/problem+json`）',
      content: { 'application/problem+json': { schema: InternalServerProblemSchema } },
    },
    503: {
      description: '503 Service Unavailable（`application/problem+json`）',
      content: { 'application/problem+json': { schema: ServiceUnavailableProblemSchema } },
    },
  },
})

export const getTodosTodoIdRoute = createRoute({
  method: 'get',
  path: '/todos/{todoId}',
  tags: ['todos'],
  description: 'Todo を 1 件取得する。存在しなければ 404。',
  operationId: 'readTodo',
  request: {
    params: z.object({
      todoId: TodoIdSchema.openapi({
        param: {
          name: 'todoId',
          in: 'path',
          required: true,
          schema: { $ref: '#/components/schemas/todoId' },
        },
      }),
    }),
  },
  responses: {
    200: {
      description: 'The request has succeeded.',
      content: { 'application/json': { schema: TodoSchema } },
    },
    404: {
      description: '404 Not Found（`application/problem+json`）',
      content: { 'application/problem+json': { schema: NotFoundProblemSchema } },
    },
    422: {
      description:
        '422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す',
      content: { 'application/problem+json': { schema: ValidationProblemSchema } },
    },
    500: {
      description: '500 Internal Server Error（`application/problem+json`）',
      content: { 'application/problem+json': { schema: InternalServerProblemSchema } },
    },
    503: {
      description: '503 Service Unavailable（`application/problem+json`）',
      content: { 'application/problem+json': { schema: ServiceUnavailableProblemSchema } },
    },
  },
})

export const deleteTodosTodoIdRoute = createRoute({
  method: 'delete',
  path: '/todos/{todoId}',
  tags: ['todos'],
  description: 'Todo を削除する。存在しなければ 404。',
  operationId: 'deleteTodo',
  request: {
    params: z.object({
      todoId: TodoIdSchema.openapi({
        param: {
          name: 'todoId',
          in: 'path',
          required: true,
          schema: { $ref: '#/components/schemas/todoId' },
        },
      }),
    }),
  },
  responses: {
    204: {
      description: 'There is no content to send for this request, but the headers may be useful. ',
    },
    404: {
      description: '404 Not Found（`application/problem+json`）',
      content: { 'application/problem+json': { schema: NotFoundProblemSchema } },
    },
    422: {
      description:
        '422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す',
      content: { 'application/problem+json': { schema: ValidationProblemSchema } },
    },
    500: {
      description: '500 Internal Server Error（`application/problem+json`）',
      content: { 'application/problem+json': { schema: InternalServerProblemSchema } },
    },
    503: {
      description: '503 Service Unavailable（`application/problem+json`）',
      content: { 'application/problem+json': { schema: ServiceUnavailableProblemSchema } },
    },
  },
})

export const patchTodosTodoIdRoute = createRoute({
  method: 'patch',
  path: '/todos/{todoId}',
  tags: ['todos'],
  description: 'Todo を部分更新する（タイトル / 完了フラグ）。存在しなければ 404。',
  operationId: 'updateTodo',
  request: {
    params: z.object({
      todoId: TodoIdSchema.openapi({
        param: {
          name: 'todoId',
          in: 'path',
          required: true,
          schema: { $ref: '#/components/schemas/todoId' },
        },
      }),
    }),
    body: { content: { 'application/json': { schema: UpdateTodoRequestSchema } }, required: true },
  },
  responses: {
    200: {
      description: 'The request has succeeded.',
      content: { 'application/json': { schema: TodoSchema } },
    },
    404: {
      description: '404 Not Found（`application/problem+json`）',
      content: { 'application/problem+json': { schema: NotFoundProblemSchema } },
    },
    422: {
      description:
        '422 Unprocessable Content（`application/problem+json`）。OpenAPIHono の defaultHook が返す',
      content: { 'application/problem+json': { schema: ValidationProblemSchema } },
    },
    500: {
      description: '500 Internal Server Error（`application/problem+json`）',
      content: { 'application/problem+json': { schema: InternalServerProblemSchema } },
    },
    503: {
      description: '503 Service Unavailable（`application/problem+json`）',
      content: { 'application/problem+json': { schema: ServiceUnavailableProblemSchema } },
    },
  },
})
