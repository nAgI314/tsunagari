import type { AnswerStatus, TimeSlot } from "../model/types";
import { dateKey } from "./date";

export function slotStartKey(slot: TimeSlot): string {
  return slotStartKeyForTime(slot.start, slot.start.getHours(), slot.start.getMinutes());
}

export function slotStartKeyForTime(day: Date, hour: number, minute: number): string {
  return `${dateKey(day)}-${hour.toString().padStart(2, "0")}-${minute
    .toString()
    .padStart(2, "0")}`;
}

export function toTimeSlot(
  day: Date,
  hour: number,
  minute: number,
  durationMinutes: number,
): TimeSlot {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return {
    id: `slot-${start.getTime()}`,
    start,
    end,
  };
}

export function shiftAnswer(status: AnswerStatus | undefined): AnswerStatus {
  if (status === "ok") {
    return "maybe";
  }
  if (status === "maybe") {
    return "ng";
  }
  return "ok";
}
