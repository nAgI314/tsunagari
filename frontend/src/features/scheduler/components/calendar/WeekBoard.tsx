import type { MouseEvent } from "react";
import { HOUR_HEIGHT, HOURS, START_HOUR, WEEKDAY_SHORT } from "../../model/constants";
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
  onWeekCellClick: (day: Date, hour: number, minute: number) => void;
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

function toTopPx(base: Date, target: Date): number {
  const diffMinutes = (target.getTime() - base.getTime()) / (1000 * 60);
  return (diffMinutes / 60) * HOUR_HEIGHT;
}

function toHeightPx(start: Date, end: Date): number {
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return Math.max(16, (durationMinutes / 60) * HOUR_HEIGHT);
}

function minuteFromClick(event: MouseEvent<HTMLButtonElement>): number {
  const offsetY = event.nativeEvent.offsetY;
  const raw = Math.floor((offsetY / HOUR_HEIGHT) * 12) * 5;
  return Math.max(0, Math.min(55, raw));
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
        {days.map((day) => (
          <div className="tsu-day-head" key={dateKey(day)}>
            <span>{WEEKDAY_SHORT[day.getDay()]}</span>
            <strong className={sameDay(day, now) ? "today" : ""}>{day.getDate()}</strong>
          </div>
        ))}
      </div>
      <div className="tsu-week-grid">
        {days.map((day) => {
          const dayEvents = googleEvents.filter((event) => sameDay(event.start, day));
          const daySlots = slotByKey
            ? Array.from(slotByKey.values()).filter((slot) => sameDay(slot.start, day))
            : [];
          const dayBase = new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
            START_HOUR,
            0,
            0,
            0,
          );

          return (
            <div className="tsu-day-col" key={dateKey(day)}>
              {Array.from({ length: HOURS }, (_, hourOffset) => {
                const hour = START_HOUR + hourOffset;
                return (
                  <button
                    key={`${dateKey(day)}-${hour}`}
                    className="tsu-hour-cell"
                    onClick={(event) => onWeekCellClick(day, hour, minuteFromClick(event))}
                    type="button"
                  />
                );
              })}
              <div className="tsu-slot-layer" aria-hidden>
                {daySlots.map((slot) => (
                  <article
                    key={slot.id}
                    className={`tsu-candidate-slot ${slotStatusClass(slot)}`}
                    style={{
                      top: toTopPx(dayBase, slot.start),
                      height: toHeightPx(slot.start, slot.end),
                    }}
                  >
                    <span>{`${timeLabel(slot.start)} - ${timeLabel(slot.end)}`}</span>
                    {screenMode === "answer" && (
                      <span className="tsu-status">{slotStatusLabel(slot)}</span>
                    )}
                  </article>
                ))}
              </div>
              {isLoggedIn && <GoogleEventLayer events={dayEvents} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
