export type TimeSlot = {
  start: string;
  end: string;
};

export type CreateEventInput = {
  title: string;
  organizerName: string;
  description?: string;
  candidates: TimeSlot[];
};

export type ScheduleEvent = {
  id: string;
  linkId: string;
  title: string;
  organizerName: string;
  description?: string;
  candidates: TimeSlot[];
  createdAt: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isIsoLikeDateTime = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
};

export const validateCreateEventInput = (
  value: unknown,
): ValidationResult<CreateEventInput> => {
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
