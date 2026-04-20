import { useState } from "react";
import type { DragEvent, MouseEvent } from "react";
import { HOUR_HEIGHT, HOURS, START_HOUR, WEEKDAY_SHORT } from "../../model/constants";
import type { AnswerStatus, CandidateSlot, GoogleEvent, ScreenMode } from "../../model/types";
import { addDays, dateKey, sameDay, timeLabel } from "../../utils/date";
import { Button } from "@/components/ui/button";
import { AnswerChoiceButtons } from "../common/AnswerChoiceButtons";
import { GoogleEventLayer } from "./GoogleEventLayer";

type Props = {
  weekStart: Date;
  now: Date;
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

function slotStatusLabel(answer: AnswerStatus | undefined): string {
  if (answer === "ng") {
    return "NG";
  }
  if (answer === "maybe") {
    return "未定";
  }
  if (answer === "ok") {
    return "OK";
  }
  return "未回答";
}

function slotStatusClass(
  answer: AnswerStatus | undefined,
  screenMode: ScreenMode,
): "ok" | "maybe" | "ng" | "pending" {
  if (answer === "ng") {
    return "ng";
  }
  if (answer === "maybe") {
    return "maybe";
  }
  if (answer === "ok") {
    return "ok";
  }
  if (screenMode === "answer") {
    return "pending";
  }
  return "ok";
}

function toTopPx(base: Date, target: Date): number {
  const diffMinutes = (target.getTime() - base.getTime()) / (1000 * 60);
  return (diffMinutes / 60) * HOUR_HEIGHT;
}

function toHeightPx(start: Date, end: Date): number {
  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return Math.max(16, (durationMinutes / 60) * HOUR_HEIGHT - 7);
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
  onCandidateSlotClickById,
  onRemoveCandidateSlot,
  onMoveCandidateSlot,
  getSlotAnswer,
  onSelectSlotAnswer,
}: Props) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);

  const minuteFromOffsetY = (offsetY: number): number => {
    const raw = Math.floor((offsetY / HOUR_HEIGHT) * 12) * 5;
    return Math.max(0, Math.min(55, raw));
  };

  const onDayDrop = (event: DragEvent<HTMLDivElement>, day: Date) => {
    if (!draggingSlotId || screenMode !== "create") {
      return;
    }

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const clampedY = Math.max(0, Math.min(HOURS * HOUR_HEIGHT - 1, offsetY));
    const hour = START_HOUR + Math.floor(clampedY / HOUR_HEIGHT);
    const minute = minuteFromOffsetY(clampedY % HOUR_HEIGHT);
    onMoveCandidateSlot(draggingSlotId, day, hour, minute);
    setDraggingSlotId(null);
  };
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
            <div
              className="tsu-day-col"
              key={dateKey(day)}
              onDragOver={(event) => {
                if (screenMode !== "create") {
                  return;
                }
                event.preventDefault();
              }}
              onDrop={(event) => onDayDrop(event, day)}
            >
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
                  (() => {
                    const answer = getSlotAnswer ? getSlotAnswer(slot) : slot.answer;
                    const slotHeight = toHeightPx(slot.start, slot.end);
                    const usePopupAnswerMenu =
                      screenMode === "answer" && !!onSelectSlotAnswer && slotHeight < 44;

                    return (
                      <article
                        key={slot.id}
                        className={`tsu-candidate-slot ${slotStatusClass(answer, screenMode)} ${
                          screenMode === "answer" && onSelectSlotAnswer && !usePopupAnswerMenu
                            ? "answer-layout"
                            : ""
                        }`}
                        draggable={screenMode === "create"}
                        onDragStart={() => setDraggingSlotId(slot.id)}
                        onDragEnd={() => setDraggingSlotId(null)}
                        onClick={() => onCandidateSlotClickById(slot.id)}
                        style={{
                          top: toTopPx(dayBase, slot.start),
                          height: slotHeight,
                        }}
                      >
                        {screenMode === "create" && (
                          <Button
                            className="tsu-slot-delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              onRemoveCandidateSlot(slot.id);
                            }}
                            type="button"
                            variant="ghost"
                          >
                            ✕
                          </Button>
                        )}
                        <div className="tsu-slot-time-row">
                          <span className="tsu-slot-time">{`${timeLabel(slot.start)} - ${timeLabel(slot.end)}`}</span>
                          {screenMode === "answer" && usePopupAnswerMenu && (
                            <span className="tsu-status">{slotStatusLabel(answer)}</span>
                          )}
                        </div>
                        {screenMode === "answer" && (
                          <>
                            {!onSelectSlotAnswer && <span className="tsu-status">{slotStatusLabel(answer)}</span>}
                            {onSelectSlotAnswer && !usePopupAnswerMenu && (
                              <div className="tsu-slot-answer-row">
                                <AnswerChoiceButtons
                                  onSelect={(status) => onSelectSlotAnswer(slot.id, status)}
                                  value={answer}
                                    // className=""
                                />
                              </div>
                            )}
                            {onSelectSlotAnswer && usePopupAnswerMenu && (
                              <>
                                <div className="tsu-answer-popup" role="menu">
                                  <AnswerChoiceButtons
                                    onSelect={(status) => onSelectSlotAnswer(slot.id, status)}
                                    value={answer}
                                  />
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </article>
                    );
                  })()
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
