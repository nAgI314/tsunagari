export function UsagePanel() {
  return (
    <section className="tsu-panel compact">
      <h2>使い方</h2>
      <ul>
        <li>週表示: 左右スクロールで前後の週を探索</li>
        <li>月表示: 上下スクロールで前後の月を探索</li>
        <li>作成モード: カレンダーセルをクリックして候補を追加/削除</li>
        <li>回答モード: クリックで `OK -&gt; 未定 -&gt; NG` を切り替え</li>
        <li>Googleログイン後は予定を重ね表示</li>
      </ul>
    </section>
  );
}
