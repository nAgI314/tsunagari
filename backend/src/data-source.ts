import "dotenv/config"
import "reflect-metadata"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { DataSource } from "typeorm"
import ScheduleAdjustment from "./entities/ScheduleAdjustment"
import ScheduleCandidate from "./entities/ScheduleCandidate"
import ScheduleResponse from "./entities/ScheduleResponse"
import ScheduleResponseAnswer from "./entities/ScheduleResponseAnswer"
import User from "./entities/User"

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationGlob = join(__dirname, "db", "migrations", "*.{ts,js}").replaceAll("\\", "/")

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  migrationsRun: false,
  logging: false,
  entities: [User, ScheduleAdjustment, ScheduleCandidate, ScheduleResponse, ScheduleResponseAnswer],
  migrations: [migrationGlob],
  subscribers: [],
})

export default AppDataSource
