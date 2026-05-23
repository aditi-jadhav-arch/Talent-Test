import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { attemptsTable } from "./attempts";
import { questionsTable } from "./questions";

export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull().references(() => attemptsTable.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  givenAnswer: text("given_answer"),
  isCorrect: boolean("is_correct"),
  pointsAwarded: integer("points_awarded").notNull().default(0),
});

export const insertAnswerSchema = createInsertSchema(answersTable).omit({ id: true });
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answersTable.$inferSelect;
