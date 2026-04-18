import type { RefObject } from "react";
import type { CandidateSlot, GoogleEvent, ScreenMode, ViewMode } from "../../model/types";
import { MonthCalendar } from "./MonthCalendar";
import { WeekCalendar } from "./WeekCalendar";

type Props = {
  viewMode: ViewMode;
  now: Date;
  weekOffsets: number[];
  monthOffsets: number[];
  weekScrollerRef: RefObject<HTMLDivElement | null>;
  monthScrollerRef: RefObject<HTMLDivElement | null>;
  onWeekScroll: () => void;
  onMonthScroll: () => void;
  screenMode: ScreenMode;
  isLoggedIn: boolean;
  slotByKey: Map<string, CandidateSlot>;
  candidateSlots: CandidateSlot[];
  googleEvents: GoogleEvent[];
  onWeekCellClick: (day: Date, hour: number, minute: number) => void;
  onMonthDayClick: (day: Date) => void;
  onCandidateSlotClickById: (slotId: string) => void;
  onRemoveCandidateSlot: (slotId: string) => void;
  onMoveCandidateSlot: (slotId: string, day: Date, hour: number, minute: number) => void;
};

export function CalendarViewport({
  viewMode,
  now,
  weekOffsets,
  monthOffsets,
  weekScrollerRef,
  monthScrollerRef,
  onWeekScroll,
  onMonthScroll,
  screenMode,
  isLoggedIn,
  slotByKey,
  candidateSlots,
  googleEvents,
  onWeekCellClick,
  onMonthDayClick,
  onCandidateSlotClickById,
  onRemoveCandidateSlot,
  onMoveCandidateSlot,
}: Props) {
  if (viewMode === "week") {
    return (
      <WeekCalendar
        now={now}
        offsets={weekOffsets}
        scrollerRef={weekScrollerRef}
        onScroll={onWeekScroll}
        screenMode={screenMode}
        isLoggedIn={isLoggedIn}
        slotByKey={slotByKey}
        googleEvents={googleEvents}
        onWeekCellClick={onWeekCellClick}
        onCandidateSlotClickById={onCandidateSlotClickById}
        onRemoveCandidateSlot={onRemoveCandidateSlot}
        onMoveCandidateSlot={onMoveCandidateSlot}
      />
    );
  }

  return (
    <MonthCalendar
      now={now}
      offsets={monthOffsets}
      scrollerRef={monthScrollerRef}
      onScroll={onMonthScroll}
      candidateSlots={candidateSlots}
      googleEvents={googleEvents}
      isLoggedIn={isLoggedIn}
      onMonthDayClick={onMonthDayClick}
    />
  );
}
