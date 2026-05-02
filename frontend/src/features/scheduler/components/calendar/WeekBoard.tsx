import { useState } from "react";
import type { DragEvent, MouseEvent } from "react";
import { HOUR_HEIGHT, HOURS, START_HOUR, WEEKDAY_SHORT } from "../../model/constants";
import type { AnswerStatus, CandidateSlot, GoogleEvent, ScreenMode } from "../../model/types";
import { addDays, dateKey, sameDay, timeLabel } from "../../utils/date";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnswerChoiceButtons } from "../common/AnswerChoiceButtons";
import { GoogleEventLayer } from "./GoogleEventLayer";

let transparentDragCanvas: HTMLCanvasElement | null = null;
function getTransparentDragCanvas(): HTMLCanvasElement {
  if (transparentDragCanvas) {
    return transparentDragCanvas;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx?.clearRect(0, 0, 1, 1);
  transparentDragCanvas = canvas;
  return canvas;
}

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
  onShiftCandidateSlotByMinutes: (slotId: string, diffMinutes: number) => void;
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
  onShiftCandidateSlotByMinutes,
  getSlotAnswer,
  onSelectSlotAnswer,
}: Props) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [dragGrabOffsetPx, setDragGrabOffsetPx] = useState(0);
  const [dragPreview, setDragPreview] = useState<{
    dayKey: string;
    top: number;
    height: number;
    start: Date;
    end: Date;
  } | null>(null);

  const draggedSlot = draggingSlotId
    ? Array.from(slotByKey.values()).find((slot) => slot.id === draggingSlotId) ?? null
    : null;
  const draggedDurationMinutes = draggedSlot
    ? (draggedSlot.end.getTime() - draggedSlot.start.getTime()) / (1000 * 60)
    : 0;
  const draggedHeightPx = draggedSlot ? toHeightPx(draggedSlot.start, draggedSlot.end) : 0;

  const getDropPosition = (clientY: number, columnTop: number) => {
    const offsetFromTop = clientY - columnTop - dragGrabOffsetPx;
    const maxY = HOURS * HOUR_HEIGHT - draggedHeightPx;
    const clampedY = Math.max(0, Math.min(maxY, offsetFromTop));
    const totalMinutes = (clampedY / HOUR_HEIGHT) * 60;
    const snappedMinutes = Math.floor(totalMinutes / 5) * 5;
    const snappedTop = (snappedMinutes / 60) * HOUR_HEIGHT;
    const hour = START_HOUR + Math.floor(snappedMinutes / 60);
    const minute = snappedMinutes % 60;
    return { hour, minute, top: snappedTop };
  };

  const buildDragPreviewRange = (day: Date, hour: number, minute: number) => {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute, 0, 0);
    const end = new Date(start.getTime() + draggedDurationMinutes * 60 * 1000);
    return { start, end };
  };

  const onDayDrop = (event: DragEvent<HTMLDivElement>, day: Date) => {
    if (!draggingSlotId || screenMode !== "create") {
      return;
    }

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const { hour, minute } = getDropPosition(event.clientY, rect.top);
    onMoveCandidateSlot(draggingSlotId, day, hour, minute);
    setDraggingSlotId(null);
    setDragGrabOffsetPx(0);
    setDragPreview(null);
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
          const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
          const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 0, 0);
          const dayEvents = googleEvents.filter(
            (event) => event.start.getTime() < dayEnd.getTime() && event.end.getTime() > dayStart.getTime(),
          );
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
                if (!draggingSlotId || !draggedSlot) {
                  return;
                }
                const { hour, minute, top } = getDropPosition(
                  event.clientY,
                  event.currentTarget.getBoundingClientRect().top,
                );
                const { start, end } = buildDragPreviewRange(day, hour, minute);
                setDragPreview({
                  dayKey: dateKey(day),
                  top,
                  height: draggedHeightPx,
                  start,
                  end,
                });
              }}
              onDrop={(event) => onDayDrop(event, day)}
            >
              {Array.from({ length: HOURS }, (_, hourOffset) => {
                const hour = START_HOUR + hourOffset;
                return (
                  <button
                    key={`${dateKey(day)}-${hour}`}
                    className="tsu-hour-cell"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => onWeekCellClick(day, hour, minuteFromClick(event))}
                    tabIndex={-1}
                    type="button"
                  />
                );
              })}
              <div className="tsu-hour-tail" />
              <div className="tsu-slot-layer" aria-hidden>
                {dragPreview?.dayKey === dateKey(day) && (
                  <div
                    className="tsu-drag-preview"
                    style={{
                      top: dragPreview.top,
                      height: dragPreview.height,
                    }}
                  >
                    <span className="tsu-drag-preview-time">{`${timeLabel(dragPreview.start)} - ${timeLabel(
                      dragPreview.end,
                    )}`}</span>
                  </div>
                )}
                {daySlots.map((slot) => (
                  (() => {
                    const answer = getSlotAnswer ? getSlotAnswer(slot) : slot.answer;
                    const slotHeight = toHeightPx(slot.start, slot.end);
                    const useHorizontalShiftButtons = slotHeight < 56;
                    const usePopupAnswerMenu =
                      screenMode === "answer" && !!onSelectSlotAnswer && slotHeight < 44;

                    return (
                      <article
                        key={slot.id}
                        className={`tsu-candidate-slot ${slotStatusClass(answer, screenMode)} ${
                          screenMode === "answer" && onSelectSlotAnswer && !usePopupAnswerMenu
                            ? "answer-layout"
                            : ""
                        }${screenMode === "answer" && usePopupAnswerMenu ? " popup-status" : ""}`}
                        draggable={screenMode === "create"}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", slot.id);
                          event.dataTransfer.setDragImage(getTransparentDragCanvas(), 0, 0);
                          setDraggingSlotId(slot.id);
                          setDragGrabOffsetPx(event.nativeEvent.offsetY);
                          setDragPreview({
                            dayKey: dateKey(day),
                            top: toTopPx(dayBase, slot.start),
                            height: toHeightPx(slot.start, slot.end),
                            start: slot.start,
                            end: slot.end,
                          });
                        }}
                        onDragEnd={() => {
                          setDraggingSlotId(null);
                          setDragGrabOffsetPx(0);
                          setDragPreview(null);
                        }}
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
                          {screenMode === "create" && (
                            <div
                              className={`tsu-slot-shift-controls ${
                                useHorizontalShiftButtons ? "horizontal" : "vertical"
                              }`}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Button
                                aria-label="候補を5分前に移動"
                                className="tsu-slot-shift"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onShiftCandidateSlotByMinutes(slot.id, -5);
                                }}
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                                type="button"
                                variant="ghost"
                              >
                                <ChevronUp size={12} />
                              </Button>
                              <Button
                                aria-label="候補を5分後に移動"
                                className="tsu-slot-shift"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onShiftCandidateSlotByMinutes(slot.id, 5);
                                }}
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                                type="button"
                                variant="ghost"
                              >
                                <ChevronDown size={12} />
                              </Button>
                            </div>
                          )}
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
              {isLoggedIn && <GoogleEventLayer events={dayEvents} dayStart={dayStart} dayEnd={dayEnd} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
