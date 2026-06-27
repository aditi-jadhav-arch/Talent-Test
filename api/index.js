import app from "../artifacts/api-server/dist/app.mjs";
import { db, adminsTable, candidatesTable } from "@workspace/db";

app.get("/api/debug-db", async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
    
    const admins = await db.select().from(adminsTable);
    const candidates = await db.select().from(candidatesTable);
    
    res.json({
      dbUrl: maskedUrl,
      adminCount: admins.length,
      candidateCount: candidates.length,
      admins: admins.map(a => ({ id: a.id, username: a.username })),
      candidates: candidates.map(c => ({ id: c.id, name: c.name, email: c.email }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
