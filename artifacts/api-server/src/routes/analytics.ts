import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, attemptsTable, quizzesTable, candidatesTable } from "@workspace/db";
import { GetQuizPerformanceParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (_req, res): Promise<void> => {
  const [quizStats] = await db
    .select({
      totalQuizzes: sql<number>`count(*)::int`,
      activeQuizzes: sql<number>`count(*) filter (where status = 'active')::int`,
    })
    .from(quizzesTable);

  const [candidateStats] = await db
    .select({ totalCandidates: sql<number>`count(*)::int` })
    .from(candidatesTable);

  const [attemptStats] = await db
    .select({
      totalAttempts: sql<number>`count(*)::int`,
      completedAttempts: sql<number>`count(*) filter (where status = 'completed')::int`,
      passedAttempts: sql<number>`count(*) filter (where passed = true)::int`,
    })
    .from(attemptsTable);

  const recentActivity = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attemptsTable)
    .where(sql`started_at > now() - interval '7 days'`);

  const completedAttempts = attemptStats?.completedAttempts ?? 0;
  const passedAttempts = attemptStats?.passedAttempts ?? 0;
  const passRate = completedAttempts > 0 ? Math.round((passedAttempts / completedAttempts) * 100) : 0;

  res.json({
    totalQuizzes: quizStats?.totalQuizzes ?? 0,
    activeQuizzes: quizStats?.activeQuizzes ?? 0,
    totalCandidates: candidateStats?.totalCandidates ?? 0,
    totalAttempts: attemptStats?.totalAttempts ?? 0,
    completedAttempts,
    passRate,
    recentActivity: recentActivity[0]?.count ?? 0,
  });
});

router.get("/analytics/quizzes/:quizId/performance", async (req, res): Promise<void> => {
  const params = GetQuizPerformanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const [stats] = await db
    .select({
      totalAttempts: sql<number>`count(*)::int`,
      completedAttempts: sql<number>`count(*) filter (where status = 'completed')::int`,
      averageScore: sql<number>`coalesce(avg(score) filter (where status = 'completed'), 0)::float`,
      passedAttempts: sql<number>`count(*) filter (where passed = true)::int`,
      highestScore: sql<number>`coalesce(max(score) filter (where status = 'completed'), 0)::int`,
      lowestScore: sql<number>`coalesce(min(score) filter (where status = 'completed'), 0)::int`,
    })
    .from(attemptsTable)
    .where(eq(attemptsTable.quizId, params.data.quizId));

  const completedAttempts = stats?.completedAttempts ?? 0;
  const passedAttempts = stats?.passedAttempts ?? 0;
  const passRate = completedAttempts > 0 ? Math.round((passedAttempts / completedAttempts) * 100) : 0;

  res.json({
    quizId: quiz.id,
    quizTitle: quiz.title,
    totalAttempts: stats?.totalAttempts ?? 0,
    completedAttempts,
    averageScore: Math.round((stats?.averageScore ?? 0) * 10) / 10,
    passRate,
    highestScore: stats?.highestScore ?? 0,
    lowestScore: stats?.lowestScore ?? 0,
  });
});

router.get("/analytics/recent-attempts", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: attemptsTable.id,
      candidateName: candidatesTable.name,
      quizTitle: quizzesTable.title,
      score: attemptsTable.score,
      passed: attemptsTable.passed,
      status: attemptsTable.status,
      completedAt: attemptsTable.completedAt,
    })
    .from(attemptsTable)
    .innerJoin(quizzesTable, eq(attemptsTable.quizId, quizzesTable.id))
    .innerJoin(candidatesTable, eq(attemptsTable.candidateId, candidatesTable.id))
    .orderBy(sql`${attemptsTable.startedAt} DESC`)
    .limit(10);

  res.json(
    rows.map((r) => ({
      ...r,
      completedAt: r.completedAt?.toISOString() ?? null,
    }))
  );
});

export default router;
