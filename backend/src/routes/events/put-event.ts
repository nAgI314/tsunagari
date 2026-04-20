import type { Express } from "express"
import type { ScheduleEvent } from "../../../../shared/src/index"
import { validateCreateEventInput } from "../../../../shared/src/index"
import AppDataSource from "../../data-source"
import ScheduleAdjustment from "../../entities/ScheduleAdjustment"
import ScheduleCandidateEntity from "../../entities/ScheduleCandidate"
import { toScheduleEvent } from "./common"

export const registerUpdateEventRoute = (
  app: Express,
  inMemoryEvents: Map<string, ScheduleEvent>,
) => {
  app.put("/api/events/:id", async (req, res) => {
    const parsed = validateCreateEventInput(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }

    try {
      if (AppDataSource.isInitialized) {
        const repository = AppDataSource.getRepository(ScheduleAdjustment)
        const event = await repository.findOne({
          where: { id: req.params.id },
          relations: { candidates: true },
        })
        if (!event) {
          res.status(404).json({ error: "Event not found." })
          return
        }

        event.title = parsed.value.title
        event.organizerName = parsed.value.organizerName
        event.description = parsed.value.description ?? null
        event.candidates = parsed.value.candidates.map((slot) =>
          Object.assign(new ScheduleCandidateEntity(), {
            id: crypto.randomUUID(),
            adjustmentId: event.id,
            start: new Date(slot.start),
            end: new Date(slot.end),
          }),
        )

        const saved = await repository.save(event)
        res.json({ event: toScheduleEvent(saved) })
        return
      }

      const current = inMemoryEvents.get(req.params.id)
      if (!current) {
        res.status(404).json({ error: "Event not found." })
        return
      }
      const updated: ScheduleEvent = {
        ...current,
        title: parsed.value.title,
        organizerName: parsed.value.organizerName,
        description: parsed.value.description,
        candidates: parsed.value.candidates.map((slot) => ({
          id: crypto.randomUUID(),
          start: slot.start,
          end: slot.end,
        })),
      }
      inMemoryEvents.set(updated.id, updated)
      res.json({ event: updated })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update event."
      res.status(500).json({ error: message })
    }
  })
}
