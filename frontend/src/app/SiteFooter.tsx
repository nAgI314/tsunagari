export function SiteFooter() {
  const privacyPolicyHref = "/privacy-policy";
  const termsHref = "/terms";
  const appOrigin = import.meta.env.VITE_PUBLIC_APP_ORIGIN?.trim();
  const privacyPolicyUrl = appOrigin ? new URL(privacyPolicyHref, appOrigin).toString() : privacyPolicyHref;
  const termsUrl = appOrigin ? new URL(termsHref, appOrigin).toString() : termsHref;

  return (
    <div className="tsu-footer-meta">
      <div>Created by nagi</div>
      <div className="tsu-footer-row">
        {/* <span className="tsu-footer-label">プライバシーポリシー：</span> */}
        <a className="tsu-footer-link" href={privacyPolicyHref} title={privacyPolicyUrl}>
          プライバシーポリシー
        </a>
      </div>
      <div className="tsu-footer-row">
        {/* <span className="tsu-footer-label">利用規約：</span> */}
        <a className="tsu-footer-link" href={termsHref} title={termsUrl}>
          利用規約
        </a>
      </div>
    </div>
  );
}
