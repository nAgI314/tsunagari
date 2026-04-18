import { useMemo } from "react";
import { AppShell } from "@/app/AppShell";
import { CalendarViewport } from "../components/calendar/CalendarViewport";
import { PeriodBar } from "../components/common/PeriodBar";
import { CandidateSlotPanel } from "../components/sidebar/CandidateSlotPanel";
import { EventInfoPanel } from "../components/sidebar/EventInfoPanel";
import { UsagePanel } from "../components/sidebar/UsagePanel";
import { SchedulerTopbar } from "../components/topbar/SchedulerTopbar";
import { useInfiniteMonthScroll } from "../hooks/useInfiniteMonthScroll";
import { useInfiniteWeekScroll } from "../hooks/useInfiniteWeekScroll";
import { useSchedulerState } from "../hooks/useSchedulerState";
import { SAMPLE_EVENTS } from "../model/sampleData";
import { formatMonthLabel, formatWeekPeriod } from "../utils/date";
import "../styles/scheduler.css";

export function SchedulerPage() {
  const now = useMemo(() => new Date(), []);
  const {
    viewMode,
    screenMode,
    isLoggedIn,
    slotDurationMinutes,
    candidateSlots,
    slotByKey,
    setViewMode,
    setScreenMode,
    setSlotDurationMinutes,
    toggleLogin,
    onWeekCellClick,
    onMonthDayClick,
    onCandidateSlotClick,
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

  return (
    <AppShell
      topbar={
        <SchedulerTopbar
          viewMode={viewMode}
          screenMode={screenMode}
          isLoggedIn={isLoggedIn}
          onViewModeChange={setViewMode}
          onScreenModeChange={setScreenMode}
          onToggleLogin={toggleLogin}
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
                  ? "左右スクロールで週を無限に移動"
                  : "上下スクロールで月を無限に移動"
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
                googleEvents={SAMPLE_EVENTS}
                onWeekCellClick={onWeekCellClick}
                onMonthDayClick={onMonthDayClick}
              />
            </div>
          </div>

          <aside className="tsu-side">
            <EventInfoPanel
              slotDurationMinutes={slotDurationMinutes}
              onSlotDurationChange={(minutes) => setSlotDurationMinutes(minutes)}
            />
            <CandidateSlotPanel
              candidateSlots={candidateSlots}
              screenMode={screenMode}
              slotSummaryLabel={slotSummaryLabel}
              onSlotClick={onCandidateSlotClick}
            />
            <UsagePanel />
          </aside>
        </section>
      }
    />
  );
}
