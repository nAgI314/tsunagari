import type { Express } from "express"
import type { ScheduleEvent } from "../../../../shared/src/index"
import AppDataSource from "../../data-source"
import ScheduleAdjustment from "../../entities/ScheduleAdjustment"
import { toScheduleEvent } from "./common"

export const registerGetEventByLinkRoute = (
  app: Express,
  inMemoryEvents: Map<string, ScheduleEvent>,
) => {
  app.get("/api/events/by-link/:linkId", async (req, res) => {
    try {
      if (AppDataSource.isInitialized) {
        const repository = AppDataSource.getRepository(ScheduleAdjustment)
        const event = await repository.findOne({
          where: { linkId: req.params.linkId },
          relations: { candidates: true },
        })
        if (!event) {
          res.status(404).json({ error: "Event not found." })
          return
        }
        res.json({ event: toScheduleEvent(event) })
        return
      }

      const event = Array.from(inMemoryEvents.values()).find((item) => item.linkId === req.params.linkId)
      if (!event) {
        res.status(404).json({ error: "Event not found." })
        return
      }

      res.json({ event })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to get event."
      res.status(500).json({ error: message })
    }
  })
}
