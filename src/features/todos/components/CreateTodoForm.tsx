import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { SubmitButton } from '@/components/ui/SubmitButton'
import { getTodosKey, usePostTodos } from '@/hooks'

export function CreateTodoForm() {
  const queryClient = useQueryClient()
  const create = usePostTodos({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getTodosKey() }),
      onError: () => toast.error('追加に失敗しました'),
    },
  })

  const action = async (formData: FormData) => {
    const title = formData.get('title')
    if (typeof title !== 'string') return
    await create.mutateAsync({ json: { title } }).catch(() => undefined)
  }

  return (
    <form action={action} className="flex gap-2">
      <input
        name="title"
        type="text"
        required
        placeholder="なにをする？"
        maxLength={200}
        autoComplete="off"
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 transition-colors outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />
      <SubmitButton pendingText="追加中…">追加</SubmitButton>
    </form>
  )
}
