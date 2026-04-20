import type { ReactNode } from "react";

type Props = {
  topbar: ReactNode;
  body: ReactNode;
  footer?: ReactNode;
};

export function AppShell({ topbar, body, footer }: Props) {
  return (
    <main className="tsu-root">
      {topbar}
      {body}
      <footer className="tsu-footer">{footer}</footer>
    </main>
  );
}
