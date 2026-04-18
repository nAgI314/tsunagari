import { HOURS, START_HOUR, WEEKDAY_SHORT } from "../../model/constants";
import type { CandidateSlot, GoogleEvent, ScreenMode } from "../../model/types";
import { addDays, dateKey, sameDay, timeLabel } from "../../utils/date";
import { GoogleEventLayer } from "./GoogleEventLayer";

type Props = {
  weekStart: Date;
  now: Date;
  screenMode: ScreenMode;
  isLoggedIn: boolean;
  slotByKey: Map<string, CandidateSlot>;
  googleEvents: GoogleEvent[];
  onWeekCellClick: (day: Date, hour: number) => void;
};

function slotStatusLabel(slot: CandidateSlot): string {
  if (slot.answer === "ng") {
    return "NG";
  }
  if (slot.answer === "maybe") {
    return "未定";
  }
  return "OK";
}

function slotStatusClass(slot: CandidateSlot): "ok" | "maybe" | "ng" {
  if (slot.answer === "ng") {
    return "ng";
  }
  if (slot.answer === "maybe") {
    return "maybe";
  }
  return "ok";
}

export function WeekBoard({
  weekStart,
  now,
  screenMode,
  isLoggedIn,
  slotByKey,
  googleEvents,
  onWeekCellClick,
}: Props) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <section className="tsu-week-board">
      <div className="tsu-week-head">
        <div className="tsu-time-head" />
        {days.map((day) => (
          <div className="tsu-day-head" key={dateKey(day)}>
            <span>{WEEKDAY_SHORT[day.getDay()]}</span>
            <strong className={sameDay(day, now) ? "today" : ""}>{day.getDate()}</strong>
          </div>
        ))}
      </div>
      <div className="tsu-week-grid">
        <div className="tsu-time-col">
          {Array.from({ length: HOURS }, (_, hourOffset) => (
            <div key={hourOffset} className="tsu-time-cell">
              {`${START_HOUR + hourOffset}:00`}
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dayEvents = googleEvents.filter((event) => sameDay(event.start, day));

          return (
            <div className="tsu-day-col" key={dateKey(day)}>
              {Array.from({ length: HOURS }, (_, hourOffset) => {
                const hour = START_HOUR + hourOffset;
                const key = `${dateKey(day)}-${hour}`;
                const slot = slotByKey.get(`${dateKey(day)}-${hour}-${hour + 1}`);
                const statusClass = slot ? slotStatusClass(slot) : "";

                return (
                  <button
                    key={key}
                    className={`tsu-hour-cell ${slot ? `has-slot ${statusClass}` : ""}`}
                    onClick={() => onWeekCellClick(day, hour)}
                    type="button"
                  >
                    {slot ? (
                      <>
                        <span>{`${timeLabel(slot.start)} - ${timeLabel(slot.end)}`}</span>
                        {screenMode === "answer" && (
                          <span className="tsu-status">{slotStatusLabel(slot)}</span>
                        )}
                      </>
                    ) : (
                      screenMode === "create" && <span className="tsu-add">+ 追加</span>
                    )}
                  </button>
                );
              })}
              {isLoggedIn && <GoogleEventLayer events={dayEvents} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
