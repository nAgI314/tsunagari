import type { ReactNode } from "react";
import { SiteFooter } from "@/app/SiteFooter";

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
      {footer ? <footer className="tsu-footer">{footer}</footer> : null}
      <footer className="tsu-site-footer">
        <SiteFooter />
      </footer>
    </main>
  );
}
