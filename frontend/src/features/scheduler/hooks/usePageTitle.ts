import { useEffect } from "react";

const DEFAULT_TITLE = "日程調整アプリ「Tsunagari」";

export function usePageTitle(title?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
