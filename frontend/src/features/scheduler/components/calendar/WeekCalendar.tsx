import type { RefObject } from "react";
import { addWeeks, startOfWeek } from "../../utils/date";
import type { CandidateSlot, GoogleEvent, ScreenMode } from "../../model/types";
import { WeekBoard } from "./WeekBoard";

type Props = {
  now: Date;
  offsets: number[];
  scrollerRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  screenMode: ScreenMode;
  isLoggedIn: boolean;
  slotByKey: Map<string, CandidateSlot>;
  googleEvents: GoogleEvent[];
  onWeekCellClick: (day: Date, hour: number) => void;
};

export function WeekCalendar({
  now,
  offsets,
  scrollerRef,
  onScroll,
  screenMode,
  isLoggedIn,
  slotByKey,
  googleEvents,
  onWeekCellClick,
}: Props) {
  return (
    <div className="tsu-week-scroller" ref={scrollerRef} onScroll={onScroll}>
      {offsets.map((offset) => (
        <WeekBoard
          key={offset}
          weekStart={addWeeks(startOfWeek(now), offset)}
          now={now}
          screenMode={screenMode}
          isLoggedIn={isLoggedIn}
          slotByKey={slotByKey}
          googleEvents={googleEvents}
          onWeekCellClick={onWeekCellClick}
        />
      ))}
    </div>
  );
}
