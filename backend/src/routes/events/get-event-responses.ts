import type { Express } from "express"
import type { ScheduleEvent, ScheduleResponse } from "../../../../shared/src/index"
import AppDataSource from "../../data-source"
import ScheduleAdjustment from "../../entities/ScheduleAdjustment"
import ScheduleResponseEntity from "../../entities/ScheduleResponse"
import { toScheduleResponse } from "./common"

export const registerListEventResponsesRoute = (
  app: Express,
  inMemoryEvents: Map<string, ScheduleEvent>,
  inMemoryResponses: Map<string, ScheduleResponse[]>,
) => {
  app.get("/api/events/by-link/:linkId/responses", async (req, res) => {
    try {
      if (AppDataSource.isInitialized) {
        const adjustmentRepository = AppDataSource.getRepository(ScheduleAdjustment)
        const responseRepository = AppDataSource.getRepository(ScheduleResponseEntity)
        const event = await adjustmentRepository.findOne({
          where: { linkId: req.params.linkId },
        })
        if (!event) {
          res.status(404).json({ error: "Event not found." })
          return
        }

        const responses = await responseRepository.find({
          where: { adjustmentId: event.id },
          relations: { answers: true },
          order: { createdAt: "DESC" },
        })
        res.json({ responses: responses.map((response) => toScheduleResponse(response)) })
        return
      }

      const event = Array.from(inMemoryEvents.values()).find((item) => item.linkId === req.params.linkId)
      if (!event) {
        res.status(404).json({ error: "Event not found." })
        return
      }

      const responses = (inMemoryResponses.get(event.id) ?? []).slice().reverse()
      res.json({ responses })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to list responses."
      res.status(500).json({ error: message })
    }
  })
}
