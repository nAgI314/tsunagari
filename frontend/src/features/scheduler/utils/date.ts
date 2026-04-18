const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function buildDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function addDays(date: Date, days: number): Date {
  return new Date(startOfDay(date).getTime() + days * DAY_MS);
}

export function addWeeks(date: Date, weeks: number): Date {
  return new Date(startOfDay(date).getTime() + weeks * WEEK_MS);
}

export function startOfWeek(date: Date): Date {
  const base = startOfDay(date);
  return addDays(base, -base.getDay());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function addMonths(date: Date, diff: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + diff, 1, 0, 0, 0, 0);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function timeLabel(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

export function formatWeekPeriod(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const year = weekStart.getFullYear();
  return `${year}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${
    weekEnd.getMonth() + 1
  }月${weekEnd.getDate()}日`;
}

export function formatMonthLabel(monthStart: Date): string {
  return `${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月`;
}
