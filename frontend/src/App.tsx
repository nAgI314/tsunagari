import { type FormEvent, useMemo, useState } from "react";
import { createEvent } from "./api";
import DevPage from "./DevPage";
import "./App.css";

const toIso = (value: string): string => new Date(value).toISOString();

function EventPage() {
  const [title, setTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [createdLinkId, setCreatedLinkId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      title.trim().length > 0 &&
      organizerName.trim().length > 0 &&
      start.length > 0 &&
      end.length > 0 &&
      new Date(start).getTime() < new Date(end).getTime(),
    [title, organizerName, start, end],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("入力内容を確認してください。");
      return;
    }

    setSubmitting(true);
    setError(null);
    setCreatedLinkId(null);

    try {
      const response = await createEvent({
        title,
        organizerName,
        candidates: [{ start: toIso(start), end: toIso(end) }],
      });
      setCreatedLinkId(response.event.linkId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "作成に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container">
      <h1>日程調整リンク作成</h1>
      <form className="form" onSubmit={onSubmit}>
        <label>
          タイトル
          <input
            aria-label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="初回打ち合わせ"
          />
        </label>
        <label>
          主催者名
          <input
            aria-label="主催者名"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            placeholder="Yamada"
          />
        </label>
        <label>
          候補開始
          <input
            aria-label="候補開始"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          候補終了
          <input
            aria-label="候補終了"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "作成中..." : "リンクを作成"}
        </button>
      </form>

      {createdLinkId && <p role="status">作成完了: /event/{createdLinkId}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}

function App() {
  const pathname = window.location.pathname;
  const isDevRoute = pathname === "/dev";
  const isDevPageEnabled =
    import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_PAGE === "true";

  if (isDevRoute) {
    if (!isDevPageEnabled) {
      return (
        <main className="container">
          <h1>Not Found</h1>
        </main>
      );
    }
    return <DevPage />;
  }

  return <EventPage />;
}

export default App;
