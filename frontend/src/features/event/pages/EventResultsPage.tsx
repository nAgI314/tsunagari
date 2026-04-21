import { useEffect, useMemo, useState } from "react";
import type { ScheduleEvent, ScheduleResponse } from "../../../../../shared/src";
import { EventNotFoundError, getEventByLinkId, listEventResponsesByLinkId } from "@/api";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { timeLabel } from "@/features/scheduler/utils/date";
import { Circle, Triangle, X } from "lucide-react";

type Props = {
  linkId: string;
};

type FetchStatus = "loading" | "ready" | "not-found" | "error";

type SlotStatus = "ok" | "maybe" | "ng" | "unanswered";

type CandidateAggregate = {
  candidateId: string;
  start: Date;
  end: Date;
  ok: number;
  maybe: number;
  ng: number;
  unanswered: number;
  statusByResponder: Map<string, SlotStatus>;
};

const STATUS_LABEL: Record<SlotStatus, string> = {
  ok: "○",
  maybe: "△",
  ng: "×",
  unanswered: "未回答",
};

const appDomain = import.meta.env.VITE_PUBLIC_APP_ORIGIN?.trim();

export function EventResultsPage({ linkId }: Props) {
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [responses, setResponses] = useState<ScheduleResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requiredResponders, setRequiredResponders] = useState<string[]>([]);
  const [requiredRule, setRequiredRule] = useState<"ok-only" | "ok-or-maybe">("ok-only");

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

  const responders = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const response of responses) {
      if (!seen.has(response.responderName)) {
        seen.add(response.responderName);
        names.push(response.responderName);
      }
    }
    return names;
  }, [responses]);

  const aggregateCandidates = useMemo<CandidateAggregate[]>(() => {
    if (!event) {
      return [];
    }

    return event.candidates.map((candidate) => {
      const start = new Date(candidate.start);
      const end = new Date(candidate.end);
      const statusByResponder = new Map<string, SlotStatus>(
        responders.map((name) => [name, "unanswered"] as const),
      );

      let ok = 0;
      let maybe = 0;
      let ng = 0;
      let unanswered = responders.length;

      for (const response of responses) {
        const answer = response.answers.find((item) => item.candidateId === candidate.id);
        if (!answer) {
          continue;
        }
        statusByResponder.set(response.responderName, answer.status);
        unanswered -= 1;
        if (answer.status === "ok") {
          ok += 1;
        } else if (answer.status === "maybe") {
          maybe += 1;
        } else if (answer.status === "ng") {
          ng += 1;
        }
      }

      return {
        candidateId: candidate.id,
        start,
        end,
        ok,
        maybe,
        ng,
        unanswered: Math.max(0, unanswered),
        statusByResponder,
      };
    });
  }, [event, responses, responders]);

  const sortedCandidates = useMemo(() => {
    return aggregateCandidates.slice().sort((a, b) => {
      if (a.ok !== b.ok) {
        return b.ok - a.ok;
      }
      if (a.maybe !== b.maybe) {
        return b.maybe - a.maybe;
      }
      if (a.ng !== b.ng) {
        return a.ng - b.ng;
      }
      if (a.unanswered !== b.unanswered) {
        return a.unanswered - b.unanswered;
      }
      return a.start.getTime() - b.start.getTime();
    });
  }, [aggregateCandidates]);

  const filteredCandidates = useMemo(() => {
    if (requiredResponders.length === 0) {
      return sortedCandidates;
    }

    return sortedCandidates.filter((candidate) =>
      requiredResponders.every((name) => {
        const slotStatus = candidate.statusByResponder.get(name);
        if (requiredRule === "ok-or-maybe") {
          return slotStatus === "ok" || slotStatus === "maybe";
        }
        return slotStatus === "ok";
      }),
    );
  }, [requiredResponders, requiredRule, sortedCandidates]);

  const totalResponders = responders.length;
  const eventUrl = useMemo(() => {
    const base = appDomain && appDomain.length > 0 ? appDomain : window.location.origin;
    return new URL(`/event/${linkId}`, base).toString();
  }, [linkId]);
  const resultUrl = `${eventUrl.replace(/\/+$/, "")}/results`;

  const toggleRequiredResponder = (name: string) => {
    setRequiredResponders((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  const formatCandidateLabel = (start: Date, end: Date) => {
    const day = start.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
    return `${day} ${timeLabel(start)}〜${timeLabel(end)}`;
  };

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
          <span className="tsu-brand-name">Tsunagari</span>
          <span className="tsu-gcal-pill">回答一覧</span>
        </div>
        <a className="tsu-today-button" href={`/event/${linkId}`}>
          回答ページへ
        </a>
      </section>

      <section className="tsu-body tsu-body-results">
        <div className="tsu-calendar-area">
          <section className="tsu-panel tsu-results-main-panel">
            <h2>
              候補日程ランキング <small>{filteredCandidates.length}件</small>
            </h2>

            <div className="tsu-results-filters">
              <div className="tsu-results-filter-row">
                <strong>必須参加者</strong>
                <div className="tsu-results-chip-row">
                  {responders.length === 0 && <span className="tsu-response-description">回答がまだありません。</span>}
                  {responders.map((name) => (
                    <button
                      className={`tsu-filter-chip ${requiredResponders.includes(name) ? "active" : ""}`}
                      key={name}
                      onClick={() => toggleRequiredResponder(name)}
                      type="button"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tsu-results-filter-row">
                <strong>必須条件</strong>
                <div className="tsu-results-chip-row">
                  <button
                    className={`tsu-filter-chip ${requiredRule === "ok-only" ? "active" : ""}`}
                    onClick={() => setRequiredRule("ok-only")}
                    type="button"
                  >
                    ○のみ
                  </button>
                  <button
                    className={`tsu-filter-chip ${requiredRule === "ok-or-maybe" ? "active" : ""}`}
                    onClick={() => setRequiredRule("ok-or-maybe")}
                    type="button"
                  >
                    ○または△
                  </button>
                </div>
              </div>
            </div>

            {responses.length === 0 ? (
              <p className="tsu-response-description">まだ回答はありません。</p>
            ) : filteredCandidates.length === 0 ? (
              <p className="tsu-response-description">指定した必須条件を満たす候補はありません。</p>
            ) : (
              <div className="tsu-results-list tsu-results-scroll">
                {filteredCandidates.map((candidate, index) => {
                  const total = Math.max(1, totalResponders);
                  const okRate = (candidate.ok / total) * 100;
                  const maybeRate = (candidate.maybe / total) * 100;
                  const ngRate = (candidate.ng / total) * 100;
                  const unansweredRate = (candidate.unanswered / total) * 100;

                  return (
                    <article className="tsu-results-item tsu-candidate-card" key={candidate.candidateId}>
                      <header className="tsu-results-head">
                        <div className="tsu-results-title-wrap">
                          <strong>{formatCandidateLabel(candidate.start, candidate.end)}</strong>
                          {index === 0 && <span className="tsu-rank-badge">最有力</span>}
                        </div>
                        <span className="tsu-results-summary-inline">
                          <span className="ok">
                            <Circle className="h-[11px] w-[11px]" /> {candidate.ok}
                          </span>
                          <span className="maybe">
                            <Triangle className="h-[10px] w-[10px]" /> {candidate.maybe}
                          </span>
                          <span className="ng">
                            <X className="h-[11px] w-[11px]" /> {candidate.ng}
                          </span>
                          <span className="unanswered">未回答 {candidate.unanswered}</span>
                        </span>
                      </header>

                      <div aria-label="回答の割合" className="tsu-candidate-meter" role="img">
                        <span className="ok" style={{ width: `${okRate}%` }} />
                        <span className="maybe" style={{ width: `${maybeRate}%` }} />
                        <span className="ng" style={{ width: `${ngRate}%` }} />
                        <span className="unanswered" style={{ width: `${unansweredRate}%` }} />
                      </div>

                      <div className="tsu-attendee-chip-list">
                        {responders.map((name) => {
                          const slotStatus = candidate.statusByResponder.get(name) ?? "unanswered";
                          return (
                            <span className={`tsu-attendee-chip ${slotStatus}`} key={`${candidate.candidateId}-${name}`}>
                              {STATUS_LABEL[slotStatus]} {name}
                            </span>
                          );
                        })}
                      </div>

                      <div className="tsu-card-foot">
                        <span className="ok">
                          <Circle className="h-[11px] w-[11px]" /> {candidate.ok}
                        </span>
                        <span className="maybe">
                          <Triangle className="h-[10px] w-[10px]" /> {candidate.maybe}
                        </span>
                        <span className="ng">
                          <X className="h-[11px] w-[11px]" /> {candidate.ng}
                        </span>
                        <span className="unanswered">{candidate.unanswered} 未回答</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="tsu-side tsu-results-side">
          <section className="tsu-panel tsu-results-info-panel">
            <h2>{event.title}</h2>
            {event.description && <p className="tsu-response-description">{event.description}</p>}
            <div className="tsu-results-info-list">
              <p>
                <strong>主催者:</strong> {event.organizerName}
              </p>
              <p>
                <strong>受付終了:</strong> 未設定
              </p>
              <p>
                <strong>日程調整URL:</strong>{" "}
                <a className="tsu-issued-link" href={eventUrl} rel="noreferrer" target="_blank">
                  {eventUrl}
                </a>
              </p>
              <p>
                <strong>結果URL:</strong>{" "}
                <a className="tsu-issued-link" href={resultUrl} rel="noreferrer" target="_blank">
                  {resultUrl}
                </a>
              </p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
