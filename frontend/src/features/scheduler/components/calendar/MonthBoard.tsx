import { WEEKDAY_SHORT } from "../../model/constants";
import type { CandidateSlot, GoogleEvent } from "../../model/types";
import { addDays, dateKey, formatMonthLabel, sameDay, startOfWeek, timeLabel } from "../../utils/date";

type Props = {
  monthStart: Date;
  now: Date;
  candidateSlots: CandidateSlot[];
  googleEvents: GoogleEvent[];
  isLoggedIn: boolean;
  onMonthDayClick: (day: Date) => void;
};

export function MonthBoard({
  monthStart,
  now,
  candidateSlots,
  googleEvents,
  isLoggedIn,
  onMonthDayClick,
}: Props) {
  const gridStart = startOfWeek(monthStart);

  return (
    <section className="tsu-month-board">
      <h3>{formatMonthLabel(monthStart)}</h3>
      <div className="tsu-month-head">
        {WEEKDAY_SHORT.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="tsu-month-grid">
        {Array.from({ length: 42 }, (_, idx) => {
          const date = addDays(gridStart, idx);
          const inMonth = date.getMonth() === monthStart.getMonth();
          const slots = candidateSlots.filter((slot) => sameDay(slot.start, date));
          const events = googleEvents.filter((event) => sameDay(event.start, date));

          return (
            <button
              key={dateKey(date)}
              className={`tsu-month-cell ${inMonth ? "" : "other"}`}
              onClick={() => onMonthDayClick(date)}
              type="button"
            >
              <span className={`tsu-month-day ${sameDay(date, now) ? "today" : ""}`}>
                {date.getDate()}
              </span>
              {isLoggedIn &&
                events.slice(0, 1).map((event) => (
                  <span className="tsu-tag gcal" key={event.id}>
                    {event.title}
                  </span>
                ))}
              {slots.slice(0, 2).map((slot) => (
                <span className={`tsu-tag ${slot.answer ?? "ok"}`} key={slot.id}>
                  {`${timeLabel(slot.start)} 候補`}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </section>
  );
}
