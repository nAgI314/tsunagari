import { useEffect, useRef, useState } from "react";
import type { GoogleEvent } from "../model/types";

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
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // 5 minutes

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
  const [error, setError] = useState<string | null>(null);
  const onAuthErrorRef = useRef(onAuthError);
  onAuthErrorRef.current = onAuthError;

  useEffect(() => {
    if (!enabled || !accessToken) {
      setEvents([]);
      setError(null);
      return;
    }

    if (isTokenExpiringSoon()) {
      setEvents([]);
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
          maxResults: "200",
        });
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          if (response.status === 401) {
            onAuthErrorRef.current?.();
            throw new Error("Googleの認証が切れました。再ログインします。");
          }
          throw new Error("Googleカレンダーの取得に失敗しました。");
        }
        const json = (await response.json()) as CalendarEventsResponse;
        const mapped: GoogleEvent[] = (json.items ?? [])
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
            };
          })
          .filter((item): item is GoogleEvent => item !== null);
        setEvents(mapped);
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

  return { events, error };
}
