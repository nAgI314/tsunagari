import type { Express } from "express"

export const registerDevApiGuard = (app: Express, enabled: boolean) => {
  app.use("/api/dev", (_req, res, next) => {
    if (!enabled) {
      res.status(404).json({ error: "Not found." })
      return
    }
    next()
  })
}
