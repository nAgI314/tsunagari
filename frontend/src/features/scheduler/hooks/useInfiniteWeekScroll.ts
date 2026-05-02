import { useEffect, useMemo, useRef, useState } from "react";
import {
  HOUR_HEIGHT,
  WEEK_EXPAND_SIZE,
  WEEK_SCROLL_THRESHOLD,
  WEEK_WINDOW_PADDING,
} from "../model/constants";
import { addWeeks, startOfWeek } from "../utils/date";

type WeekWindow = {
  min: number;
  max: number;
};

const TIME_AXIS_WIDTH = 54;
const FALLBACK_WEEK_BOARD_WIDTH = 980;

function getWeekBoardWidth(scroller: HTMLDivElement): number {
  const board = scroller.querySelector<HTMLElement>(".tsu-week-board");
  const rawWidth = board?.getBoundingClientRect().width ?? 0;
  return rawWidth > 0 ? rawWidth : FALLBACK_WEEK_BOARD_WIDTH;
}

function initialScrollTopForDate(date: Date): number {
  const minutesFromStart = date.getHours() * 60 + date.getMinutes();
  const top = (minutesFromStart / 60) * HOUR_HEIGHT - HOUR_HEIGHT * 2;
  return Math.max(0, top);
}

function initialScrollLeftForCurrentWeek(weekBoardWidth: number): number {
  return TIME_AXIS_WIDTH + WEEK_WINDOW_PADDING * weekBoardWidth;
}

export function useInfiniteWeekScroll(baseDate: Date) {
  const [weekWindow, setWeekWindow] = useState<WeekWindow>({
    min: -WEEK_WINDOW_PADDING,
    max: WEEK_WINDOW_PADDING,
  });
  const [weekAnchor, setWeekAnchor] = useState(startOfWeek(baseDate));
  const weekScrollerRef = useRef<HTMLDivElement | null>(null);
  const initializedWeekScroll = useRef(false);

  const weekOffsets = useMemo(
    () =>
      Array.from(
        { length: weekWindow.max - weekWindow.min + 1 },
        (_, index) => index + weekWindow.min,
      ),
    [weekWindow],
  );

  useEffect(() => {
    const scroller = weekScrollerRef.current;
    if (!scroller || initializedWeekScroll.current) {
      return;
    }

    initializedWeekScroll.current = true;
    requestAnimationFrame(() => {
      const previousBehavior = scroller.style.scrollBehavior;
      const weekBoardWidth = getWeekBoardWidth(scroller);
      scroller.style.scrollBehavior = "auto";
      scroller.scrollLeft = initialScrollLeftForCurrentWeek(weekBoardWidth);
      scroller.scrollTop = initialScrollTopForDate(baseDate);
      requestAnimationFrame(() => {
        scroller.style.scrollBehavior = previousBehavior;
      });
    });
  });

  const onWeekScroll = () => {
    const scroller = weekScrollerRef.current;
    if (!scroller) {
      return;
    }
    const weekBoardWidth = getWeekBoardWidth(scroller);

    const nearLeft = scroller.scrollLeft < WEEK_SCROLL_THRESHOLD;
    const nearRight =
      scroller.scrollWidth - scroller.scrollLeft - scroller.clientWidth <
      WEEK_SCROLL_THRESHOLD;

    if (nearLeft) {
      setWeekWindow((prev) => ({ min: prev.min - WEEK_EXPAND_SIZE, max: prev.max }));
      scroller.scrollLeft += WEEK_EXPAND_SIZE * weekBoardWidth;
    } else if (nearRight) {
      setWeekWindow((prev) => ({ min: prev.min, max: prev.max + WEEK_EXPAND_SIZE }));
    }

    const rawIndex = Math.round((scroller.scrollLeft - TIME_AXIS_WIDTH) / weekBoardWidth);
    const offset = rawIndex + weekWindow.min;
    setWeekAnchor(addWeeks(startOfWeek(baseDate), offset));
  };

  const jumpToCurrentWeek = () => {
    setWeekWindow({
      min: -WEEK_WINDOW_PADDING,
      max: WEEK_WINDOW_PADDING,
    });
    setWeekAnchor(startOfWeek(baseDate));
    requestAnimationFrame(() => {
      const scroller = weekScrollerRef.current;
      if (!scroller) {
        return;
      }
      const weekBoardWidth = getWeekBoardWidth(scroller);
      scroller.scrollTo({
        left: initialScrollLeftForCurrentWeek(weekBoardWidth),
        top: initialScrollTopForDate(baseDate),
        behavior: "smooth",
      });
    });
  };

  return {
    weekOffsets,
    currentWeekStart: weekAnchor,
    weekScrollerRef,
    onWeekScroll,
    jumpToCurrentWeek,
  };
}
