import type { Express } from "express"
import { type ScheduleEvent, validateCreateEventInput } from "../../../../shared/src/index"
import AppDataSource from "../../data-source"
import ScheduleAdjustment from "../../entities/ScheduleAdjustment"
import ScheduleCandidateEntity from "../../entities/ScheduleCandidate"
import { buildEvent, toScheduleEvent } from "./common"

export const registerCreateEventRoute = (
  app: Express,
  inMemoryEvents: Map<string, ScheduleEvent>,
) => {
  app.post("/api/events", async (req, res) => {
    const parsed = validateCreateEventInput(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }

    try {
      if (AppDataSource.isInitialized) {
        const repository = AppDataSource.getRepository(ScheduleAdjustment)
        const created = repository.create({
          linkId: crypto.randomUUID().replaceAll("-", "").slice(0, 12),
          title: parsed.value.title,
          organizerName: parsed.value.organizerName,
          description: parsed.value.description ?? null,
          candidates: parsed.value.candidates.map((slot) =>
            Object.assign(new ScheduleCandidateEntity(), {
              id: crypto.randomUUID(),
              start: new Date(slot.start),
              end: new Date(slot.end),
            }),
          ),
        })
        const saved = await repository.save(created)
        res.status(201).json({ event: toScheduleEvent(saved) })
        return
      }

      const event = buildEvent(parsed.value)
      inMemoryEvents.set(event.id, event)
      res.status(201).json({ event })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create event."
      res.status(500).json({ error: message })
    }
  })
}
