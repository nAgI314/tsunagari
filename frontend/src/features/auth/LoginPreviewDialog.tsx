type LoginPreviewDialogProps = {
  onClose: () => void;
  onLogin: () => void;
};

export function LoginPreviewDialog({ onClose, onLogin }: LoginPreviewDialogProps) {
  return (
    <div className="tsu-dialog-overlay" onClick={onClose}>
      <div
        className="tsu-dialog-content tsu-login-preview-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="tsu-dialog-title">Googleでログインすると便利です</h2>
        <p className="tsu-dialog-hint">
          Googleカレンダー連携で、予定の重複を自動チェックできます
        </p>

        <div className="tsu-login-preview-videos">
          <div className="tsu-login-preview-item">
            <video
              className="tsu-login-preview-video"
              src="/videos/make_nittyou.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            <p className="tsu-login-preview-caption">
              予定を作る時：カレンダーを見ながら候補を作れます。
            </p>
          </div>
          <div className="tsu-login-preview-item">
            <video
              className="tsu-login-preview-video"
              src="/videos/answer_nittyou.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            <p className="tsu-login-preview-caption">
              回答する時：自分の予定と重なっている候補日が一目でわかります
            </p>
          </div>
        </div>

        <div className="tsu-dialog-actions">
          <button
            className="tsu-dialog-btn tsu-dialog-btn-secondary"
            onClick={onClose}
            type="button"
          >
            キャンセル
          </button>
          <button
            className="tsu-dialog-btn tsu-dialog-btn-primary"
            onClick={onLogin}
            type="button"
          >
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
