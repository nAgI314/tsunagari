import { useEffect, useMemo, useState } from "react";
import type { ScheduleEvent, ScheduleResponse } from "../../../../../shared/src";
import { EventNotFoundError, getEventByLinkId, listEventResponsesByLinkId } from "@/api";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { timeLabel } from "@/features/scheduler/utils/date";

type Props = {
  linkId: string;
};

type FetchStatus = "loading" | "ready" | "not-found" | "error";

const STATUS_LABEL: Record<string, string> = {
  ok: "○",
  maybe: "△",
  ng: "×",
};

export function EventResultsPage({ linkId }: Props) {
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [responses, setResponses] = useState<ScheduleResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setStatus("loading");
        setError(null);
        const [eventResult, responsesResult] = await Promise.all([
          getEventByLinkId(linkId),
          listEventResponsesByLinkId(linkId),
        ]);
        if (!active) {
          return;
        }
        setEvent(eventResult.event);
        setResponses(responsesResult.responses);
        setStatus("ready");
      } catch (err) {
        if (!active) {
          return;
        }
        if (err instanceof EventNotFoundError) {
          setStatus("not-found");
          return;
        }
        setStatus("error");
        setError(err instanceof Error ? err.message : "回答一覧の取得に失敗しました。");
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [linkId]);

  const candidateLabelById = useMemo(() => {
    if (!event) {
      return new Map<string, string>();
    }
    return new Map(
      event.candidates.map((candidate) => {
        const start = new Date(candidate.start);
        const end = new Date(candidate.end);
        const day = `${start.getMonth() + 1}/${start.getDate()}`;
        return [candidate.id, `${day} ${timeLabel(start)} - ${timeLabel(end)}`];
      }),
    );
  }, [event]);

  if (status === "not-found") {
    return <NotFoundPage />;
  }
  if (status === "loading") {
    return (
      <main className="min-h-[70svh] flex items-center justify-center px-6 text-sm text-muted-foreground">
        読み込み中...
      </main>
    );
  }
  if (status === "error" || !event) {
    return (
      <main className="min-h-[70svh] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">読み込みに失敗しました</h1>
        <p className="text-sm text-muted-foreground">{error ?? "時間をおいて再度お試しください。"}</p>
      </main>
    );
  }

  return (
    <main className="tsu-root">
      <section className="tsu-topbar">
        <div className="tsu-brand">
          <span className="tsu-brand-name">回答一覧</span>
          <span className="tsu-gcal-pill">{event.title}</span>
        </div>
        <a className="tsu-today-button" href={`/event/${linkId}`}>
          回答ページへ
        </a>
      </section>

      <section className="tsu-panel">
        <h2>
          回答一覧 <small>{responses.length}件</small>
        </h2>
        {responses.length === 0 ? (
          <p className="tsu-response-description">まだ回答はありません。</p>
        ) : (
          <div className="tsu-results-list">
            {responses.map((response) => (
              <article className="tsu-results-item" key={response.id}>
                <header className="tsu-results-head">
                  <strong>{response.responderName}</strong>
                  <span>{new Date(response.createdAt).toLocaleString()}</span>
                </header>
                {response.comment && <p className="tsu-response-description">{response.comment}</p>}
                <ul className="tsu-results-answers">
                  {response.answers.map((answer) => (
                    <li key={`${response.id}-${answer.candidateId}`}>
                      <span>{candidateLabelById.get(answer.candidateId) ?? answer.candidateId}</span>
                      <strong>{STATUS_LABEL[answer.status] ?? "-"}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
