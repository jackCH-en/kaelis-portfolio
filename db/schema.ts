import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const nowEntries = sqliteTable(
  "now_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    category: text("category").notNull().default("CURRENT PRACTICE"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("now_entries_date_idx").on(table.date, table.id)],
);

export const nowAttachments = sqliteTable(
  "now_attachments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entryId: integer("entry_id").notNull(),
    objectKey: text("object_key").notNull().unique(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("now_attachments_entry_idx").on(table.entryId, table.id)],
);
