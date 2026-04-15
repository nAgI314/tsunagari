import type { ScheduleEvent } from "../../shared/src";

export type CreateEventRequest = {
  title: string;
  organizerName: string;
  candidates: { start: string; end: string }[];
  description?: string;
};

export type CreateEventResponse = {
  event: ScheduleEvent;
};

export const createEvent = async (
  payload: CreateEventRequest,
): Promise<CreateEventResponse> => {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to create event.");
  }

  return (await response.json()) as CreateEventResponse;
};
