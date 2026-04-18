import type { GoogleEvent } from "./types";
import { buildDate } from "../utils/date";

export const SAMPLE_EVENTS: GoogleEvent[] = [
  {
    id: "g-1",
    title: "1on1",
    start: buildDate(2026, 4, 20, 13, 0),
    end: buildDate(2026, 4, 20, 14, 30),
  },
  {
    id: "g-2",
    title: "定例MTG",
    start: buildDate(2026, 4, 21, 11, 0),
    end: buildDate(2026, 4, 21, 12, 0),
  },
  {
    id: "g-3",
    title: "レビュー",
    start: buildDate(2026, 4, 22, 15, 0),
    end: buildDate(2026, 4, 22, 16, 0),
  },
  {
    id: "g-4",
    title: "商談",
    start: buildDate(2026, 4, 24, 12, 0),
    end: buildDate(2026, 4, 24, 13, 30),
  },
];
