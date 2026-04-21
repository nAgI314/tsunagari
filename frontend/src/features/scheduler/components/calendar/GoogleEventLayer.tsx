import { HOUR_HEIGHT, START_HOUR } from "../../model/constants";
import type { GoogleEvent } from "../../model/types";
import { timeLabel } from "../../utils/date";

type Props = {
  events: GoogleEvent[];
};

export function GoogleEventLayer({ events }: Props) {
  return (
    <>
      {events.map((event) => {
        const startHour = event.start.getHours() - START_HOUR;
        const durationMinutes = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
        const duration = durationMinutes / 60;

        return (
          <article
            key={event.id}
            className="tsu-gcal-event"
            style={{
              top: startHour * HOUR_HEIGHT + (event.start.getMinutes() / 60) * HOUR_HEIGHT,
              height: Math.max(26, duration * HOUR_HEIGHT),
            }}
          >
            <strong>{event.title}</strong>
            <span>{`${timeLabel(event.start)} - ${timeLabel(event.end)}`}</span>
          </article>
        );
      })}
    </>
  );
}
