import { pgTable, serial, varchar, integer, unique, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// 1. Definimos Users Primeiro
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 2. Definimos Accounts Depois (Referenciando Users)
export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    // A mágica: aqui 'users' já existe, então o erro some
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    password: text('password'), // Nullable (para Google/Auth social)
  },
  (t) => [unique().on(t.provider, t.providerAccountId)],
)

// 3. Definimos as Relações no final
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))
