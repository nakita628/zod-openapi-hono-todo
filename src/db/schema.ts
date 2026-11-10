import { customType, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createId } from '@paralleldrive/cuid2'

const utcDateTime = customType<{ data: Date; driverData: string | number }>({
  dataType: () => 'datetime',
  toDriver: (value) => value.toISOString().replace('Z', '+00:00'),
  fromDriver: (value) => {
    if (typeof value === 'number' || /^-?\d+$/u.test(value)) return new Date(Number(value))
    const iso = value.replace(' ', 'T').replace(/ (?=[+-]\d\d:?\d\d$)/u, '')
    return new Date(/T[\d:.]+$/u.test(iso) ? `${iso}Z` : iso)
  },
})

const utcNow = (() => {
  let now: Date | undefined
  return () => {
    if (now === undefined) {
      now = new Date()
      queueMicrotask(() => {
        now = undefined
      })
    }
    return now
  }
})()

export const todos = sqliteTable(
  'todos',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    createdAt: utcDateTime('createdAt').notNull().$defaultFn(utcNow),
    updatedAt: utcDateTime('updatedAt').notNull().$onUpdate(utcNow),
  },
  (table) => [index('todos_createdAt_idx').on(table.createdAt)],
)
