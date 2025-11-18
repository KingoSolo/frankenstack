import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

// This is like a blueprint for the "adapters" table
export const adapters = pgTable('adapters', {
  // Auto-generated unique ID
  id: uuid('id').primaryKey().defaultRandom(),
  
  // User who created this adapter
  userId: varchar('user_id', { length: 255 }).notNull(),
  
  // Which protocols are being connected
  sourceProtocol: varchar('source_protocol', { length: 50 }).notNull(),
  targetProtocol: varchar('target_protocol', { length: 50 }).notNull(),
  
  // The generated adapter code
  code: text('code').notNull(),
  
  // Configuration used to generate it (stored as JSON)
  config: jsonb('config').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type from the schema
export type Adapter = typeof adapters.$inferSelect;
export type NewAdapter = typeof adapters.$inferInsert;