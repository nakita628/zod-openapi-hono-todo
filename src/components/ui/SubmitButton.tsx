import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/Button'

export function SubmitButton({
  children,
  pendingText,
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <Button {...props} type="submit" disabled={pending}>
      {pending ? (pendingText ?? children) : children}
    </Button>
  )
}
