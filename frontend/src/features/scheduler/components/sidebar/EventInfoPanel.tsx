type Props = {
  slotDurationMinutes: number;
  onSlotDurationChange: (minutes: number) => void;
};

export function EventInfoPanel({ slotDurationMinutes, onSlotDurationChange }: Props) {
  return (
    <section className="tsu-panel">
      <h2>イベント情報</h2>
      <label>
        タイトル
        <input defaultValue="チームキックオフ" />
      </label>
      <label>
        説明
        <textarea defaultValue="Googleカレンダーの予定と重ねて候補日を調整します。" />
      </label>
      <label>
        回答期限
        <input defaultValue="2026-04-30" />
      </label>
      <label>
        候補の長さ
        <select
          value={slotDurationMinutes}
          onChange={(event) => onSlotDurationChange(Number(event.target.value))}
        >
          <option value={30}>30分</option>
          <option value={60}>60分</option>
          <option value={90}>90分</option>
        </select>
      </label>
    </section>
  );
}
