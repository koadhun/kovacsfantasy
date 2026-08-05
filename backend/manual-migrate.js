import { Client } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";

dotenv.config();

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma", "migrations");

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Kapcsolódva.");

  // 1. Prisma migrációs nyilvántartó tábla létrehozása, ha nincs
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) NOT NULL PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const folders = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => fs.statSync(path.join(MIGRATIONS_DIR, f)).isDirectory())
    .sort();

  for (const folder of folders) {
    const sqlPath = path.join(MIGRATIONS_DIR, folder, "migration.sql");
    if (!fs.existsSync(sqlPath)) continue;

    const already = await client.query(
      `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1`,
      [folder]
    );
    if (already.rowCount > 0) {
      console.log(`SKIP (már alkalmazva): ${folder}`);
      continue;
    }

    const sql = fs.readFileSync(sqlPath, "utf8");
    const checksum = crypto.createHash("sha256").update(sql).digest("hex");

    console.log(`Futtatás: ${folder} ...`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        `INSERT INTO "_prisma_migrations"
         (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
         VALUES ($1, $2, now(), $3, now(), 1)`,
        [crypto.randomUUID(), checksum, folder]
      );
      await client.query("COMMIT");
      console.log(`OK: ${folder}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`HIBA a ${folder} migrációnál:`, err.message);
      throw err;
    }
  }

  console.log("Minden migráció kész.");
  await client.end();
}

main().catch((err) => {
  console.error("Végzetes hiba:", err);
  process.exit(1);
});