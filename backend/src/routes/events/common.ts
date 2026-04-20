import type {
  CreateEventInput,
  CreateScheduleResponseInput,
  ScheduleCandidate,
  ScheduleEvent,
  ScheduleResponse,
} from "../../../../shared/src/index"
import ScheduleAdjustment from "../../entities/ScheduleAdjustment"
import ScheduleResponseEntity from "../../entities/ScheduleResponse"

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

export const toScheduleResponse = (response: ScheduleResponseEntity): ScheduleResponse => ({
  id: response.id,
  scheduleId: response.adjustmentId,
  responderName: response.responderName,
  comment: response.comment ?? undefined,
  answers: response.answers.map((answer) => ({
    candidateId: answer.candidateId,
    status: answer.status,
  })),
  createdAt: response.createdAt.toISOString(),
})

export const validateResponseAnswers = (
  event: ScheduleEvent,
  input: CreateScheduleResponseInput,
): string | null => {
  const candidateIds = new Set(event.candidates.map((candidate) => candidate.id))
  if (candidateIds.size !== input.answers.length) {
    return "answers must include all candidates exactly once."
  }

  const seen = new Set<string>()
  for (const answer of input.answers) {
    if (!candidateIds.has(answer.candidateId)) {
      return "answers include a candidate not in this schedule."
    }
    if (seen.has(answer.candidateId)) {
      return "answers must not include duplicate candidateId."
    }
    seen.add(answer.candidateId)
  }

  return null
}
