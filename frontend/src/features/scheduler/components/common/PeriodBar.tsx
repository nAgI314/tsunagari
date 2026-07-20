import { useState, useRef, useEffect } from "react";
import type { CalendarInfo } from "../../hooks/useGoogleCalendarEvents";
import { Calendar, Check } from "lucide-react";

type Props = {
  label: string;
  hint: string;
  onJumpToToday: () => void;
  calendars: CalendarInfo[];
  onToggleCalendar: (id: string) => void;
};

export function PeriodBar({
  label,
  hint,
  onJumpToToday,
  calendars,
  onToggleCalendar,
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

  return (
    <div className="tsu-period-bar">
      <div className="tsu-period-main">
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <div className="tsu-period-actions" ref={popoverRef}>
        {calendars.length > 0 && (
          <div className="tsu-calendar-picker-wrap">
            <button
              className={`tsu-today-button tsu-calendar-picker-trigger ${open ? "active" : ""}`}
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
              <Calendar size={14} />
              表示するカレンダー
            </button>
            {open && (
              <div className="tsu-calendar-picker-popover">
                {calendars.map((calendar) => (
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
                ))}
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
