import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "db", "migrations")

const files = await readdir(migrationsDir)
const target = files
  .filter((file) => file.endsWith(".ts"))
  .sort((a, b) => b.localeCompare(a))[0]

if (!target) {
  throw new Error("No migration file found.")
}

const filePath = join(migrationsDir, target)
const original = await readFile(filePath, "utf8")
const updated = original.replace(
  /import\s+\{\s*MigrationInterface\s*,\s*QueryRunner\s*\}\s+from\s+["']typeorm["'];?/,
  'import { type MigrationInterface, type QueryRunner } from "typeorm"',
)

if (original !== updated) {
  await writeFile(filePath, updated, "utf8")
}
