import { useEffect, useMemo, useRef, useState } from "react";
import {
  WEEK_BOARD_WIDTH,
  WEEK_EXPAND_SIZE,
  WEEK_SCROLL_THRESHOLD,
  WEEK_WINDOW_PADDING,
} from "../model/constants";
import { addWeeks, startOfWeek } from "../utils/date";

type WeekWindow = {
  min: number;
  max: number;
};

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
      scroller.scrollLeft = scroller.scrollWidth / 2 - scroller.clientWidth / 2;
    });
  }, []);

  const onWeekScroll = () => {
    const scroller = weekScrollerRef.current;
    if (!scroller) {
      return;
    }

    const nearLeft = scroller.scrollLeft < WEEK_SCROLL_THRESHOLD;
    const nearRight =
      scroller.scrollWidth - scroller.scrollLeft - scroller.clientWidth <
      WEEK_SCROLL_THRESHOLD;

    if (nearLeft) {
      setWeekWindow((prev) => ({ min: prev.min - WEEK_EXPAND_SIZE, max: prev.max }));
      scroller.scrollLeft += WEEK_EXPAND_SIZE * WEEK_BOARD_WIDTH;
    } else if (nearRight) {
      setWeekWindow((prev) => ({ min: prev.min, max: prev.max + WEEK_EXPAND_SIZE }));
    }

    const rawIndex = Math.round(scroller.scrollLeft / WEEK_BOARD_WIDTH);
    const offset = rawIndex + weekWindow.min;
    setWeekAnchor(addWeeks(startOfWeek(baseDate), offset));
  };

  return {
    weekOffsets,
    currentWeekStart: weekAnchor,
    weekScrollerRef,
    onWeekScroll,
  };
}
