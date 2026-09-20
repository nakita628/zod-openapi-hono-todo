import { createFileRoute } from '@tanstack/react-router'

import { TodoApp } from '@/features/todos/components/TodoApp'
import { getTodosQueryOptions } from '@/hooks'

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(getTodosQueryOptions()),
  pendingComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-16 text-center text-slate-400">読み込み中…</div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-16 text-center text-rose-500">
      読み込みに失敗しました
    </div>
  ),
  component: TodoApp,
})
