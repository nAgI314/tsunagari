import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  slotDurationMinutes: number;
  onSlotDurationChange: (minutes: number) => void;
};

export function EventInfoPanel({ slotDurationMinutes, onSlotDurationChange }: Props) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const durationOptions = useMemo(() => Array.from({ length: 72 }, (_, index) => (index + 1) * 5), []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!pickerRef.current) {
        return;
      }
      if (!pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <section className="tsu-panel">
      <h2>イベント情報</h2>
      <label>
        タイトル
        <Input defaultValue="チームキックオフ" />
      </label>
      <label>
        説明
        <Textarea defaultValue="Googleカレンダーの予定と重ねて候補日を調整します。" />
      </label>
      <label>
        回答期限
        <Input defaultValue="2026-04-30" />
      </label>
      <label>
        候補の長さ
        <div className="tsu-duration-picker" ref={pickerRef}>
          <Button
            className="w-full justify-start"
            onClick={() => setIsPickerOpen((prev) => !prev)}
            type="button"
            variant="outline"
          >
            {slotDurationMinutes}分
          </Button>
          {isPickerOpen && (
            <div className="tsu-duration-popover" role="listbox" aria-label="候補の長さ選択">
              {durationOptions.map((minutes) => (
                <Button
                  key={minutes}
                  className={`tsu-duration-option ${minutes === slotDurationMinutes ? "active" : ""}`}
                  onClick={() => {
                    onSlotDurationChange(minutes);
                    setIsPickerOpen(false);
                  }}
                  type="button"
                  variant="ghost"
                >
                  {minutes}分
                </Button>
              ))}
            </div>
          )}
        </div>
      </label>
    </section>
  );
}
