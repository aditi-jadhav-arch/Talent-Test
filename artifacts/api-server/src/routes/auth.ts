import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, adminsTable, candidatesTable } from "@workspace/db";
import { AdminLoginBody, CandidateLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.username, parsed.data.username));

  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = admin.id;
  req.session.role = "admin";
  req.session.name = admin.username;

  await new Promise<void>((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve()))
  );

  res.json({ id: admin.id, name: admin.username, email: null, role: "admin" });
});

router.post("/auth/candidate/login", async (req, res): Promise<void> => {
  const parsed = CandidateLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db
    .select()
    .from(candidatesTable)
    .where(eq(candidatesTable.email, parsed.data.email));

  if (!candidate) {
    res.status(404).json({ error: "No candidate found with that email. Please contact your recruiter." });
    return;
  }

  req.session.userId = candidate.id;
  req.session.role = "candidate";
  req.session.name = candidate.name;
  req.session.email = candidate.email;

  await new Promise<void>((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve()))
  );

  res.json({ id: candidate.id, name: candidate.name, email: candidate.email, role: "candidate" });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res): void => {
  if (!req.session.userId || !req.session.role) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    id: req.session.userId,
    name: req.session.name ?? "",
    email: req.session.email ?? null,
    role: req.session.role,
  });
});

export default router;
