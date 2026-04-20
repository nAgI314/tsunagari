import type { Express } from "express"
import { mapUser, resolveUserRepository, type UserRepositoryLike } from "./common"

export const registerGetDevUserByIdRoute = (app: Express, userRepository?: UserRepositoryLike) => {
  app.get("/api/dev/users/:id", async (req, res) => {
    try {
      const repository = resolveUserRepository(userRepository)
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
}
