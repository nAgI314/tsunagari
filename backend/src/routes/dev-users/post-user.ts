import type { Express } from "express"
import {
  mapUser,
  resolveUserRepository,
  type UserRepositoryLike,
  validateUserPayload,
} from "./common"

export const registerCreateDevUserRoute = (app: Express, userRepository?: UserRepositoryLike) => {
  app.post("/api/dev/users", async (req, res) => {
    const parsed = validateUserPayload(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }

    try {
      const repository = resolveUserRepository(userRepository)
      const user = repository.create(parsed.value)
      const created = await repository.save(user)
      res.status(201).json({ user: mapUser(created) })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user."
      res.status(500).json({ error: message })
    }
  })
}
