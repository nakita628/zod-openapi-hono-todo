import { Data } from 'effect'

export class DatabaseError extends Data.TaggedError('DatabaseError')<{
  readonly cause: unknown
}> {}

export class ContractViolationError extends Data.TaggedError('ContractViolationError')<{
  readonly message: string
}> {}

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly message: string
}> {}
