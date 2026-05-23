import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { quizzesTable } from "./quizzes";
import { candidatesTable } from "./candidates";

export const attemptsTable = pgTable("attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id, { onDelete: "cascade" }),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  score: integer("score"),
  passed: boolean("passed"),
});

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({ id: true, startedAt: true });
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;
