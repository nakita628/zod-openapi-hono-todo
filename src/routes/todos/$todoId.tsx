import { createFileRoute, Link } from '@tanstack/react-router'

import { TodoDetail } from '@/features/todos/components/TodoDetail'
import { getTodosTodoIdQueryOptions } from '@/hooks'

export const Route = createFileRoute('/todos/$todoId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      getTodosTodoIdQueryOptions({ param: { todoId: params.todoId } }),
    ),
  pendingComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-16 text-center text-slate-400">読み込み中…</div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-lg font-semibold text-slate-700">Todo が見つかりません</p>
      <p className="mt-2 text-sm text-slate-400">
        削除されたか、URL が間違っている可能性があります
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        ← 一覧に戻る
      </Link>
    </div>
  ),
  component: RouteComponent,
})

function RouteComponent() {
  const { todoId } = Route.useParams()
  return <TodoDetail todoId={todoId} />
}
