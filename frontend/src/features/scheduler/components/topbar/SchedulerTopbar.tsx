import type { ScreenMode, ViewMode } from "../../model/types";
import { ScreenModeToggle } from "./ScreenModeToggle";
import { ViewModeToggle } from "./ViewModeToggle";

type Props = {
  viewMode: ViewMode;
  screenMode: ScreenMode;
  isLoggedIn: boolean;
  onViewModeChange: (next: ViewMode) => void;
  onScreenModeChange: (next: ScreenMode) => void;
  onToggleLogin: () => void;
};

export function SchedulerTopbar({
  viewMode,
  screenMode,
  isLoggedIn,
  onViewModeChange,
  onScreenModeChange,
  onToggleLogin,
}: Props) {
  return (
    <header className="tsu-topbar">
      <div className="tsu-brand">
        <span className="tsu-brand-name">Tsunagari</span>
        {/* <span className="tsu-gcal-pill">日程調整作成</span> */}
      </div>
      <div className="tsu-top-controls">
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        <ScreenModeToggle value={screenMode} onChange={onScreenModeChange} />
        <button className="tsu-login" onClick={onToggleLogin} type="button">
          {isLoggedIn ? "Googleでログイン済み" : "Googleでログイン"}
        </button>
      </div>
    </header>
  );
}
