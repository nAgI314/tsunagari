type Props = {
  label: string;
  hint: string;
  onJumpToToday: () => void;
};

export function PeriodBar({ label, hint, onJumpToToday }: Props) {
  return (
    <div className="tsu-period-bar">
      <div className="tsu-period-main">
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <button className="tsu-today-button" onClick={onJumpToToday} type="button">
        今日に戻る
      </button>
    </div>
  );
}
