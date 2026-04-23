import { useMemo, useState } from "react";
import type { CandidateSlot, ScreenMode, ViewMode } from "../model/types";
import { timeLabel } from "../utils/date";
import { shiftAnswer, slotStartKey, toTimeSlot } from "../utils/slot";

export function useSchedulerState(now: Date) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [screenMode, setScreenMode] = useState<ScreenMode>("create");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);

  const [candidateSlots, setCandidateSlots] = useState<CandidateSlot[]>([
    // toTimeSlot(addDays(startOfWeek(now), 1), 10, 0, 60),
    // toTimeSlot(addDays(startOfWeek(now), 2), 14, 0, 60),
    // toTimeSlot(addDays(startOfWeek(now), 4), 10, 0, 60),
  ]);

  const slotByKey = useMemo(() => {
    const map = new Map<string, CandidateSlot>();
    for (const slot of candidateSlots) {
      map.set(slotStartKey(slot), slot);
    }
    return map;
  }, [candidateSlots]);

  const onWeekCellClick = (day: Date, hour: number, minute: number) => {
    const next = toTimeSlot(day, hour, minute, slotDurationMinutes);
    const key = slotStartKey(next);

    setCandidateSlots((prev) => {
      const existing = prev.find((slot) => slotStartKey(slot) === key);
      if (!existing) {
        return [...prev, screenMode === "create" ? next : { ...next, answer: "ok" }];
      }

      if (screenMode === "create") {
        return prev.filter((slot) => slotStartKey(slot) !== key);
      }

      return prev.map((slot) =>
        slotStartKey(slot) === key ? { ...slot, answer: shiftAnswer(slot.answer) } : slot,
      );
    });
  };

  const onMonthDayClick = (day: Date) => {
    onWeekCellClick(day, 10, 0);
  };

  const onCandidateSlotClick = (targetSlot: CandidateSlot) => {
    onCandidateSlotClickById(targetSlot.id);
  };

  const onCandidateSlotClickById = (slotId: string) => {
    if (screenMode !== "answer") {
      return;
    }

    setCandidateSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, answer: shiftAnswer(slot.answer) } : slot,
      ),
    );
  };

  const removeCandidateSlot = (slotId: string) => {
    setCandidateSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const moveCandidateSlot = (slotId: string, day: Date, hour: number, minute: number) => {
    setCandidateSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId) {
          return slot;
        }

        const durationMs = slot.end.getTime() - slot.start.getTime();
        const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 24, 0, 0, 0);
        const desiredStart = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          hour,
          minute,
          0,
          0,
        );
        const latestStart = new Date(dayEnd.getTime() - durationMs);
        const clampedStart =
          desiredStart.getTime() < dayStart.getTime()
            ? dayStart
            : desiredStart.getTime() > latestStart.getTime()
              ? latestStart
              : desiredStart;

        return {
          ...slot,
          start: clampedStart,
          end: new Date(clampedStart.getTime() + durationMs),
        };
      }),
    );
  };

  const slotSummaryLabel = (slot: CandidateSlot): string => {
    const day = `${slot.start.getMonth() + 1}/${slot.start.getDate()}`;
    return `${day} ${timeLabel(slot.start)} - ${timeLabel(slot.end)}`;
  };

  return {
    viewMode,
    screenMode,
    slotDurationMinutes,
    candidateSlots,
    slotByKey,
    setViewMode,
    setScreenMode,
    setSlotDurationMinutes,
    onWeekCellClick,
    onMonthDayClick,
    onCandidateSlotClick,
    onCandidateSlotClickById,
    removeCandidateSlot,
    moveCandidateSlot,
    slotSummaryLabel,
  };
}
