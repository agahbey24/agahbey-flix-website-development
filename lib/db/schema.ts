import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// --- Better Auth tables (camelCase columns match Better Auth defaults) -------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  phone: text('phone'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const titles = pgTable('titles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  genre: text('genre').notNull(),
  releaseYear: integer('releaseYear').notNull(),
  type: text('type').notNull().default('movie'),
  posterUrl: text('posterUrl').notNull(),
  backdropUrl: text('backdropUrl'),
  trailerUrl: text('trailerUrl'),
  videoPathname: text('videoPathname'),
  durationMinutes: integer('durationMinutes'),
  rating: text('rating'),
  featured: boolean('featured').notNull().default(false),
  trending: boolean('trending').notNull().default(false),
  allowDownload: boolean('allowDownload').notNull().default(false),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const seasons = pgTable('seasons', {
  id: serial('id').primaryKey(),
  titleId: integer('titleId').notNull(),
  seasonNumber: integer('seasonNumber').notNull(),
  name: text('name'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const episodes = pgTable('episodes', {
  id: serial('id').primaryKey(),
  seasonId: integer('seasonId').notNull(),
  titleId: integer('titleId').notNull(),
  episodeNumber: integer('episodeNumber').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  videoPathname: text('videoPathname'),
  durationMinutes: integer('durationMinutes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// seasonId = 0 means the purchase covers a full movie.
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  titleId: integer('titleId').notNull(),
  seasonId: integer('seasonId').notNull().default(0),
  amount: integer('amount').notNull(),
  method: text('method').notNull(),
  reference: text('reference').notNull(),
  senderPhone: text('senderPhone').notNull(),
  senderName: text('senderName').notNull(),
  note: text('note'),
  status: text('status').notNull().default('pending'),
  adminNote: text('adminNote'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  reviewedAt: timestamp('reviewedAt'),
})

export const accessGrants = pgTable('access_grants', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  titleId: integer('titleId').notNull(),
  seasonId: integer('seasonId').notNull().default(0),
  paymentId: integer('paymentId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

export const accessLinks = pgTable('access_links', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type Title = typeof titles.$inferSelect
export type Season = typeof seasons.$inferSelect
export type Episode = typeof episodes.$inferSelect
export type Payment = typeof payments.$inferSelect
