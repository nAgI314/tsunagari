import { useMemo, useState } from "react";
import { AppShell } from "@/app/AppShell";
import { createEvent } from "@/api";
import { useGoogleAuth } from "@/features/auth/GoogleAuthContext";
import { Button } from "@/components/ui/button";
import { CalendarViewport } from "../components/calendar/CalendarViewport";
import { PeriodBar } from "../components/common/PeriodBar";
import { CandidateSlotPanel } from "../components/sidebar/CandidateSlotPanel";
import { EventInfoPanel } from "../components/sidebar/EventInfoPanel";
import { UsagePanel } from "../components/sidebar/UsagePanel";
import { useGoogleCalendarEvents } from "../hooks/useGoogleCalendarEvents";
import { SchedulerTopbar } from "../components/topbar/SchedulerTopbar";
import { useInfiniteMonthScroll } from "../hooks/useInfiniteMonthScroll";
import { useInfiniteWeekScroll } from "../hooks/useInfiniteWeekScroll";
import { useSchedulerState } from "../hooks/useSchedulerState";
import { SAMPLE_EVENTS } from "../model/sampleData";
import { formatMonthLabel, formatWeekPeriod } from "../utils/date";
import "../styles/scheduler.css";

export function SchedulerPage() {
  const now = useMemo(() => new Date(), []);
  const [title, setTitle] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [description, setDescription] = useState("");
  const [responseDeadline, setResponseDeadline] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdLinkId, setCreatedLinkId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const appDomain = import.meta.env.VITE_PUBLIC_APP_ORIGIN?.trim();
  const { isLoggedIn, login, logout, accessToken } = useGoogleAuth();

  const {
    viewMode,
    screenMode,
    slotDurationMinutes,
    candidateSlots,
    slotByKey,
    setViewMode,
    setScreenMode,
    setSlotDurationMinutes,
    onWeekCellClick,
    onMonthDayClick,
    onCandidateSlotClick,
    onCandidateSlotClickById,
    removeCandidateSlot,
    moveCandidateSlot,
    slotSummaryLabel,
  } = useSchedulerState(now);

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

  const issuedLink = useMemo(() => {
    if (!createdLinkId) {
      return null;
    }
    const base = appDomain && appDomain.length > 0 ? appDomain : window.location.origin;
    return new URL(`/event/${createdLinkId}`, base).toString();
  }, [appDomain, createdLinkId]);

  const issuedResultsLink = useMemo(() => {
    if (!issuedLink) {
      return null;
    }
    return `${issuedLink.replace(/\/+$/, "")}/results`;
  }, [issuedLink]);

  const onCreateSchedule = async () => {
    setCreateError(null);
    setCreatedLinkId(null);
    if (!title.trim()) {
      setCreateError("タイトルを入力してください。");
      return;
    }
    if (!organizerName.trim()) {
      setCreateError("主催者名を入力してください。");
      return;
    }
    if (candidateSlots.length === 0) {
      setCreateError("候補日時を1件以上追加してください。");
      return;
    }

    try {
      setCreating(true);
      setCopied(false);
      const response = await createEvent({
        title: title.trim(),
        organizerName: organizerName.trim(),
        description: description.trim() ? description.trim() : undefined,
        candidates: candidateSlots
          .slice()
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .map((slot) => ({
            start: slot.start.toISOString(),
            end: slot.end.toISOString(),
          })),
      });
      setCreatedLinkId(response.event.linkId);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "日程調整の作成に失敗しました。");
    } finally {
      setCreating(false);
    }
  };

  const onCopyLink = async () => {
    if (!issuedLink) {
      return;
    }
    await navigator.clipboard.writeText(issuedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell
      topbar={
        <SchedulerTopbar
          viewMode={viewMode}
          screenMode={screenMode}
          isLoggedIn={isLoggedIn}
            onViewModeChange={setViewMode}
            onScreenModeChange={setScreenMode}
            onToggleLogin={() => {
              if (isLoggedIn) {
                logout();
                return;
              }
              void login();
            }}
          />
        }
      body={
        <section className="tsu-body">
          <div className="tsu-calendar-area">
            <PeriodBar
              label={
                viewMode === "week"
                  ? formatWeekPeriod(currentWeekStart)
                  : formatMonthLabel(currentMonthStart)
              }
              hint={
                viewMode === "week"
                  ? "左右スクロールで週を移動"
                  : "上下スクロールで月を移動"
              }
              onJumpToToday={viewMode === "week" ? jumpToCurrentWeek : jumpToCurrentMonth}
            />
            <div className="tsu-calendar-viewport">
              <CalendarViewport
                viewMode={viewMode}
                now={now}
                weekOffsets={weekOffsets}
                monthOffsets={monthOffsets}
                weekScrollerRef={weekScrollerRef}
                monthScrollerRef={monthScrollerRef}
                onWeekScroll={onWeekScroll}
                onMonthScroll={onMonthScroll}
                screenMode={screenMode}
                isLoggedIn={isLoggedIn}
                slotByKey={slotByKey}
                candidateSlots={candidateSlots}
                googleEvents={isLoggedIn ? googleEvents : SAMPLE_EVENTS}
                onWeekCellClick={onWeekCellClick}
                onMonthDayClick={onMonthDayClick}
                onCandidateSlotClickById={onCandidateSlotClickById}
                onRemoveCandidateSlot={removeCandidateSlot}
                onMoveCandidateSlot={moveCandidateSlot}
              />
            </div>
          </div>

          <aside className="tsu-side">
            <EventInfoPanel
              title={title}
              organizerName={organizerName}
              description={description}
              responseDeadline={responseDeadline}
              slotDurationMinutes={slotDurationMinutes}
              onTitleChange={setTitle}
              onOrganizerNameChange={setOrganizerName}
              onDescriptionChange={setDescription}
              onResponseDeadlineChange={setResponseDeadline}
              onSlotDurationChange={(minutes) => setSlotDurationMinutes(minutes)}
            />
            <CandidateSlotPanel
              candidateSlots={candidateSlots}
              className="tsu-candidate-scroll-panel"
              screenMode={screenMode}
              slotSummaryLabel={slotSummaryLabel}
              onSlotClick={onCandidateSlotClick}
              onRemoveCandidateSlot={removeCandidateSlot}
            />
            <UsagePanel />
          </aside>
        </section>
      }
      footer={
        <>
          <div className="tsu-create-result" role={createError ? "alert" : "status"}>
            {createError && <span className="error">{createError}</span>}
            {!createError && issuedLink && (
              <div className="tsu-issued-link-row">
                <span>作成した日程調整: </span>
                <a className="tsu-issued-link" href={issuedLink} rel="noreferrer" target="_blank">
                  {issuedLink}
                </a>
                <Button onClick={() => void onCopyLink()} type="button" variant="outline">
                  {copied ? "コピー済み" : "コピー"}
                </Button>
              </div>
            )}
            {!createError && issuedResultsLink && (
              <div className="tsu-issued-link-row">
                <span>回答一覧: </span>
                <a className="tsu-issued-link" href={issuedResultsLink} rel="noreferrer" target="_blank">
                  {issuedResultsLink}
                </a>
              </div>
            )}
          </div>
          <Button disabled={creating} onClick={() => void onCreateSchedule()} type="button">
            {creating ? "作成中..." : "日程調整リンクを作成"}
          </Button>
        </>
      }
    />
  );
}
