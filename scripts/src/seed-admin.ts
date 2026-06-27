import { db, adminsTable, candidatesTable, pool } from "@workspace/db";
import bcrypt from "bcryptjs";

async function main() {
  // 1. Seed Admin
  const username = "admin";
  const password = "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(`Inserting admin user: ${username}...`);
  await db.insert(adminsTable).values({
    username,
    passwordHash,
  });
  console.log("Admin user seeded successfully!");

  // 2. Seed Candidates
  console.log("Inserting candidate profiles...");
  await db.insert(candidatesTable).values([
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+15550100",
      department: "Engineering",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+15550200",
      department: "Design",
    },
  ]);
  console.log("Candidate profiles seeded successfully!");

  await pool.end();
}

main().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
