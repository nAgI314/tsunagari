type Props = {
  label: string;
  hint: string;
};

export function PeriodBar({ label, hint }: Props) {
  return (
    <div className="tsu-period-bar">
      <strong>{label}</strong>
      <span>{hint}</span>
    </div>
  );
}
