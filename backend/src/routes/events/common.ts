import type { CreateEventInput, ScheduleCandidate, ScheduleEvent } from "../../../../shared/src/index"
import ScheduleAdjustment from "../../entities/ScheduleAdjustment"

export const buildEvent = (input: CreateEventInput): ScheduleEvent => {
  const id = crypto.randomUUID()
  const linkId = crypto.randomUUID().replaceAll("-", "").slice(0, 12)
  return {
    id,
    linkId,
    title: input.title,
    organizerName: input.organizerName,
    description: input.description,
    candidates: input.candidates.map((slot): ScheduleCandidate => ({
      id: crypto.randomUUID(),
      start: slot.start,
      end: slot.end,
    })),
    createdAt: new Date().toISOString(),
  }
}

export const toScheduleEvent = (adjustment: ScheduleAdjustment): ScheduleEvent => ({
  id: adjustment.id,
  linkId: adjustment.linkId,
  title: adjustment.title,
  organizerName: adjustment.organizerName,
  description: adjustment.description ?? undefined,
  candidates: adjustment.candidates
    .slice()
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((candidate) => ({
      id: candidate.id,
      start: candidate.start.toISOString(),
      end: candidate.end.toISOString(),
    })),
  createdAt: adjustment.createdAt.toISOString(),
})
