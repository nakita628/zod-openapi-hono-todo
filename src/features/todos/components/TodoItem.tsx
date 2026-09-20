import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import toast from 'react-hot-toast'

import type { Todo } from '@/api/routes'
import { Button } from '@/components/ui/Button'
import { getTodosKey, useDeleteTodosTodoId, usePatchTodosTodoId } from '@/hooks'

export function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient()
  const invalidate = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getTodosKey() }),
  }
  const patch = usePatchTodosTodoId({
    mutation: { ...invalidate, onError: () => toast.error('更新に失敗しました') },
  })
  const remove = useDeleteTodosTodoId({
    mutation: { ...invalidate, onError: () => toast.error('削除に失敗しました') },
  })

  return (
    <li className="flex items-center gap-3 py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() =>
          patch.mutate({ param: { todoId: todo.id }, json: { completed: !todo.completed } })
        }
        disabled={patch.isPending}
        aria-label={`「${todo.title}」を${todo.completed ? '未完了' : '完了'}にする`}
        className="size-5 shrink-0 cursor-pointer accent-indigo-600"
      />
      <Link
        to="/todos/$todoId"
        params={{ todoId: todo.id }}
        className={`min-w-0 flex-1 truncate transition-colors hover:text-indigo-600 ${
          todo.completed ? 'text-slate-400 line-through' : 'text-slate-800'
        }`}
      >
        {todo.title}
      </Link>
      <Button
        variant="danger"
        size="sm"
        onClick={() => remove.mutate({ param: { todoId: todo.id } })}
        disabled={remove.isPending}
      >
        削除
      </Button>
    </li>
  )
}
