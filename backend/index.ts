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

export const createApp = (userRepository?: UserRepositoryLike) => {
  const app = express()
  app.use(express.json())

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

  app.post("/api/users", async (req, res) => {
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

  app.get("/api/users/:id", async (req, res) => {
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

  return app
}

export const startServer = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
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
