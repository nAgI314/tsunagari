import type { Express } from "express"
import type { ScheduleEvent, ScheduleResponse } from "../../../../shared/src/index"
import { validateCreateScheduleResponseInput } from "../../../../shared/src/index"
import AppDataSource from "../../data-source"
import ScheduleAdjustment from "../../entities/ScheduleAdjustment"
import ScheduleResponseAnswer from "../../entities/ScheduleResponseAnswer"
import ScheduleResponseEntity from "../../entities/ScheduleResponse"
import { toScheduleEvent, toScheduleResponse, validateResponseAnswers } from "./common"

export const registerCreateEventResponseRoute = (
  app: Express,
  inMemoryEvents: Map<string, ScheduleEvent>,
  inMemoryResponses: Map<string, ScheduleResponse[]>,
) => {
  app.post("/api/events/by-link/:linkId/responses", async (req, res) => {
    const parsed = validateCreateScheduleResponseInput(req.body)
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.message })
      return
    }

    try {
      if (AppDataSource.isInitialized) {
        const adjustmentRepository = AppDataSource.getRepository(ScheduleAdjustment)
        const responseRepository = AppDataSource.getRepository(ScheduleResponseEntity)
        const answerRepository = AppDataSource.getRepository(ScheduleResponseAnswer)
        const event = await adjustmentRepository.findOne({
          where: { linkId: req.params.linkId },
          relations: { candidates: true },
        })
        if (!event) {
          res.status(404).json({ error: "Event not found." })
          return
        }

        const scheduleEvent = toScheduleEvent(event)
        const validationMessage = validateResponseAnswers(scheduleEvent, parsed.value)
        if (validationMessage) {
          res.status(400).json({ error: validationMessage })
          return
        }

        let savedResponse: ScheduleResponseEntity
        const existingResponse = await responseRepository.findOne({
          where: { adjustmentId: event.id, responderName: parsed.value.responderName },
          relations: { answers: true },
        })

        if (existingResponse) {
          // 既存回答を上書き: 古い answers を削除して更新
          if (existingResponse.answers && existingResponse.answers.length > 0) {
            await answerRepository.remove(existingResponse.answers)
          }
          existingResponse.comment = parsed.value.comment ?? null
          savedResponse = await responseRepository.save(existingResponse)
        } else {
          const createdResponse = responseRepository.create({
            adjustmentId: event.id,
            responderName: parsed.value.responderName,
            comment: parsed.value.comment ?? null,
          })
          savedResponse = await responseRepository.save(createdResponse)
        }

        await answerRepository.save(
          parsed.value.answers.map((answer) =>
            answerRepository.create({
              responseId: savedResponse.id,
              candidateId: answer.candidateId,
              status: answer.status,
            }),
          ),
        )

        const fullResponse = await responseRepository.findOneOrFail({
          where: { id: savedResponse.id },
          relations: { answers: true },
        })
        res.status(200).json({ response: toScheduleResponse(fullResponse) })
        return
      }

      const event = Array.from(inMemoryEvents.values()).find((item) => item.linkId === req.params.linkId)
      if (!event) {
        res.status(404).json({ error: "Event not found." })
        return
      }

      const validationMessage = validateResponseAnswers(event, parsed.value)
      if (validationMessage) {
        res.status(400).json({ error: validationMessage })
        return
      }

      const current = inMemoryResponses.get(event.id) ?? []
      const existingIndex = current.findIndex(
        (r) => r.responderName === parsed.value.responderName
      )
      const existing = existingIndex >= 0 ? current[existingIndex] : undefined

      const nextResponse: ScheduleResponse = {
        id: existing ? existing.id : crypto.randomUUID(),
        scheduleId: event.id,
        responderName: parsed.value.responderName,
        comment: parsed.value.comment,
        answers: parsed.value.answers,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        current[existingIndex] = nextResponse
        inMemoryResponses.set(event.id, current)
      } else {
        inMemoryResponses.set(event.id, [...current, nextResponse])
      }
      res.status(200).json({ response: nextResponse })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create response."
      res.status(500).json({ error: message })
    }
  })
}
