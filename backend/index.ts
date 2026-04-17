import express from "express"
import {
  type CreateEventInput,
  type ScheduleEvent,
  validateCreateEventInput,
} from "../shared/src/index"
import AppDataSource from "./src/data-source"
import User from "./src/entities/User"

type UserPayload = {
  googleId: string
  email: string
  name?: string
}

type UserRepositoryLike = {
  create: (payload: UserPayload) => User
  save: (user: User) => Promise<User>
  findOneBy: (where: { id: string }) => Promise<User | null>
  find: () => Promise<User[]>
  remove: (user: User) => Promise<User>
}

const buildEvent = (input: CreateEventInput): ScheduleEvent => {
  const id = crypto.randomUUID()
  const linkId = crypto.randomUUID().replaceAll("-", "").slice(0, 12)
  return {
    id,
    linkId,
    title: input.title,
    organizerName: input.organizerName,
    description: input.description,
    candidates: input.candidates,
    createdAt: new Date().toISOString(),
  }
}

const validateUserPayload = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return { ok: false as const, message: "Body must be an object." }
  }

  const candidate = value as Record<string, unknown>
  if (typeof candidate.googleId !== "string" || candidate.googleId.trim().length === 0) {
    return { ok: false as const, message: "googleId is required." }
  }
  if (typeof candidate.email !== "string" || candidate.email.trim().length === 0) {
    return { ok: false as const, message: "email is required." }
  }
  if (candidate.name !== undefined && typeof candidate.name !== "string") {
    return { ok: false as const, message: "name must be a string when provided." }
  }

  return {
    ok: true as const,
    value: {
      googleId: candidate.googleId.trim(),
      email: candidate.email.trim(),
      name: typeof candidate.name === "string" ? candidate.name.trim() : undefined,
    },
  }
}

const mapUser = (user: User) => ({
  id: user.id,
  googleId: user.googleId,
  email: user.email,
  name: user.name,
})

const validateUserPatchPayload = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return { ok: false as const, message: "Body must be an object." }
  }
  const candidate = value as Record<string, unknown>
  const hasEmail = candidate.email !== undefined
  const hasName = candidate.name !== undefined
  if (!hasEmail && !hasName) {
    return { ok: false as const, message: "email or name is required." }
  }
  if (hasEmail && (typeof candidate.email !== "string" || candidate.email.trim().length === 0)) {
    return { ok: false as const, message: "email must be a non-empty string." }
  }
  if (
    hasName &&
    candidate.name !== null &&
    (typeof candidate.name !== "string" || candidate.name.trim().length === 0)
  ) {
    return { ok: false as const, message: "name must be a non-empty string or null." }
  }
  return {
    ok: true as const,
    value: {
      email: typeof candidate.email === "string" ? candidate.email.trim() : undefined,
      name:
        candidate.name === null
          ? null
          : typeof candidate.name === "string"
            ? candidate.name.trim()
            : undefined,
    },
  }
}

export const createApp = (userRepository?: UserRepositoryLike) => {
  const app = express()
  app.use(express.json())
  const isDevApiEnabled =
    process.env.NODE_ENV === "development" && process.env.DEV_API_ENABLED === "true"

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" })
  })

  app.post("/api/events", (req, res) => {
    const parsed = validateCreateEventInput(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }

    const event = buildEvent(parsed.value)
    res.status(201).json({ event })
  })

  app.use("/api/dev", (_req, res, next) => {
    if (!isDevApiEnabled) {
      res.status(404).json({ error: "Not found." })
      return
    }
    next()
  })

  app.get("/api/dev/users", async (_req, res) => {
    try {
      const repository = userRepository ?? AppDataSource.getRepository(User)
      const users = await repository.find()
      res.json({ users: users.map(mapUser) })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to list users."
      res.status(500).json({ error: message })
    }
  })

  app.post("/api/dev/users", async (req, res) => {
    const parsed = validateUserPayload(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }

    try {
      const repository = userRepository ?? AppDataSource.getRepository(User)
      const user = repository.create(parsed.value)
      const created = await repository.save(user)
      res.status(201).json({ user: mapUser(created) })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user."
      res.status(500).json({ error: message })
    }
  })

  app.get("/api/dev/users/:id", async (req, res) => {
    try {
      const repository = userRepository ?? AppDataSource.getRepository(User)
      const user = await repository.findOneBy({ id: req.params.id })
      if (!user) {
        res.status(404).json({ error: "User not found." })
        return
      }
      res.json({ user: mapUser(user) })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user."
      res.status(500).json({ error: message })
    }
  })

  app.patch("/api/dev/users/:id", async (req, res) => {
    const parsed = validateUserPatchPayload(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }
    try {
      const repository = userRepository ?? AppDataSource.getRepository(User)
      const user = await repository.findOneBy({ id: req.params.id })
      if (!user) {
        res.status(404).json({ error: "User not found." })
        return
      }

      if (parsed.value.email !== undefined) {
        user.email = parsed.value.email
      }
      if (parsed.value.name !== undefined) {
        user.name = parsed.value.name
      }

      const updated = await repository.save(user)
      res.json({ user: mapUser(updated) })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user."
      res.status(500).json({ error: message })
    }
  })

  app.delete("/api/dev/users/:id", async (req, res) => {
    try {
      const repository = userRepository ?? AppDataSource.getRepository(User)
      const user = await repository.findOneBy({ id: req.params.id })
      if (!user) {
        res.status(404).json({ error: "User not found." })
        return
      }
      await repository.remove(user)
      res.status(204).send()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user."
      res.status(500).json({ error: message })
    }
  })

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
