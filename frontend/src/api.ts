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

export type DevUser = {
  id: string;
  googleId: string;
  email: string;
  name: string | null;
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

const parseApiError = async (response: Response): Promise<string> => {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return body.error ?? "Request failed.";
};

export const listDevUsers = async (): Promise<{ users: DevUser[] }> => {
  const response = await fetch("/api/dev/users");
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as { users: DevUser[] };
};

export const createDevUser = async (payload: {
  googleId: string;
  email: string;
  name?: string;
}): Promise<{ user: DevUser }> => {
  const response = await fetch("/api/dev/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as { user: DevUser };
};

export const updateDevUser = async (
  id: string,
  payload: { email?: string; name?: string | null },
): Promise<{ user: DevUser }> => {
  const response = await fetch(`/api/dev/users/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as { user: DevUser };
};

export const deleteDevUser = async (id: string): Promise<void> => {
  const response = await fetch(`/api/dev/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
