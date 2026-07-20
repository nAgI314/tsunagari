import "dotenv/config"
import express from "express"
import session from "express-session"
import connectPgSimple from "connect-pg-simple"
import { type ScheduleEvent, type ScheduleResponse } from "../shared/src/index"
import AppDataSource from "./src/data-source"
import { type UserRepositoryLike } from "./src/routes/dev-users/common"
import { registerDeleteDevUserRoute } from "./src/routes/dev-users/delete-user"
import { registerGetDevUserByIdRoute } from "./src/routes/dev-users/get-user-by-id"
import { registerListDevUsersRoute } from "./src/routes/dev-users/get-users"
import { registerDevApiGuard } from "./src/routes/dev-users/guard-dev-api"
import { registerPatchDevUserRoute } from "./src/routes/dev-users/patch-user"
import { registerCreateDevUserRoute } from "./src/routes/dev-users/post-user"
import { registerGetEventByLinkRoute } from "./src/routes/events/get-event-by-link"
import { registerListEventResponsesRoute } from "./src/routes/events/get-event-responses"
import { registerCreateEventRoute } from "./src/routes/events/post-event"
import { registerCreateEventResponseRoute } from "./src/routes/events/post-event-response"
import { registerUpdateEventRoute } from "./src/routes/events/put-event"
import { registerAuthRoutes } from "./src/routes/auth"

export const createApp = (userRepository?: UserRepositoryLike) => {
  const app = express()

  app.set("trust proxy", 1)

  app.use(express.json())

  const sessionSecret = process.env.SESSION_SECRET
  if (sessionSecret) {
    let store: session.Store | undefined
    if (process.env.SESSION_STORE !== "memory") {
      const PgSession = connectPgSimple(session)
      store = new PgSession({
        conObject: {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || "5432", 10),
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        },
        tableName: "session",
        createTableIfMissing: false,
      })
    }
    app.use(
      session({
        store,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        name: "tsunagari.sid",
        cookie: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      })
    )
  }

  const isDevApiEnabled =
    process.env.NODE_ENV === "development" && process.env.DEV_API_ENABLED === "true"
  const inMemoryEvents = new Map<string, ScheduleEvent>()
  const inMemoryResponses = new Map<string, ScheduleResponse[]>()

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
  })

  registerAuthRoutes(app, userRepository)

  registerCreateEventRoute(app, inMemoryEvents)
  registerGetEventByLinkRoute(app, inMemoryEvents)
  registerListEventResponsesRoute(app, inMemoryEvents, inMemoryResponses)
  registerCreateEventResponseRoute(app, inMemoryEvents, inMemoryResponses)
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
