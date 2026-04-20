import type { ReactNode } from "react";
import type { AnswerStatus, CandidateSlot, ScreenMode } from "../../model/types";
import { AnswerChoiceButtons } from "../common/AnswerChoiceButtons";

type Props = {
  candidateSlots: CandidateSlot[];
  screenMode: ScreenMode;
  slotSummaryLabel: (slot: CandidateSlot) => ReactNode;
  onSlotClick: (slot: CandidateSlot) => void;
  getSlotAnswer?: (slot: CandidateSlot) => AnswerStatus | undefined;
  onSelectSlotAnswer?: (slotId: string, status: AnswerStatus) => void;
  className?: string;
};

function slotStatusLabel(
  slot: CandidateSlot,
  screenMode: ScreenMode,
  getSlotAnswer?: (slot: CandidateSlot) => AnswerStatus | undefined,
): string {
  const answer = getSlotAnswer ? getSlotAnswer(slot) : slot.answer;
  if (screenMode !== "answer") {
    return "候補";
  }
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
  slot: CandidateSlot,
  screenMode: ScreenMode,
  getSlotAnswer?: (slot: CandidateSlot) => AnswerStatus | undefined,
): "ok" | "maybe" | "ng" | "pending" {
  const answer = getSlotAnswer ? getSlotAnswer(slot) : slot.answer;
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

export function CandidateSlotPanel({
  candidateSlots,
  screenMode,
  slotSummaryLabel,
  onSlotClick,
  getSlotAnswer,
  onSelectSlotAnswer,
  className,
}: Props) {
  return (
    <section className={`tsu-panel ${className ?? ""}`}>
      <h2>
        候補日時 <small>{candidateSlots.length}件</small>
      </h2>
      <div className="tsu-slot-list">
        {candidateSlots
          .slice()
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .map((slot) => (
            <button
              key={slot.id}
              className={`tsu-slot-item ${slotStatusClass(slot, screenMode, getSlotAnswer)}`}
              onClick={() => onSlotClick(slot)}
              type="button"
            >
              <span className="tsu-slot-label">{slotSummaryLabel(slot)}</span>
              {screenMode === "answer" && onSelectSlotAnswer ? (
                <AnswerChoiceButtons
                  onSelect={(status) => onSelectSlotAnswer(slot.id, status)}
                  value={getSlotAnswer ? getSlotAnswer(slot) : slot.answer}
                />
              ) : (
                <strong>{slotStatusLabel(slot, screenMode, getSlotAnswer)}</strong>
              )}
            </button>
          ))}
      </div>
    </section>
  );
}
