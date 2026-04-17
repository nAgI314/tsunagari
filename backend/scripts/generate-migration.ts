const migrationName = Bun.argv[2]?.trim()

if (!migrationName) {
  console.error("Usage: bun run db:migration:generate -- <MigrationName>")
  process.exit(1)
}

if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(migrationName)) {
  console.error("MigrationName must start with a letter and contain only [A-Za-z0-9_-].")
  process.exit(1)
}

const run = async (command: string[]) => {
  const proc = Bun.spawn(command, {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  })
  const code = await proc.exited
  if (code !== 0) {
    process.exit(code)
  }
}

await run([
  "bunx",
  "--bun",
  "typeorm",
  "migration:generate",
  `src/db/migrations/${migrationName}`,
  "-d",
  "src/data-source.ts",
])
await run(["bun", "run", "db:migration:fix-latest"])
