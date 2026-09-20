import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  queryOptions,
  mutationOptions,
} from '@tanstack/react-query'
import type {
  UseQueryOptions,
  UseSuspenseQueryOptions,
  UseMutationOptions,
  DefaultError,
  QueryClient,
} from '@tanstack/react-query'
import type { ClientRequestOptions, InferRequestType } from 'hono/client'
import { parseResponse } from 'hono/client'

import { client } from '@/lib'

export function getTodosKey() {
  return ['todos'] as const
}

export function getTodosQueryKey() {
  return ['todos', '/todos'] as const
}

export function getTodosQueryOptions<
  TData = Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$get>>>>>,
  TError = DefaultError,
>(options?: ClientRequestOptions) {
  return queryOptions<
    Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$get>>>>>,
    TError,
    TData,
    ReturnType<typeof getTodosQueryKey>
  >({
    queryKey: getTodosQueryKey(),
    queryFn({ signal }) {
      return parseResponse(
        client.todos.$get(undefined, { ...options, init: { ...options?.init, signal } }),
      )
    },
  })
}

export function useTodos<
  TData = Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$get>>>>>,
  TError = DefaultError,
>(
  options?: {
    query?: Omit<
      UseQueryOptions<
        Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$get>>>>>,
        TError,
        TData,
        ReturnType<typeof getTodosQueryKey>
      >,
      'queryKey' | 'queryFn'
    >
    options?: ClientRequestOptions
  },
  queryClient?: QueryClient,
) {
  const { query: queryOptions, options: clientOptions } = options ?? {}
  return useQuery(
    { ...getTodosQueryOptions<TData, TError>(clientOptions), ...queryOptions },
    queryClient,
  )
}

export function useSuspenseTodos<
  TData = Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$get>>>>>,
  TError = DefaultError,
>(
  options?: {
    query?: Omit<
      UseSuspenseQueryOptions<
        Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$get>>>>>,
        TError,
        TData,
        ReturnType<typeof getTodosQueryKey>
      >,
      'queryKey' | 'queryFn'
    >
    options?: ClientRequestOptions
  },
  queryClient?: QueryClient,
) {
  const { query: queryOptions, options: clientOptions } = options ?? {}
  return useSuspenseQuery(
    { ...getTodosQueryOptions<TData, TError>(clientOptions), ...queryOptions },
    queryClient,
  )
}

export function getPostTodosMutationKey() {
  return ['todos', '/todos', 'POST'] as const
}

export function getPostTodosMutationOptions<TError = DefaultError, TOnMutateResult = unknown>(
  options?: ClientRequestOptions,
) {
  return mutationOptions<
    Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$post>>>>>,
    TError,
    InferRequestType<typeof client.todos.$post>,
    TOnMutateResult
  >({
    mutationKey: getPostTodosMutationKey(),
    async mutationFn(args: InferRequestType<typeof client.todos.$post>) {
      return parseResponse(client.todos.$post(args, options))
    },
  })
}

export function usePostTodos<TError = DefaultError, TOnMutateResult = unknown>(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        Awaited<ReturnType<typeof parseResponse<Awaited<ReturnType<typeof client.todos.$post>>>>>,
        TError,
        InferRequestType<typeof client.todos.$post>,
        TOnMutateResult
      >,
      'mutationFn'
    >
    options?: ClientRequestOptions
  },
  queryClient?: QueryClient,
) {
  const { mutation: mutationOptions, options: clientOptions } = options ?? {}
  const mutationDefaults = getPostTodosMutationOptions<TError, TOnMutateResult>(clientOptions)
  return useMutation(
    {
      ...mutationOptions,
      ...mutationDefaults,
      mutationKey: mutationOptions?.mutationKey ?? mutationDefaults.mutationKey,
    },
    queryClient,
  )
}

export function getTodosTodoIdQueryKey(
  args: InferRequestType<(typeof client.todos)[':todoId']['$get']>,
) {
  return ['todos', '/todos/:todoId', args] as const
}

export function getTodosTodoIdQueryOptions<
  TData = Awaited<
    ReturnType<typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$get']>>>>
  >,
  TError = DefaultError,
>(
  args: InferRequestType<(typeof client.todos)[':todoId']['$get']>,
  options?: ClientRequestOptions,
) {
  return queryOptions<
    Awaited<
      ReturnType<
        typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$get']>>>
      >
    >,
    TError,
    TData,
    ReturnType<typeof getTodosTodoIdQueryKey>
  >({
    queryKey: getTodosTodoIdQueryKey(args),
    queryFn({ signal }) {
      return parseResponse(
        client.todos[':todoId'].$get(args, { ...options, init: { ...options?.init, signal } }),
      )
    },
  })
}

export function useTodosTodoId<
  TData = Awaited<
    ReturnType<typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$get']>>>>
  >,
  TError = DefaultError,
