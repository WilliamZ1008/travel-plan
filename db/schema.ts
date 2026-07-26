import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tripState = sqliteTable("trip_state", {
  id: text("id").primaryKey(),
  version: integer("version").notNull().default(1),
  data: text("data").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
