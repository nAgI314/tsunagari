export function PrivacyPolicyPage() {
  return (
    <main className="min-h-[100svh] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* 枠 */}
        <div className="rounded-2xl border border-border p-8 sm:p-10">
          
          {/* ヘッダー */}
          <header className="mb-12 text-left">
            <h1 className="text-3xl font-semibold tracking-tight">
              プライバシーポリシー
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              最終更新日: 2026年4月23日
            </p>
          </header>

          {/* 本文 */}
          <div className="space-y-12 text-sm leading-7 text-muted-foreground text-left">
            
            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                1. 取得する情報
              </h2>
              <p>本サービスでは、以下の情報を取得します。</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>イベント作成・日程調整に関する情報（タイトル、日程候補、回答内容など）</li>
                <li>利用状況に関する情報（アクセスログ、操作履歴、IPアドレス等）</li>
                <li>お問い合わせ時に提供される情報</li>
              </ul>
              <p>
                また、Googleアカウントによるログインを利用する場合、認証のために必要な情報（ユーザーID、メールアドレス等）および、
                ユーザーの同意に基づきGoogleカレンダーの予定情報を取得することがあります。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                2. 利用目的
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>日程調整機能の提供（イベント作成、共有、回答の集計）</li>
                <li>ユーザー認証およびアカウント管理</li>
                <li>サービスの改善および新機能の開発</li>
                <li>不正利用の防止およびセキュリティ対策</li>
                <li>必要に応じたユーザーへの連絡</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                3. 第三者提供
              </h2>
              <p>
                本サービスは、以下の場合を除き、個人情報を第三者に提供しません。
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>本人の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命・身体・財産の保護に必要な場合</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                4. 外部サービスの利用
              </h2>
              <p>
                本サービスでは、認証および機能提供のために外部サービスを利用しています。
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Googleログイン（OAuth認証）</li>
                <li>Googleカレンダー連携（ユーザー許可時のみ）</li>
              </ul>
              <p>
                これらのサービスは各提供元のプライバシーポリシーに基づいてデータを取り扱います。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                5. 保存期間
              </h2>
              <p>
                取得した情報は、利用目的に必要な期間のみ保持し、不要となった場合は適切な方法で削除します。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                6. セキュリティ
              </h2>
              <p>
                本サービスは、個人情報の漏えい、滅失、改ざんを防ぐために合理的な安全対策を講じます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                7. ユーザーの権利
              </h2>
              <p>
                ユーザーは、自身の情報について、開示・訂正・削除を求めることができます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                8. ポリシーの変更
              </h2>
              <p>
                本ポリシーは、必要に応じて変更されることがあります。変更後の内容は本ページに掲載した時点で効力を生じます。
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold  ">
                9. お問い合わせ
              </h2>
              <p>
                本ポリシーに関するお問い合わせは、サービス管理者までご連絡ください。
              </p>
            </section>

          </div>

          {/* フッター */}
          <div className="mt-16 text-left">
            <a
              className="text-sm underline underline-offset-4 hover:opacity-70"
              href="/"
            >
              トップに戻る
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}