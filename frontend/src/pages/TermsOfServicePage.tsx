export function TermsOfServicePage() {
  return (
    <main className="min-h-[100svh] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-border p-8 sm:p-10">
          <header className="mb-12 text-left">
            <h1 className="text-3xl font-semibold tracking-tight">利用規約</h1>
            <p className="mt-3 text-sm text-muted-foreground">最終更新日: 2026年4月23日</p>
          </header>

          <div className="space-y-12 text-sm leading-7 text-muted-foreground text-left">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">1. 適用</h2>
              <p>
                本規約は、Tsunagari（以下「本サービス」）の利用条件を定めるものです。利用者は本規約に同意した上で本サービスを利用するものとします。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">2. 提供内容</h2>
              <p>
                本サービスは、日程調整イベントの作成、共有、回答収集、回答結果の表示機能を提供します。運営者は必要に応じて機能の追加・変更・停止を行うことがあります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">3. アカウント連携</h2>
              <p>
                Googleアカウント連携を利用する場合、利用者はGoogleの利用条件および関連ポリシーにも従うものとします。連携解除は利用者の責任で行ってください。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">4. 禁止事項</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>法令または公序良俗に反する行為</li>
                <li>本サービスまたは第三者の権利・利益を侵害する行為</li>
                <li>不正アクセス、過度な負荷、運営妨害につながる行為</li>
                <li>虚偽情報の登録やなりすまし行為</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">5. データの取扱い</h2>
              <p>
                利用者が入力した情報の取扱いは、別途定めるプライバシーポリシーに従います。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">6. 免責事項</h2>
              <p>
                本サービスは現状有姿で提供され、運営者は本サービスの完全性・正確性・有用性・継続性を保証しません。本サービス利用により生じた損害について、運営者に故意または重過失がある場合を除き責任を負いません。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">7. サービス変更・停止</h2>
              <p>
                運営者は、保守、障害対応、法令対応その他必要がある場合、事前の通知なく本サービスの全部または一部を変更・停止できるものとします。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">8. 規約の変更</h2>
              <p>
                運営者は必要に応じて本規約を変更できます。変更後の規約は本ページに掲載した時点で効力を生じます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">9. 準拠法・管轄</h2>
              <p>
                本規約は日本法に準拠し、本サービスに関して紛争が生じた場合は運営者所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
          </div>

          <div className="mt-16 text-left">
            <a className="text-sm underline underline-offset-4 hover:opacity-70" href="/">
              トップに戻る
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
