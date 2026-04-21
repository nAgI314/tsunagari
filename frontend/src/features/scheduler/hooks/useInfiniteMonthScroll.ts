import { useEffect, useMemo, useRef, useState } from "react";
import {
  MONTH_BOARD_HEIGHT,
  MONTH_EXPAND_SIZE,
  MONTH_SCROLL_THRESHOLD,
  MONTH_WINDOW_PADDING,
} from "../model/constants";
import { addMonths, startOfMonth } from "../utils/date";

type MonthWindow = {
  min: number;
  max: number;
};

export function useInfiniteMonthScroll(baseDate: Date) {
  const [monthWindow, setMonthWindow] = useState<MonthWindow>({
    min: -MONTH_WINDOW_PADDING,
    max: MONTH_WINDOW_PADDING,
  });
  const [monthAnchor, setMonthAnchor] = useState(startOfMonth(baseDate));
  const monthScrollerRef = useRef<HTMLDivElement | null>(null);
  const initializedMonthScroll = useRef(false);

  const monthOffsets = useMemo(
    () =>
      Array.from(
        { length: monthWindow.max - monthWindow.min + 1 },
        (_, index) => index + monthWindow.min,
      ),
    [monthWindow],
  );

  useEffect(() => {
    const scroller = monthScrollerRef.current;
    if (!scroller || initializedMonthScroll.current) {
      return;
    }

    initializedMonthScroll.current = true;
    requestAnimationFrame(() => {
      scroller.scrollTop = scroller.scrollHeight / 2 - scroller.clientHeight / 2;
    });
  });

  const onMonthScroll = () => {
    const scroller = monthScrollerRef.current;
    if (!scroller) {
      return;
    }

    const nearTop = scroller.scrollTop < MONTH_SCROLL_THRESHOLD;
    const nearBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <
      MONTH_SCROLL_THRESHOLD;

    if (nearTop) {
      setMonthWindow((prev) => ({ min: prev.min - MONTH_EXPAND_SIZE, max: prev.max }));
      scroller.scrollTop += MONTH_EXPAND_SIZE * MONTH_BOARD_HEIGHT;
    } else if (nearBottom) {
      setMonthWindow((prev) => ({ min: prev.min, max: prev.max + MONTH_EXPAND_SIZE }));
    }

    const monthIndex = Math.round(scroller.scrollTop / MONTH_BOARD_HEIGHT) + monthWindow.min;
    setMonthAnchor(addMonths(startOfMonth(baseDate), monthIndex));
  };

  const jumpToCurrentMonth = () => {
    setMonthWindow({
      min: -MONTH_WINDOW_PADDING,
      max: MONTH_WINDOW_PADDING,
    });
    setMonthAnchor(startOfMonth(baseDate));
    requestAnimationFrame(() => {
      const scroller = monthScrollerRef.current;
      if (!scroller) {
        return;
      }
      scroller.scrollTop = scroller.scrollHeight / 2 - scroller.clientHeight / 2;
    });
  };

  return {
    monthOffsets,
    currentMonthStart: monthAnchor,
    monthScrollerRef,
    onMonthScroll,
    jumpToCurrentMonth,
  };
}
