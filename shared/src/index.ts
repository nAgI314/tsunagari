export type TimeSlot = {
  start: string;
  end: string;
};

export type ScheduleCandidate = TimeSlot & {
  id: string;
};

export type CreateScheduleAdjustmentInput = {
  title: string;
  organizerName: string;
  description?: string;
  candidates: TimeSlot[];
};

export type ScheduleAdjustment = {
  id: string;
  linkId: string;
  title: string;
  organizerName: string;
  description?: string;
  candidates: ScheduleCandidate[];
  createdAt: string;
};

export type ScheduleAnswerStatus = "ok" | "maybe" | "ng";

export type ScheduleResponseAnswer = {
  candidateId: string;
  status: ScheduleAnswerStatus;
};

export type CreateScheduleResponseInput = {
  responderName: string;
  comment?: string;
  answers: ScheduleResponseAnswer[];
};

export type ScheduleResponse = {
  id: string;
  scheduleId: string;
  responderName: string;
  comment?: string;
  answers: ScheduleResponseAnswer[];
  createdAt: string;
};

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; message: string };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isIsoLikeDateTime = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
};

export const validateCreateScheduleAdjustmentInput = (
  value: unknown,
): ValidationResult<CreateScheduleAdjustmentInput> => {
  if (typeof value !== "object" || value === null) {
    return { ok: false, message: "Body must be an object." };
  }

  const candidate = value as Record<string, unknown>;

  if (!isNonEmptyString(candidate.title)) {
    return { ok: false, message: "title is required." };
  }

  if (!isNonEmptyString(candidate.organizerName)) {
    return { ok: false, message: "organizerName is required." };
  }

  if (!Array.isArray(candidate.candidates) || candidate.candidates.length === 0) {
    return { ok: false, message: "candidates must be a non-empty array." };
  }

  const normalizedCandidates: TimeSlot[] = [];
  for (const slot of candidate.candidates) {
    if (typeof slot !== "object" || slot === null) {
      return { ok: false, message: "Each candidate must be an object." };
    }

    const timeSlot = slot as Record<string, unknown>;
    if (!isIsoLikeDateTime(timeSlot.start) || !isIsoLikeDateTime(timeSlot.end)) {
      return {
        ok: false,
        message: "Each candidate must include valid start/end datetime strings.",
      };
    }

    if (Date.parse(timeSlot.start) >= Date.parse(timeSlot.end)) {
      return { ok: false, message: "candidate start must be before end." };
    }

    normalizedCandidates.push({ start: timeSlot.start, end: timeSlot.end });
  }

  if (candidate.description !== undefined && typeof candidate.description !== "string") {
    return { ok: false, message: "description must be a string when provided." };
  }

  return {
    ok: true,
    value: {
      title: candidate.title.trim(),
      organizerName: candidate.organizerName.trim(),
      description: candidate.description,
      candidates: normalizedCandidates,
    },
  };
};

export const validateCreateScheduleResponseInput = (
  value: unknown,
): ValidationResult<CreateScheduleResponseInput> => {
  if (typeof value !== "object" || value === null) {
    return { ok: false, message: "Body must be an object." };
  }

  const candidate = value as Record<string, unknown>;

  if (!isNonEmptyString(candidate.responderName)) {
    return { ok: false, message: "responderName is required." };
  }

  if (!Array.isArray(candidate.answers) || candidate.answers.length === 0) {
    return { ok: false, message: "answers must be a non-empty array." };
  }

  const normalizedAnswers: ScheduleResponseAnswer[] = [];
  for (const answer of candidate.answers) {
    if (typeof answer !== "object" || answer === null) {
      return { ok: false, message: "Each answer must be an object." };
    }

    const answerRecord = answer as Record<string, unknown>;
    if (!isNonEmptyString(answerRecord.candidateId)) {
      return { ok: false, message: "Each answer must include candidateId." };
    }
    if (
      answerRecord.status !== "ok" &&
      answerRecord.status !== "maybe" &&
      answerRecord.status !== "ng"
    ) {
      return { ok: false, message: "Each answer status must be one of: ok, maybe, ng." };
    }

    normalizedAnswers.push({
      candidateId: answerRecord.candidateId.trim(),
      status: answerRecord.status,
    });
  }

  if (candidate.comment !== undefined && typeof candidate.comment !== "string") {
    return { ok: false, message: "comment must be a string when provided." };
  }

  return {
    ok: true,
    value: {
      responderName: candidate.responderName.trim(),
      comment: candidate.comment,
      answers: normalizedAnswers,
    },
  };
};

// Backward-compatible aliases for existing backend/frontend paths.
export type CreateEventInput = CreateScheduleAdjustmentInput;
export type ScheduleEvent = ScheduleAdjustment;
export const validateCreateEventInput = validateCreateScheduleAdjustmentInput;
