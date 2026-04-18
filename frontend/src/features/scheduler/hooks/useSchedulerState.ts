import { useMemo, useState } from "react";
import type { CandidateSlot, ScreenMode, ViewMode } from "../model/types";
import { addDays, startOfWeek, timeLabel } from "../utils/date";
import { shiftAnswer, slotKey, toHourSlot } from "../utils/slot";

export function useSchedulerState(now: Date) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [screenMode, setScreenMode] = useState<ScreenMode>("create");

  const [candidateSlots, setCandidateSlots] = useState<CandidateSlot[]>([
    toHourSlot(addDays(startOfWeek(now), 1), 10),
    toHourSlot(addDays(startOfWeek(now), 2), 14),
    toHourSlot(addDays(startOfWeek(now), 4), 10),
  ]);

  const slotByKey = useMemo(() => {
    const map = new Map<string, CandidateSlot>();
    for (const slot of candidateSlots) {
      map.set(slotKey(slot), slot);
    }
    return map;
  }, [candidateSlots]);

  const onWeekCellClick = (day: Date, hour: number) => {
    const next = toHourSlot(day, hour);
    const key = slotKey(next);

    setCandidateSlots((prev) => {
      const existing = prev.find((slot) => slotKey(slot) === key);
      if (!existing) {
        return [...prev, screenMode === "create" ? next : { ...next, answer: "ok" }];
      }

      if (screenMode === "create") {
        return prev.filter((slot) => slotKey(slot) !== key);
      }

      return prev.map((slot) =>
        slotKey(slot) === key ? { ...slot, answer: shiftAnswer(slot.answer) } : slot,
      );
    });
  };

  const onMonthDayClick = (day: Date) => {
    onWeekCellClick(day, 10);
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
    candidateSlots,
    slotByKey,
    setViewMode,
    setScreenMode,
    toggleLogin: () => setIsLoggedIn((prev) => !prev),
    onWeekCellClick,
    onMonthDayClick,
    onCandidateSlotClick,
    slotSummaryLabel,
  };
}
