import { useEffect, useRef, useState } from "react";
import type { GoogleEvent } from "../model/types";

export type CalendarInfo = {
  id: string;
  name: string;
  selected: boolean;
  primary: boolean;
};

type CalendarEventItem = {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

type CalendarEventsResponse = {
  items?: CalendarEventItem[];
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TOKEN_STORAGE_KEY = "tsunagari-google-auth";
const CALENDAR_VISIBILITY_KEY = "tsunagari-calendar-visibility";
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // 5 minutes

function loadVisibility(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(CALENDAR_VISIBILITY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

const parseGoogleDate = (value: string): Date => {
  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map((part) => Number(part));
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  return new Date(value);
};

function isTokenExpiringSoon(): boolean {
  const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return true;
  try {
    const parsed = JSON.parse(raw) as { expiresAt?: number };
    if (!parsed.expiresAt) return true;
    return Date.now() > parsed.expiresAt - TOKEN_REFRESH_MARGIN_MS;
  } catch {
    return true;
  }
}

export function useGoogleCalendarEvents(
  accessToken: string | null,
  enabled: boolean,
  onAuthError?: () => void,
) {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const onAuthErrorRef = useRef(onAuthError);
  onAuthErrorRef.current = onAuthError;

  useEffect(() => {
    if (!enabled || !accessToken) {
      setEvents([]);
      setCalendars([]);
      setError(null);
      return;
    }

    if (isTokenExpiringSoon()) {
      setEvents([]);
      setCalendars([]);
      setError(null);
      onAuthErrorRef.current?.();
      return;
    }

    const controller = new AbortController();
    const loadEvents = async () => {
      try {
        setError(null);
        const now = new Date();
        const timeMin = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString();
        const timeMax = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 120).toISOString();
        const params = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "250",
        });

        // 1. ユーザーの全カレンダーを取得
        const listResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/users/me/calendarList?${new URLSearchParams({ maxResults: "250" }).toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          },
        );
        if (!listResponse.ok) {
          if (listResponse.status === 401) {
            onAuthErrorRef.current?.();
            throw new Error("Googleの認証が切れました。再ログインします。");
          }
          throw new Error("Googleカレンダーの取得に失敗しました。");
        }
        const listJson = (await listResponse.json()) as {
          items?: { id?: string; summary?: string; primary?: boolean }[];
        };
        const savedVisibility = loadVisibility();
        const allCalendars = (listJson.items ?? [])
          .map((item) =>
            item.id
              ? {
                  id: item.id,
                  name: item.summary?.trim() || item.id,
                  selected: savedVisibility[item.id] ?? true,
                  primary: !!item.primary,
                }
              : null,
          )
          .filter((c): c is CalendarInfo => c !== null);

        // 2. 各カレンダーのイベントを並列取得
        const eventResponses = await Promise.all(
          allCalendars.map(async (calendar) => {
            try {
              const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?${params.toString()}`,
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                  signal: controller.signal,
                },
              );
              if (!response.ok) {
                return { calendarId: calendar.id, items: [] as CalendarEventItem[] };
              }
              const json = (await response.json()) as CalendarEventsResponse;
              return { calendarId: calendar.id, items: json.items ?? [] };
            } catch {
              return { calendarId: calendar.id, items: [] as CalendarEventItem[] };
            }
          }),
        );

        const allItems = eventResponses.flatMap((res) =>
          (res.items ?? []).map((item) => ({ ...item, calendarId: res.calendarId })),
        );

        // 3. 重複排除（同じイベントが複数カレンダーに含まれる場合がある）
        const seenIds = new Set<string>();
        const uniqueItems = allItems.filter((item) => {
          if (!item.id || seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });

        const mapped: GoogleEvent[] = uniqueItems
          .map((item) => {
            const startRaw = item.start?.dateTime ?? item.start?.date;
            const endRaw = item.end?.dateTime ?? item.end?.date;
            if (!item.id || !startRaw || !endRaw) {
              return null;
            }
            const start = parseGoogleDate(startRaw);
            const end = parseGoogleDate(endRaw);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
              return null;
            }
            return {
              id: item.id,
              title: item.summary?.trim() || "予定",
              start,
              end,
              calendarId: item.calendarId,
              calendarName: allCalendars.find((c) => c.id === item.calendarId)?.name,
            };
          })
          .filter((item) => item !== null);
        setEvents(mapped);
        setCalendars(allCalendars);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Googleカレンダーの取得に失敗しました。");
      }
    };

    void loadEvents();
    return () => controller.abort();
  }, [accessToken, enabled]);

  useEffect(() => {
    if (calendars.length === 0) return;
    const record: Record<string, boolean> = {};
    for (const c of calendars) {
      record[c.id] = c.selected;
    }
    window.localStorage.setItem(CALENDAR_VISIBILITY_KEY, JSON.stringify(record));
  }, [calendars]);

  return { events, calendars, setCalendars, error };
}
