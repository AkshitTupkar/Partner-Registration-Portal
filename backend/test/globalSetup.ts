import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

/**
 * Builds a fresh prisma/test.db from the migrations and seeds the masters.
 * Only the test database file is removed; dev.db is never touched.
 */
export default function setup() {
  for (const suffix of ["", "-journal"]) rmSync(`prisma/test.db${suffix}`, { force: true });
  const env = { ...process.env, DATABASE_URL: "file:./test.db", NODE_ENV: "test" };
  execSync("npx prisma migrate deploy", { env, stdio: "pipe" });
  execSync("npx tsx prisma/seed.ts", { env, stdio: "pipe" });
}
