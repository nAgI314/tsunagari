import type { Express } from "express"
import { mapUser, resolveUserRepository, type UserRepositoryLike } from "./common"

export const registerListDevUsersRoute = (app: Express, userRepository?: UserRepositoryLike) => {
  app.get("/api/dev/users", async (_req, res) => {
    try {
      const repository = resolveUserRepository(userRepository)
      const users = await repository.find()
      res.json({ users: users.map(mapUser) })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to list users."
      res.status(500).json({ error: message })
    }
  })
}
