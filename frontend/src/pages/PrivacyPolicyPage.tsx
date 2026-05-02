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
              <h2 className="text-lg font-semibold">
                3. 第三者提供
              </h2>
              <p>
                本サービスは、以下の場合を除き、個人情報およびGoogleユーザーデータを第三者に提供しません。
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>本人の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命・身体・財産の保護に必要な場合</li>
              </ul>
              <p>
                なお、本サービスはGoogleアカウントによるログイン・Googleカレンダー連携を通じて取得したデータを、
                第三者に販売・貸与・共有することはありません。また、本サービスにおけるGoogleユーザーデータの利用は、
                サービスの提供に直接必要な目的に限定されます。
              </p>
              <p>
                サービス運営上、以下の業務委託先（インフラ事業者等）にデータが処理される場合があります。
                これらの事業者は、本サービスの提供に必要な範囲においてのみデータを取り扱い、
                その他の目的での利用は禁止されています。
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>ホスティング・インフラ事業者（例: Vercel, Supabase 等）</li>
                <li>その他、サービス運営に必要なシステム事業者</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                4. 外部サービスの利用
              </h2>
              <p>
                本サービスでは、認証および機能提供のために以下の外部サービスを利用しています。
                各サービスで取得するデータ・利用目的・第三者提供の有無は以下のとおりです。
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Googleログイン（OAuth 2.0認証）</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-medium">取得データ:</span> ユーザーID、メールアドレス、プロフィール情報（名前・アイコン）</li>
                    <li><span className="font-medium">利用目的:</span> ユーザー認証およびアカウント管理</li>
                    <li><span className="font-medium">第三者提供:</span> なし（上記インフラ事業者による処理を除く）</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Googleカレンダー連携</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-medium">取得データ:</span> カレンダーの予定情報（タイトル、日時等）</li>
                    <li><span className="font-medium">利用目的:</span> 日程調整機能における空き時間の確認・表示</li>
                    <li><span className="font-medium">取得条件:</span> ユーザーが明示的に許可した場合のみ</li>
                    <li><span className="font-medium">第三者提供:</span> なし（上記インフラ事業者による処理を除く）</li>
                  </ul>
                </div>
              </div>

              <p>
                本サービスにおけるGoogle APIから取得したデータの利用は、
                <a href="https://developers.google.com/terms/api-services-user-data-policy" className="underline underline-offset-4 hover:opacity-70" target="_blank" rel="noopener noreferrer">
                  Google API サービスのユーザーデータに関するポリシー
                </a>
                （Limited Use要件を含む）に準拠します。
              </p>
              <p>
                各サービスは、それぞれのプライバシーポリシーに基づいてデータを取り扱います。
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