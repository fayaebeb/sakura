// src/utils/time.ts

import { subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export interface WeekWindow {
  from: Date;  // UTC start of last week (Mon 00:00)
  to: Date;    // UTC end of last week (Sun 23:59:59.999)
}

/**
 * Compute the UTC window for “last calendar week” (Monday→Sunday)
 * in the given IANA timezone (default Asia/Tokyo).
 */
export function getLastWeekWindow(
  timezone: string = 'Asia/Tokyo'
): WeekWindow {
  // 1) “Now” in target TZ
  const nowTz = toZonedTime(new Date(), timezone);
  // 2) exactly 1 week ago
  const oneWeekAgo = subWeeks(nowTz, 1);
  // 3) boundaries of that week, Mon→Sun
  const weekStartTz = startOfWeek(oneWeekAgo, { weekStartsOn: 1 });
  const weekEndTz   = endOfWeek(oneWeekAgo,   { weekStartsOn: 1 });
  // 4) convert to UTC for DB queries
  return {
    from: fromZonedTime(weekStartTz, timezone),
    to:   fromZonedTime(weekEndTz,   timezone),
  };
}