>(
  args: InferRequestType<(typeof client.todos)[':todoId']['$get']>,
  options?: {
    query?: Omit<
      UseQueryOptions<
        Awaited<
          ReturnType<
            typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$get']>>>
          >
        >,
        TError,
        TData,
        ReturnType<typeof getTodosTodoIdQueryKey>
      >,
      'queryKey' | 'queryFn'
    >
    options?: ClientRequestOptions
  },
  queryClient?: QueryClient,
) {
  const { query: queryOptions, options: clientOptions } = options ?? {}
  return useQuery(
    { ...getTodosTodoIdQueryOptions<TData, TError>(args, clientOptions), ...queryOptions },
    queryClient,
  )
}

export function useSuspenseTodosTodoId<
  TData = Awaited<
    ReturnType<typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$get']>>>>
  >,
  TError = DefaultError,
>(
  args: InferRequestType<(typeof client.todos)[':todoId']['$get']>,
  options?: {
    query?: Omit<
      UseSuspenseQueryOptions<
        Awaited<
          ReturnType<
            typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$get']>>>
          >
        >,
        TError,
        TData,
        ReturnType<typeof getTodosTodoIdQueryKey>
      >,
      'queryKey' | 'queryFn'
    >
    options?: ClientRequestOptions
  },
  queryClient?: QueryClient,
) {
  const { query: queryOptions, options: clientOptions } = options ?? {}
  return useSuspenseQuery(
    { ...getTodosTodoIdQueryOptions<TData, TError>(args, clientOptions), ...queryOptions },
    queryClient,
  )
}

export function getDeleteTodosTodoIdMutationKey() {
  return ['todos', '/todos/:todoId', 'DELETE'] as const
}

export function getDeleteTodosTodoIdMutationOptions<
  TError = DefaultError,
  TOnMutateResult = unknown,
>(options?: ClientRequestOptions) {
  return mutationOptions<
    | Awaited<
        ReturnType<
          typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$delete']>>>
        >
      >
    | undefined,
    TError,
    InferRequestType<(typeof client.todos)[':todoId']['$delete']>,
    TOnMutateResult
  >({
    mutationKey: getDeleteTodosTodoIdMutationKey(),
    async mutationFn(args: InferRequestType<(typeof client.todos)[':todoId']['$delete']>) {
      return parseResponse(client.todos[':todoId'].$delete(args, options))
    },
  })
}

export function useDeleteTodosTodoId<TError = DefaultError, TOnMutateResult = unknown>(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        | Awaited<
            ReturnType<
              typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$delete']>>>
            >
          >
        | undefined,
        TError,
        InferRequestType<(typeof client.todos)[':todoId']['$delete']>,
        TOnMutateResult
      >,
      'mutationFn'
    >
    options?: ClientRequestOptions
  },
  queryClient?: QueryClient,
) {
  const { mutation: mutationOptions, options: clientOptions } = options ?? {}
  const mutationDefaults = getDeleteTodosTodoIdMutationOptions<TError, TOnMutateResult>(
    clientOptions,
  )
  return useMutation(
    {
      ...mutationOptions,
      ...mutationDefaults,
      mutationKey: mutationOptions?.mutationKey ?? mutationDefaults.mutationKey,
    },
    queryClient,
  )
}

export function getPatchTodosTodoIdMutationKey() {
  return ['todos', '/todos/:todoId', 'PATCH'] as const
}

export function getPatchTodosTodoIdMutationOptions<
  TError = DefaultError,
  TOnMutateResult = unknown,
>(options?: ClientRequestOptions) {
  return mutationOptions<
    Awaited<
      ReturnType<
        typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$patch']>>>
      >
    >,
    TError,
    InferRequestType<(typeof client.todos)[':todoId']['$patch']>,
    TOnMutateResult
  >({
    mutationKey: getPatchTodosTodoIdMutationKey(),
    async mutationFn(args: InferRequestType<(typeof client.todos)[':todoId']['$patch']>) {
      return parseResponse(client.todos[':todoId'].$patch(args, options))
    },
  })
}

export function usePatchTodosTodoId<TError = DefaultError, TOnMutateResult = unknown>(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        Awaited<
          ReturnType<
            typeof parseResponse<Awaited<ReturnType<(typeof client.todos)[':todoId']['$patch']>>>
          >
        >,
        TError,
        InferRequestType<(typeof client.todos)[':todoId']['$patch']>,
        TOnMutateResult
      >,
      'mutationFn'
    >
    options?: ClientRequestOptions
  },
  queryClient?: QueryClient,
) {
  const { mutation: mutationOptions, options: clientOptions } = options ?? {}
  const mutationDefaults = getPatchTodosTodoIdMutationOptions<TError, TOnMutateResult>(
    clientOptions,
  )
  return useMutation(
    {
      ...mutationOptions,
      ...mutationDefaults,
      mutationKey: mutationOptions?.mutationKey ?? mutationDefaults.mutationKey,
    },
    queryClient,
  )
}
