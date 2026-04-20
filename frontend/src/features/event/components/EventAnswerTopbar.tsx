import type { ViewMode } from "@/features/scheduler/model/types";
import { ViewModeToggle } from "@/features/scheduler/components/topbar/ViewModeToggle";

type Props = {
  viewMode: ViewMode;
  isLoggedIn: boolean;
  onViewModeChange: (next: ViewMode) => void;
  onToggleLogin: () => void;
};

export function EventAnswerTopbar({ viewMode, isLoggedIn, onViewModeChange, onToggleLogin }: Props) {
  return (
    <header className="tsu-topbar">
      <div className="tsu-brand">
        <span className="tsu-brand-name">Tsunagari</span>
        <span className="tsu-gcal-pill">回答ページ</span>
      </div>
      <div className="tsu-top-controls">
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        <button className="tsu-login" onClick={onToggleLogin} type="button">
          {isLoggedIn ? "Googleでログイン済み" : "Googleでログイン"}
        </button>
      </div>
    </header>
  );
}
