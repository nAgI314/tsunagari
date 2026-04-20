export function UsagePanel() {
  return (
    <section className="tsu-panel compact">
      <h2>使い方</h2>
      <ul>
        <li>週表示: 左右スクロールで前後の週を探索</li>
        <li>月表示: 上下スクロールで前後の月を探索</li>
        <li>作成モード: 1時間枠内のクリック位置から5分刻みで候補を追加/削除</li>
        <li>作成済み候補: 右上の✕で削除、ドラッグで時刻/日付を移動</li>
        <li>候補の長さ: 5分刻みのポップオーバーからスクロール選択</li>
        <li>回答モード: クリックで `OK -&gt; 未定 -&gt; NG` を切り替え</li>
        <li>「今日に戻る」で現在の日付へ移動</li>
        <li>Googleログイン後は予定を重ね表示</li>
      </ul>
    </section>
  );
}
