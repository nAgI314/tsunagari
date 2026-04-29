import { useEffect, useMemo, useState } from "react";
import type { ScheduleEvent } from "../../../../../shared/src";
import { AppShell } from "@/app/AppShell";
import { EventNotFoundError, createEventResponseByLinkId, getEventByLinkId } from "@/api";
import { useGoogleAuth } from "@/features/auth/GoogleAuthContext";
import { Button } from "@/components/ui/button";
import { CalendarViewport } from "@/features/scheduler/components/calendar/CalendarViewport";
import { PeriodBar } from "@/features/scheduler/components/common/PeriodBar";
import { CandidateSlotPanel } from "@/features/scheduler/components/sidebar/CandidateSlotPanel";
import { useGoogleCalendarEvents } from "@/features/scheduler/hooks/useGoogleCalendarEvents";
import { useInfiniteMonthScroll } from "@/features/scheduler/hooks/useInfiniteMonthScroll";
import { useInfiniteWeekScroll } from "@/features/scheduler/hooks/useInfiniteWeekScroll";
import type { AnswerStatus, CandidateSlot, ViewMode } from "@/features/scheduler/model/types";
import { SAMPLE_EVENTS } from "@/features/scheduler/model/sampleData";
import { formatMonthLabel, formatWeekPeriod, timeLabel } from "@/features/scheduler/utils/date";
import { shiftAnswer } from "@/features/scheduler/utils/slot";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { EventAnswerTopbar } from "../components/EventAnswerTopbar";
import { ResponseInfoPanel } from "../components/ResponseInfoPanel";

type EventPageProps = {
  linkId: string;
};

type FetchStatus = "loading" | "ready" | "not-found" | "error";

