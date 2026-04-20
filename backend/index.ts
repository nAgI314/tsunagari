import express from "express"
import { type ScheduleEvent } from "../shared/src/index"
import AppDataSource from "./src/data-source"
import { type UserRepositoryLike } from "./src/routes/dev-users/common"
import { registerDeleteDevUserRoute } from "./src/routes/dev-users/delete-user"
import { registerGetDevUserByIdRoute } from "./src/routes/dev-users/get-user-by-id"
import { registerListDevUsersRoute } from "./src/routes/dev-users/get-users"
import { registerDevApiGuard } from "./src/routes/dev-users/guard-dev-api"
import { registerPatchDevUserRoute } from "./src/routes/dev-users/patch-user"
import { registerCreateDevUserRoute } from "./src/routes/dev-users/post-user"
import { registerCreateEventRoute } from "./src/routes/events/post-event"
import { registerUpdateEventRoute } from "./src/routes/events/put-event"

export const createApp = (userRepository?: UserRepositoryLike) => {
  const app = express()
  app.use(express.json())
  const isDevApiEnabled =
    process.env.NODE_ENV === "development" && process.env.DEV_API_ENABLED === "true"
  const inMemoryEvents = new Map<string, ScheduleEvent>()

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
  })

  registerCreateEventRoute(app, inMemoryEvents)
  registerUpdateEventRoute(app, inMemoryEvents)

  registerDevApiGuard(app, isDevApiEnabled)
  registerListDevUsersRoute(app, userRepository)
  registerCreateDevUserRoute(app, userRepository)
  registerGetDevUserByIdRoute(app, userRepository)
  registerPatchDevUserRoute(app, userRepository)
  registerDeleteDevUserRoute(app, userRepository)

  return app
}

export const startServer = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }
  if (process.env.NODE_ENV === "development") {
    await AppDataSource.runMigrations()
  }

  const app = createApp()
  const port = Number(process.env.PORT ?? 3000)
  app.listen(port, () => {
    console.log(`backend listening on :${port}`)
  })
}

if (import.meta.main) {
  startServer().catch((error) => {
    console.error("Failed to start backend", error)
    process.exit(1)
  })
}
