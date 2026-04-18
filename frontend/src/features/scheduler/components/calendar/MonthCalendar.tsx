import type { RefObject } from "react";
import { addMonths, startOfMonth } from "../../utils/date";
import type { CandidateSlot, GoogleEvent } from "../../model/types";
import { MonthBoard } from "./MonthBoard";

type Props = {
  now: Date;
  offsets: number[];
  scrollerRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  candidateSlots: CandidateSlot[];
  googleEvents: GoogleEvent[];
  isLoggedIn: boolean;
  onMonthDayClick: (day: Date) => void;
};

export function MonthCalendar({
  now,
  offsets,
  scrollerRef,
  onScroll,
  candidateSlots,
  googleEvents,
  isLoggedIn,
  onMonthDayClick,
}: Props) {
  return (
    <div className="tsu-month-scroller" ref={scrollerRef} onScroll={onScroll}>
      {offsets.map((offset) => (
        <MonthBoard
          key={offset}
          monthStart={addMonths(startOfMonth(now), offset)}
          now={now}
          candidateSlots={candidateSlots}
          googleEvents={googleEvents}
          isLoggedIn={isLoggedIn}
          onMonthDayClick={onMonthDayClick}
        />
      ))}
    </div>
  );
}