export function EventPage({ linkId }: EventPageProps) {
  const now = useMemo(() => new Date(), []);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [responderName, setResponderName] = useState("");
  const [comment, setComment] = useState("");
  const [answerByCandidateId, setAnswerByCandidateId] = useState<Map<string, AnswerStatus>>(new Map());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { isLoggedIn, login, logout, accessToken } = useGoogleAuth();

  const {
    weekOffsets,
    currentWeekStart,
    weekScrollerRef,
    onWeekScroll,
    jumpToCurrentWeek,
  } = useInfiniteWeekScroll(now);
  const { monthOffsets, currentMonthStart, monthScrollerRef, onMonthScroll, jumpToCurrentMonth } =
    useInfiniteMonthScroll(now);
  const { events: googleEvents } = useGoogleCalendarEvents(accessToken, isLoggedIn);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setStatus("loading");
        setError(null);
        setSubmitError(null);
        setSubmitMessage(null);
        const response = await getEventByLinkId(linkId);
        if (!active) {
          return;
        }
        setEvent(response.event);
        setAnswerByCandidateId(new Map());
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
        setError(err instanceof Error ? err.message : "読み込みに失敗しました。");
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [linkId]);

  const candidateSlots = useMemo<CandidateSlot[]>(() => {
    if (!event) {
      return [];
    }
    return event.candidates.map((candidate) => ({
      id: candidate.id,
      start: new Date(candidate.start),
      end: new Date(candidate.end),
      answer: answerByCandidateId.get(candidate.id),
    }));
  }, [answerByCandidateId, event]);

  const slotByKey = useMemo(() => {
    const map = new Map<string, CandidateSlot>();
    for (const slot of candidateSlots) {
      map.set(slot.id, slot);
    }
    return map;
  }, [candidateSlots]);

  const slotSummaryLabel = (slot: CandidateSlot) => {
    const day = `${slot.start.getMonth() + 1}/${slot.start.getDate()}`;
    return (
      <span className="tsu-slot-summary-two-line">
        <span>{day}</span>
        <span className="tsu-slot-time-range-inline">
          <span>{timeLabel(slot.start)}</span>
          <span>-</span>
          <span>{timeLabel(slot.end)}</span>
        </span>
      </span>
    );
  };

  const setAnswer = (slotId: string, next: AnswerStatus) => {
    setAnswerByCandidateId((prev) => {
      const map = new Map(prev);
      map.set(slotId, next);
      return map;
    });
  };

  const onCycleAnswer = (slotId: string) => {
    setAnswerByCandidateId((prev) => {
      const map = new Map(prev);
      map.set(slotId, shiftAnswer(map.get(slotId)));
      return map;
    });
  };

  const hasAnsweredAll = event ? event.candidates.every((candidate) => answerByCandidateId.has(candidate.id)) : false;
  const responseDeadlineLabel = "回答期限: 未設定";
  const activeGoogleEvents = isLoggedIn ? googleEvents : [];

  const onAutoFillByGoogleCalendar = () => {
    setSubmitError(null);
    setSubmitMessage(null);
    if (!event) {
      return;
    }
    if (!isLoggedIn) {
      setSubmitError("Googleでログインすると自動判定できます。");
      return;
    }

    const next = new Map<string, AnswerStatus>();
    for (const candidate of event.candidates) {
      const candidateStart = new Date(candidate.start).getTime();
      const candidateEnd = new Date(candidate.end).getTime();
      const hasOverlap = activeGoogleEvents.some((googleEvent) => {
        const googleStart = googleEvent.start.getTime();
        const googleEnd = googleEvent.end.getTime();
        return candidateStart < googleEnd && googleStart < candidateEnd;
      });
      next.set(candidate.id, hasOverlap ? "ng" : "ok");
    }
    setAnswerByCandidateId(next);
    setSubmitMessage("Googleカレンダーとの重なりで自動判定しました。");
  };

  const onSubmitResponse = async () => {
    setSubmitError(null);
    setSubmitMessage(null);
    if (!responderName.trim()) {
      setSubmitError("名前を入力してください。");
      return;
    }
    if (!event || !hasAnsweredAll) {
      setSubmitError("すべての候補に回答してください。");
      return;
    }

    try {
      setSubmitting(true);
      await createEventResponseByLinkId(linkId, {
        responderName: responderName.trim(),
        comment: comment.trim() ? comment.trim() : undefined,
        answers: event.candidates.map((candidate) => ({
          candidateId: candidate.id,
          status: answerByCandidateId.get(candidate.id) ?? "ok",
        })),
      });
      setSubmitMessage("回答を送信しました。");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "回答の送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
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
    <AppShell
      topbar={
        <EventAnswerTopbar
          isLoggedIn={isLoggedIn}
          onToggleLogin={() => {
            if (isLoggedIn) {
              logout();
              return;
            }
            void login();
          }}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />
      }
      body={
        <section className="tsu-body tsu-body-response">
          <div className="tsu-calendar-area">
            <PeriodBar
              hint={
                viewMode === "week"
                  ? "左右スクロールで週を移動"
                  : "上下スクロールで月を移動"
              }
              label={viewMode === "week" ? formatWeekPeriod(currentWeekStart) : formatMonthLabel(currentMonthStart)}
              onJumpToToday={viewMode === "week" ? jumpToCurrentWeek : jumpToCurrentMonth}
            />
            <div className="tsu-calendar-viewport">
              <CalendarViewport
                candidateSlots={candidateSlots}
                getSlotAnswer={(slot) => answerByCandidateId.get(slot.id)}
                googleEvents={isLoggedIn ? googleEvents : SAMPLE_EVENTS}
                isLoggedIn={isLoggedIn}
                monthOffsets={monthOffsets}
                monthScrollerRef={monthScrollerRef}
                now={now}
                onCandidateSlotClickById={onCycleAnswer}
                onMonthDayClick={() => {}}
                onMonthScroll={onMonthScroll}
                onMoveCandidateSlot={() => {}}
                onRemoveCandidateSlot={() => {}}
                onShiftCandidateSlotByMinutes={() => {}}
                onSelectSlotAnswer={setAnswer}
                onWeekCellClick={() => {}}
                onWeekScroll={onWeekScroll}
                screenMode="answer"
                slotByKey={slotByKey}
                viewMode={viewMode}
                weekOffsets={weekOffsets}
                weekScrollerRef={weekScrollerRef}
              />
            </div>
          </div>
          <aside className="tsu-side tsu-side-response">
            <ResponseInfoPanel
              comment={comment}
              description={event.description}
              onCommentChange={setComment}
              onResponderNameChange={setResponderName}
              organizerName={event.organizerName}
              responseDeadlineLabel={responseDeadlineLabel}
              responderName={responderName}
              title={event.title}
            />
            <CandidateSlotPanel
              candidateSlots={candidateSlots}
              className="tsu-candidate-scroll-panel"
              getSlotAnswer={(slot) => answerByCandidateId.get(slot.id)}
              onSelectSlotAnswer={setAnswer}
              onSlotClick={(slot) => onCycleAnswer(slot.id)}
              screenMode="answer"
              slotSummaryLabel={slotSummaryLabel}
            />
            <section className="tsu-panel tsu-response-submit-panel">
              <div className="tsu-create-result" role={submitError ? "alert" : "status"}>
                {submitError && <span className="error">{submitError}</span>}
                {!submitError && submitMessage && <span>{submitMessage}</span>}
              </div>
              <Button
                onClick={onAutoFillByGoogleCalendar}
                type="button"
                variant="outline"
              >
                Google予定で自動判定<br/>（重複なし=○ / 重複あり=×）
              </Button>
              <Button
                className="tsu-submit-primary"
                disabled={submitting}
                onClick={() => void onSubmitResponse()}
                type="button"
                variant="ghost"
              >
                {submitting ? "送信中..." : "回答を送信"}
              </Button>
            </section>
          </aside>
        </section>
      }
    />
  );
}
