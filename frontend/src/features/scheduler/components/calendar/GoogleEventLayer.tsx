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
        const start = event.start.getHours() - START_HOUR;
        const duration =
          event.end.getHours() - event.start.getHours() + event.end.getMinutes() / 60;

        return (
          <article
            key={event.id}
            className="tsu-gcal-event"
            style={{
              top: start * HOUR_HEIGHT + (event.start.getMinutes() / 60) * HOUR_HEIGHT,
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
