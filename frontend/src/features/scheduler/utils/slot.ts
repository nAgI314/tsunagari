import type { AnswerStatus, TimeSlot } from "../model/types";
import { dateKey } from "./date";

export function slotKey(slot: TimeSlot): string {
  return `${dateKey(slot.start)}-${slot.start.getHours()}-${slot.end.getHours()}`;
}

export function toHourSlot(day: Date, hour: number): TimeSlot {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour + 1, 0, 0, 0);
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
