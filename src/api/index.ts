import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'

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
          type: '/problems/validation-failed' as const,
          title: '検証に失敗しました' as const,
          status: 422 as const,
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
  return c.json(
    {
      type: '/problems/internal-server-error' as const,
      title: 'サーバー内部エラー' as const,
      status: 500 as const,
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

if (import.meta.env.DEV) {
  api.doc('/doc', {
    info: {
      title: 'Todo API',
      version: '1.0.0',
    },
    openapi: '3.1.0',
  })

  app.get('/ui', swaggerUI({ url: '/api/doc' }))

  app.get('/scalar', Scalar({ url: '/api/doc' }))

  const content = app.getOpenAPI31Document({
    openapi: '3.1.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
    },
  })

  app.get('/llms.txt', async (c) => {
    const { createMarkdownFromOpenApi } = await import('@scalar/openapi-to-markdown')
    return c.text(await createMarkdownFromOpenApi(JSON.stringify(content)))
  })
}
