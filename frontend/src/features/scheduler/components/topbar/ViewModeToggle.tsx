import type { ViewMode } from "../../model/types";

type Props = {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
};

export function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div className="tsu-toggle" role="tablist" aria-label="表示モード">
      <button
        className={value === "week" ? "active" : ""}
        onClick={() => onChange("week")}
        type="button"
      >
        週
      </button>
      <button
        className={value === "month" ? "active" : ""}
        onClick={() => onChange("month")}
        type="button"
      >
        月
      </button>
    </div>
  );
}
