import { END_HOUR, HOUR_HEIGHT, START_HOUR } from "../../model/constants";
import type { GoogleEvent } from "../../model/types";
import { timeLabel } from "../../utils/date";

type Props = {
  events: GoogleEvent[];
  dayStart: Date;
  dayEnd: Date;
};

export function GoogleEventLayer({ events, dayStart, dayEnd }: Props) {
  const visibleStart = new Date(
    dayStart.getFullYear(),
    dayStart.getMonth(),
    dayStart.getDate(),
    START_HOUR,
    0,
    0,
    0,
  );
  const visibleEnd = new Date(
    dayStart.getFullYear(),
    dayStart.getMonth(),
    dayStart.getDate(),
    END_HOUR,
    0,
    0,
    0,
  );

  return (
    <>
      {events.map((event) => {
        const clippedStart = new Date(
          Math.max(event.start.getTime(), dayStart.getTime(), visibleStart.getTime()),
        );
        const clippedEnd = new Date(Math.min(event.end.getTime(), dayEnd.getTime(), visibleEnd.getTime()));
        if (clippedEnd.getTime() <= clippedStart.getTime()) {
          return null;
        }

        const startHour = clippedStart.getHours() - START_HOUR;
        const durationMinutes = (clippedEnd.getTime() - clippedStart.getTime()) / (1000 * 60);
        const duration = durationMinutes / 60;

        return (
          <article
            key={event.id}
            className="tsu-gcal-event"
            style={{
              top: startHour * HOUR_HEIGHT + (clippedStart.getMinutes() / 60) * HOUR_HEIGHT,
              height: Math.max(26, duration * HOUR_HEIGHT),
            }}
          >
            <strong>{event.title}</strong>
            <span>{`${timeLabel(clippedStart)} - ${timeLabel(clippedEnd)}`}</span>
          </article>
        );
      })}
    </>
  );
}
