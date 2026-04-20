import type { Express } from "express"
import {
  mapUser,
  resolveUserRepository,
  type UserRepositoryLike,
  validateUserPatchPayload,
} from "./common"

export const registerPatchDevUserRoute = (app: Express, userRepository?: UserRepositoryLike) => {
  app.patch("/api/dev/users/:id", async (req, res) => {
    const parsed = validateUserPatchPayload(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }
    try {
      const repository = resolveUserRepository(userRepository)
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
}
