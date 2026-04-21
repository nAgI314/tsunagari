import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { HOURS, START_HOUR } from "../../model/constants";
import { addWeeks, startOfWeek } from "../../utils/date";
import type { AnswerStatus, CandidateSlot, GoogleEvent, ScreenMode } from "../../model/types";
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
  onWeekCellClick: (day: Date, hour: number, minute: number) => void;
  onCandidateSlotClickById: (slotId: string) => void;
  onRemoveCandidateSlot: (slotId: string) => void;
  onMoveCandidateSlot: (slotId: string, day: Date, hour: number, minute: number) => void;
  getSlotAnswer?: (slot: CandidateSlot) => AnswerStatus | undefined;
  onSelectSlotAnswer?: (slotId: string, status: AnswerStatus) => void;
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
  onCandidateSlotClickById,
  onRemoveCandidateSlot,
  onMoveCandidateSlot,
  getSlotAnswer,
  onSelectSlotAnswer,
}: Props) {
  const lastScrollTopRef = useRef(0);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    if (scroller.scrollTop <= 2 && lastScrollTopRef.current > 2) {
      scroller.scrollTop = lastScrollTopRef.current;
    }
  }, [scrollerRef, slotByKey]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      lastScrollTopRef.current = scroller.scrollTop;
    }
    onScroll();
  };

  return (
    <div className="tsu-week-layout">
      <div className="tsu-week-scroller" ref={scrollerRef} onScroll={handleScroll}>
        <div className="tsu-time-axis">
          <div className="tsu-time-axis-head" />
          <div className="tsu-time-axis-body">
            {Array.from({ length: HOURS }, (_, rowIndex) => {
              const hour = START_HOUR + rowIndex;
              return (
                <div key={hour} className="tsu-time-axis-cell">{`${hour}:00`}</div>
              );
            })}
            <div className="tsu-time-axis-cell tail" />
          </div>
        </div>
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
            onCandidateSlotClickById={onCandidateSlotClickById}
            onRemoveCandidateSlot={onRemoveCandidateSlot}
            onMoveCandidateSlot={onMoveCandidateSlot}
            getSlotAnswer={getSlotAnswer}
            onSelectSlotAnswer={onSelectSlotAnswer}
          />
        ))}
      </div>
    </div>
  );
}
