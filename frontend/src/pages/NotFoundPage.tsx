export function NotFoundPage() {
  return (
    <main className="min-h-[70svh] flex flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">ページが見つかりません</h1>
      <p className="max-w-xl text-sm text-muted-foreground">
        リンクが存在しないか、すでに無効になっている可能性があります。
      </p>
      <a className="text-sm underline underline-offset-4" href="/">
        トップに戻る
      </a>
    </main>
  );
}
