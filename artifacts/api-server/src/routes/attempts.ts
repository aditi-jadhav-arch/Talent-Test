import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, attemptsTable, quizzesTable, candidatesTable, questionsTable, answersTable } from "@workspace/db";
import {
  ListAttemptsQueryParams,
  StartAttemptBody,
  GetAttemptParams,
  SubmitAttemptParams,
  SubmitAttemptBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/attempts", async (req, res): Promise<void> => {
  const params = ListAttemptsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      attempt: attemptsTable,
      quizTitle: quizzesTable.title,
      candidateName: candidatesTable.name,
    })
    .from(attemptsTable)
    .innerJoin(quizzesTable, eq(attemptsTable.quizId, quizzesTable.id))
    .innerJoin(candidatesTable, eq(attemptsTable.candidateId, candidatesTable.id))
    .orderBy(sql`${attemptsTable.startedAt} DESC`);

  let results = rows.map((r) => ({
    ...r.attempt,
    quizTitle: r.quizTitle,
    candidateName: r.candidateName,
    startedAt: r.attempt.startedAt.toISOString(),
    completedAt: r.attempt.completedAt?.toISOString() ?? null,
  }));

  if (params.data.quizId) {
    results = results.filter((r) => r.quizId === params.data.quizId);
  }
  if (params.data.candidateId) {
    results = results.filter((r) => r.candidateId === params.data.candidateId);
  }
  if (params.data.status) {
    results = results.filter((r) => r.status === params.data.status);
  }

  res.json(results);
});

router.post("/attempts", async (req, res): Promise<void> => {
  const parsed = StartAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, parsed.data.quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, parsed.data.candidateId));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const [attempt] = await db
    .insert(attemptsTable)
    .values({ quizId: parsed.data.quizId, candidateId: parsed.data.candidateId, status: "in_progress" })
    .returning();

  res.status(201).json({
    ...attempt,
    quizTitle: quiz.title,
    candidateName: candidate.name,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: null,
  });
});

router.get("/attempts/:id", async (req, res): Promise<void> => {
  const params = GetAttemptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      attempt: attemptsTable,
      quiz: quizzesTable,
      candidate: candidatesTable,
    })
    .from(attemptsTable)
    .innerJoin(quizzesTable, eq(attemptsTable.quizId, quizzesTable.id))
    .innerJoin(candidatesTable, eq(attemptsTable.candidateId, candidatesTable.id))
    .where(eq(attemptsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  const answers = await db
    .select()
    .from(answersTable)
    .where(eq(answersTable.attemptId, params.data.id));

  const [questionCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(questionsTable)
    .where(eq(questionsTable.quizId, row.quiz.id));

  res.json({
    ...row.attempt,
    startedAt: row.attempt.startedAt.toISOString(),
    completedAt: row.attempt.completedAt?.toISOString() ?? null,
    quiz: { ...row.quiz, questionCount: questionCountRow?.count ?? 0, createdAt: row.quiz.createdAt.toISOString() },
    candidate: { ...row.candidate, createdAt: row.candidate.createdAt.toISOString() },
    answers,
  });
});

router.post("/attempts/:id/submit", async (req, res): Promise<void> => {
  const params = SubmitAttemptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SubmitAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [attempt] = await db.select().from(attemptsTable).where(eq(attemptsTable.id, params.data.id));
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, attempt.quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.quizId, attempt.quizId));

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let totalPoints = 0;
  let earnedPoints = 0;
  const answerRecords = [];

  for (const question of questions) {
    totalPoints += question.points;
    const submitted = parsed.data.answers.find((a) => a.questionId === question.id);
    const givenAnswer = submitted?.givenAnswer ?? null;
    let isCorrect = false;

    if (givenAnswer !== null) {
      isCorrect = givenAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    }

    const pointsAwarded = isCorrect ? question.points : 0;
    earnedPoints += pointsAwarded;
    answerRecords.push({
      attemptId: attempt.id,
      questionId: question.id,
      givenAnswer,
      isCorrect,
      pointsAwarded,
    });
  }

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercent >= quiz.passingScore;
  const correctCount = answerRecords.filter((a) => a.isCorrect).length;

  await db.insert(answersTable).values(answerRecords);

  const [updatedAttempt] = await db
    .update(attemptsTable)
    .set({ status: "completed", completedAt: new Date(), score: scorePercent, passed })
    .where(eq(attemptsTable.id, attempt.id))
    .returning();

  res.json({
    id: updatedAttempt.id,
    score: scorePercent,
    totalPoints,
    passed,
    correctCount,
    totalQuestions: questions.length,
  });
});

export default router;
