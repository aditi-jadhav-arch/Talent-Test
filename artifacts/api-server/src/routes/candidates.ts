import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, candidatesTable } from "@workspace/db";
import {
  CreateCandidateBody,
  GetCandidateParams,
  DeleteCandidateParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/candidates", async (_req, res): Promise<void> => {
  const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.createdAt);
  res.json(candidates.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(candidatesTable).where(eq(candidatesTable.email, parsed.data.email));
  if (existing.length > 0) {
    res.status(201).json({ ...existing[0], createdAt: existing[0].createdAt.toISOString() });
    return;
  }

  const [candidate] = await db
    .insert(candidatesTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      department: parsed.data.department ?? null,
    })
    .returning();

  res.status(201).json({ ...candidate, createdAt: candidate.createdAt.toISOString() });
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db
    .select()
    .from(candidatesTable)
    .where(eq(candidatesTable.id, params.data.id));

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.json({ ...candidate, createdAt: candidate.createdAt.toISOString() });
});

router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const params = DeleteCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db
    .delete(candidatesTable)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
