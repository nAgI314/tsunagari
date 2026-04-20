import type { Express } from "express"
import { resolveUserRepository, type UserRepositoryLike } from "./common"

export const registerDeleteDevUserRoute = (app: Express, userRepository?: UserRepositoryLike) => {
  app.delete("/api/dev/users/:id", async (req, res) => {
    try {
      const repository = resolveUserRepository(userRepository)
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
}
