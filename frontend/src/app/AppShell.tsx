import type { ReactNode } from "react";

type Props = {
  topbar: ReactNode;
  body: ReactNode;
};

export function AppShell({ topbar, body }: Props) {
  return (
    <main className="tsu-root">
      {topbar}
      {body}
      <footer className="tsu-footer">
        <button type="button">日程調整リンクを作成</button>
      </footer>
    </main>
  );
}
