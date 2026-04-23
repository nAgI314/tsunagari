export function SiteFooter() {
  const privacyPolicyHref = "/privacy-policy";
  const termsHref = "/terms";

  return (
    <div className="tsu-footer-meta">
      <div>Created by nagi</div>
      <div className="tsu-footer-row">
        <span className="tsu-footer-label">プライバシーポリシー：</span>
        <a className="tsu-footer-link" href={privacyPolicyHref}>
          {import.meta.env.VITE_PUBLIC_APP_ORIGIN + privacyPolicyHref}
        </a>
      </div>
      <div className="tsu-footer-row">
        <span className="tsu-footer-label">利用規約：</span>
        <a className="tsu-footer-link" href={termsHref}>
          {import.meta.env.VITE_PUBLIC_APP_ORIGIN + termsHref}
        </a>
      </div>
    </div>
  );
}
