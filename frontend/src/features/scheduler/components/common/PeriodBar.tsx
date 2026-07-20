import { useState, useRef, useEffect } from "react";
import type { CalendarInfo } from "../../hooks/useGoogleCalendarEvents";
import { Calendar, Check, Loader2 } from "lucide-react";

type Props = {
  label: string;
  hint: string;
  onJumpToToday: () => void;
  calendars: CalendarInfo[];
  onToggleCalendar: (id: string) => void;
  loadingCalendars: boolean;
};

export function PeriodBar({
  label,
  hint,
  onJumpToToday,
  calendars,
  onToggleCalendar,
  loadingCalendars,
}: Props) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const showCalendarButton = loadingCalendars || calendars.length > 0;

  return (
    <div className="tsu-period-bar">
      <div className="tsu-period-main">
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <div className="tsu-period-actions" ref={popoverRef}>
        {showCalendarButton && (
          <div className="tsu-calendar-picker-wrap">
            <button
              className={`tsu-today-button tsu-calendar-picker-trigger ${open ? "active" : ""}`}
              disabled={loadingCalendars}
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
              {loadingCalendars ? (
                <Loader2 size={14} className="tsu-calendar-picker-spinner" />
              ) : (
                <Calendar size={14} />
              )}
              表示するカレンダー
            </button>
            {open && (
              <div className="tsu-calendar-picker-popover">
                {loadingCalendars ? (
                  <div className="tsu-calendar-picker-loading">
                    <Loader2 size={16} className="tsu-calendar-picker-spinner" />
                    <span>カレンダーをロード中</span>
                  </div>
                ) : (
                  calendars.map((calendar) => (
                    <button
                      key={calendar.id}
                      className={`tsu-calendar-picker-item ${calendar.selected ? "selected" : ""}`}
                      onClick={() => onToggleCalendar(calendar.id)}
                      type="button"
                    >
                      <span className="tsu-calendar-picker-checkbox">
                        {calendar.selected && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="tsu-calendar-picker-name">{calendar.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        <button className="tsu-today-button" onClick={onJumpToToday} type="button">
          今日に戻る
        </button>
      </div>
    </div>
  );
}
