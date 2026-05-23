import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, quizzesTable, questionsTable } from "@workspace/db";
import {
  ListQuizzesQueryParams,
  CreateQuizBody,
  GetQuizParams,
  UpdateQuizParams,
  UpdateQuizBody,
  DeleteQuizParams,
  ListQuestionsParams,
  CreateQuestionParams,
  CreateQuestionBody,
  UpdateQuestionParams,
  UpdateQuestionBody,
  DeleteQuestionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/quizzes", async (req, res): Promise<void> => {
  const params = ListQuizzesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const quizRows = await db.select().from(quizzesTable).orderBy(quizzesTable.createdAt);

  const questionCounts = await db
    .select({ quizId: questionsTable.quizId, count: sql<number>`count(*)::int` })
    .from(questionsTable)
    .groupBy(questionsTable.quizId);

  const countMap = new Map(questionCounts.map((r) => [r.quizId, r.count]));

  let quizzes = quizRows.map((q) => ({
    ...q,
    questionCount: countMap.get(q.id) ?? 0,
    createdAt: q.createdAt.toISOString(),
  }));

  if (params.data.status) {
    quizzes = quizzes.filter((q) => q.status === params.data.status);
  }
  if (params.data.category) {
    quizzes = quizzes.filter((q) => q.category === params.data.category);
  }

  res.json(quizzes);
});

router.post("/quizzes", async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quiz] = await db
    .insert(quizzesTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      category: parsed.data.category,
      durationMinutes: parsed.data.durationMinutes,
      passingScore: parsed.data.passingScore,
      status: parsed.data.status ?? "draft",
    })
    .returning();

  res.status(201).json({ ...quiz, questionCount: 0, createdAt: quiz.createdAt.toISOString() });
});

router.get("/quizzes/:id", async (req, res): Promise<void> => {
  const params = GetQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.id));

  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questionsTable)
    .where(eq(questionsTable.quizId, quiz.id));

  res.json({ ...quiz, questionCount: countRow?.count ?? 0, createdAt: quiz.createdAt.toISOString() });
});

router.patch("/quizzes/:id", async (req, res): Promise<void> => {
  const params = UpdateQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quiz] = await db
    .update(quizzesTable)
    .set(parsed.data)
    .where(eq(quizzesTable.id, params.data.id))
    .returning();

  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questionsTable)
    .where(eq(questionsTable.quizId, quiz.id));

  res.json({ ...quiz, questionCount: countRow?.count ?? 0, createdAt: quiz.createdAt.toISOString() });
});

router.delete("/quizzes/:id", async (req, res): Promise<void> => {
  const params = DeleteQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [quiz] = await db.delete(quizzesTable).where(eq(quizzesTable.id, params.data.id)).returning();

  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/quizzes/:quizId/questions", async (req, res): Promise<void> => {
  const params = ListQuestionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.quizId, params.data.quizId))
    .orderBy(questionsTable.orderIndex);

  res.json(questions.map((q) => ({ ...q, options: q.options ?? null })));
});

router.post("/quizzes/:quizId/questions", async (req, res): Promise<void> => {
  const params = CreateQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existingQuestions = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questionsTable)
    .where(eq(questionsTable.quizId, params.data.quizId));

  const orderIndex = parsed.data.orderIndex ?? (existingQuestions[0]?.count ?? 0);

  const [question] = await db
    .insert(questionsTable)
    .values({
      quizId: params.data.quizId,
      text: parsed.data.text,
      type: parsed.data.type,
      points: parsed.data.points,
      orderIndex,
      options: parsed.data.options ?? null,
      correctAnswer: parsed.data.correctAnswer,
    })
    .returning();

  res.status(201).json({ ...question, options: question.options ?? null });
});

router.patch("/quizzes/:quizId/questions/:id", async (req, res): Promise<void> => {
  const params = UpdateQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.text !== undefined) updateData.text = parsed.data.text;
  if (parsed.data.type !== undefined) updateData.type = parsed.data.type;
  if (parsed.data.points !== undefined) updateData.points = parsed.data.points;
  if (parsed.data.orderIndex !== undefined) updateData.orderIndex = parsed.data.orderIndex;
  if (parsed.data.options !== undefined) updateData.options = parsed.data.options;
  if (parsed.data.correctAnswer !== undefined) updateData.correctAnswer = parsed.data.correctAnswer;

  const [question] = await db
    .update(questionsTable)
    .set(updateData)
    .where(eq(questionsTable.id, params.data.id))
    .returning();

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json({ ...question, options: question.options ?? null });
});

router.delete("/quizzes/:quizId/questions/:id", async (req, res): Promise<void> => {
  const params = DeleteQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [question] = await db
    .delete(questionsTable)
    .where(eq(questionsTable.id, params.data.id))
    .returning();

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
