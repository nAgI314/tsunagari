import { useMemo, useState } from "react";
import type { CandidateSlot, ScreenMode, ViewMode } from "../model/types";
import { addDays, startOfWeek, timeLabel } from "../utils/date";
import { shiftAnswer, slotStartKey, toTimeSlot } from "../utils/slot";

export function useSchedulerState(now: Date) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [screenMode, setScreenMode] = useState<ScreenMode>("create");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);

  const [candidateSlots, setCandidateSlots] = useState<CandidateSlot[]>([
    toTimeSlot(addDays(startOfWeek(now), 1), 10, 0, 60),
    toTimeSlot(addDays(startOfWeek(now), 2), 14, 0, 60),
    toTimeSlot(addDays(startOfWeek(now), 4), 10, 0, 60),
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
    if (screenMode !== "answer") {
      return;
    }

    setCandidateSlots((prev) =>
      prev.map((slot) =>
        slot.id === targetSlot.id ? { ...slot, answer: shiftAnswer(slot.answer) } : slot,
      ),
    );
  };

  const slotSummaryLabel = (slot: CandidateSlot): string => {
    const day = `${slot.start.getMonth() + 1}/${slot.start.getDate()}`;
    return `${day} ${timeLabel(slot.start)} - ${timeLabel(slot.end)}`;
  };

  return {
    isLoggedIn,
    viewMode,
    screenMode,
    slotDurationMinutes,
    candidateSlots,
    slotByKey,
    setViewMode,
    setScreenMode,
    setSlotDurationMinutes,
    toggleLogin: () => setIsLoggedIn((prev) => !prev),
    onWeekCellClick,
    onMonthDayClick,
    onCandidateSlotClick,
    slotSummaryLabel,
  };
}
