import { CreateTodoForm } from '@/features/todos/components/CreateTodoForm'
import { TodoItem } from '@/features/todos/components/TodoItem'
import { useSuspenseTodos } from '@/hooks'

export function TodoApp() {
  const { data: todos } = useSuspenseTodos()
  const remaining = todos.filter((todo) => !todo.completed).length
  const done = todos.length - remaining

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Todo</h1>
        <p className="mt-1 text-sm text-slate-500">ひとつずつ、片付けていく。</p>
      </header>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
        <CreateTodoForm />

        {todos.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-4xl" aria-hidden="true">
              ✨
            </p>
            <p className="mt-3 font-medium text-slate-500">まだ Todo がありません</p>
            <p className="mt-1 text-sm text-slate-400">
              上のフォームから最初の 1 件を追加してください
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-slate-100">
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </ul>

            <footer className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-500">
              <span>
                残り {remaining} 件 / 全 {todos.length} 件
              </span>
              <div
                className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(done / todos.length) * 100}%` }}
                />
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}
