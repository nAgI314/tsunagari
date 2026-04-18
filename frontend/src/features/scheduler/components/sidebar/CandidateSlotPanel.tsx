import type { CandidateSlot, ScreenMode } from "../../model/types";

type Props = {
  candidateSlots: CandidateSlot[];
  screenMode: ScreenMode;
  slotSummaryLabel: (slot: CandidateSlot) => string;
  onSlotClick: (slot: CandidateSlot) => void;
};

function slotStatusLabel(slot: CandidateSlot, screenMode: ScreenMode): string {
  if (screenMode !== "answer") {
    return "候補";
  }
  if (slot.answer === "ng") {
    return "NG";
  }
  if (slot.answer === "maybe") {
    return "未定";
  }
  return "OK";
}

export function CandidateSlotPanel({
  candidateSlots,
  screenMode,
  slotSummaryLabel,
  onSlotClick,
}: Props) {
  return (
    <section className="tsu-panel">
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
              className={`tsu-slot-item ${slot.answer ?? "ok"}`}
              onClick={() => onSlotClick(slot)}
              type="button"
            >
              <span>{slotSummaryLabel(slot)}</span>
              <strong>{slotStatusLabel(slot, screenMode)}</strong>
            </button>
          ))}
      </div>
    </section>
  );
}
