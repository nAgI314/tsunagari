export function EventInfoPanel() {
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
    </section>
  );
}
