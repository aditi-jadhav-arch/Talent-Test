import { db, adminsTable, candidatesTable, pool } from "@workspace/db";

async function main() {
  console.log("Checking seeded accounts in database...");
  
  const admins = await db.select().from(adminsTable);
  console.log("Admins:", admins.map(a => ({ id: a.id, username: a.username })));

  const candidates = await db.select().from(candidatesTable);
  console.log("Candidates:", candidates.map(c => ({ id: c.id, name: c.name, email: c.email })));

  await pool.end();
}

main().catch(err => {
  console.error("Error querying db:", err);
  process.exit(1);
});
