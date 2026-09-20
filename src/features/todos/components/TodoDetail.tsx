import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import {
  getTodosKey,
  useDeleteTodosTodoId,
  usePatchTodosTodoId,
  useSuspenseTodosTodoId,
} from '@/hooks'

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' })

export function TodoDetail({ todoId }: { todoId: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const invalidate = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getTodosKey() }),
  }
  const { data: todo } = useSuspenseTodosTodoId({ param: { todoId } })
  const patch = usePatchTodosTodoId({ mutation: invalidate })
  const del = useDeleteTodosTodoId({ mutation: invalidate })

  const toggle = () =>
    patch.mutate(
      { param: { todoId: todo.id }, json: { completed: !todo.completed } },
      { onError: () => toast.error('更新に失敗しました') },
    )

  const remove = () =>
    del.mutate(
      { param: { todoId: todo.id } },
      {
        onSuccess: () => void navigate({ to: '/' }),
        onError: () => toast.error('削除に失敗しました'),
      },
    )

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        ← 一覧に戻る
      </Link>

      <article className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h1
            className={`text-2xl font-bold tracking-tight break-words ${
              todo.completed ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {todo.title}
          </h1>
          <span
            className={`mt-1 inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
              todo.completed
                ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20'
                : 'bg-amber-50 text-amber-600 ring-amber-500/20'
            }`}
          >
            {todo.completed ? '完了' : '未完了'}
          </span>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">作成日時</dt>
            <dd className="mt-1 font-medium text-slate-700">{formatDateTime(todo.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">更新日時</dt>
            <dd className="mt-1 font-medium text-slate-700">{formatDateTime(todo.updatedAt)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-400">ID</dt>
            <dd className="mt-1 font-mono text-xs text-slate-500">{todo.id}</dd>
          </div>
        </dl>

        <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-6">
          <Button onClick={toggle} disabled={patch.isPending}>
            {todo.completed ? '未完了にする' : '完了にする'}
          </Button>
          <Button variant="danger" onClick={remove} disabled={del.isPending}>
            削除
          </Button>
        </div>
      </article>
    </main>
  )
}
