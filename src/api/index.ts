import { OpenAPIHono } from '@hono/zod-openapi'
import { Cause, Effect } from 'effect'

import {
  deleteTodosTodoIdRouteHandler,
  getTodosRouteHandler,
  getTodosTodoIdRouteHandler,
  patchTodosTodoIdRouteHandler,
  postTodosRouteHandler,
} from '@/api/handlers'
import {
  deleteTodosTodoIdRoute,
  getTodosRoute,
  getTodosTodoIdRoute,
  patchTodosTodoIdRoute,
  postTodosRoute,
} from '@/api/routes'

export const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          type: '/problems/validation-failed',
          title: '検証に失敗しました',
          status: 422,
          detail:
            'リクエストの検証に失敗しました。問題のあったフィールドは `errors` を参照してください。',
          instance: c.req.path,
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        422,
        { 'Content-Type': 'application/problem+json' },
      )
    }
  },
}).basePath('/api')

app.onError((err, c) => {
  Effect.runSync(Effect.logError('想定外のエラー', Cause.die(err)))
  return c.json(
    {
      type: '/problems/internal-server-error',
      title: 'サーバー内部エラー',
      status: 500,
      detail: '予期しないエラーが発生しました。',
      instance: c.req.path,
    },
    500,
    { 'Content-Type': 'application/problem+json' },
  )
})

export const api = app
  .openapi(getTodosRoute, getTodosRouteHandler)
  .openapi(postTodosRoute, postTodosRouteHandler)
  .openapi(getTodosTodoIdRoute, getTodosTodoIdRouteHandler)
  .openapi(patchTodosTodoIdRoute, patchTodosTodoIdRouteHandler)
  .openapi(deleteTodosTodoIdRoute, deleteTodosTodoIdRouteHandler)
