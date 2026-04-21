import type { ScreenMode } from "../../model/types";

type Props = {
  value: ScreenMode;
  onChange: (next: ScreenMode) => void;
};

export function ScreenModeToggle({ value, onChange }: Props) {
  return (
    <div className="tsu-toggle" role="tablist" aria-label="画面モード">
      <button
        className={value === "create" ? "active" : ""}
        onClick={() => onChange("create")}
        type="button"
      >
        作成
      </button>
      {/* <button
        className={value === "answer" ? "active" : ""}
        onClick={() => onChange("answer")}
        type="button"
      >
        回答
      </button> */}
    </div>
  );
}
