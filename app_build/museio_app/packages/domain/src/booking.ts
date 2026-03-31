import type {
  AvailabilityBlockSource,
  AvailabilityConflictBlock,
  AvailabilityWindow,
  BookingRequestStatus,
  CreatorAvailabilityRule,
  PublicAvailabilityDay,
  RequestedDateTimeSlotBlock
} from "@museio/types";

export const bookingRequestStatuses = [
  "submitted",
  "under-review",
  "accepted",
  "declined",
  "archived"
] as const satisfies readonly BookingRequestStatus[];

export const bookingBlockingStatuses = [
  "submitted",
  "under-review",
  "accepted"
] as const satisfies readonly BookingRequestStatus[];

export const availabilityBlockSources = [
  "manual",
  "vacation",
  "external-calendar",
  "booking-request"
] as const satisfies readonly AvailabilityBlockSource[];

export type BookingRequestState = (typeof bookingRequestStatuses)[number];

export const weekdayOptions = [
  { value: 0, label: "Sunday", shortLabel: "Sun" },
  { value: 1, label: "Monday", shortLabel: "Mon" },
  { value: 2, label: "Tuesday", shortLabel: "Tue" },
  { value: 3, label: "Wednesday", shortLabel: "Wed" },
  { value: 4, label: "Thursday", shortLabel: "Thu" },
  { value: 5, label: "Friday", shortLabel: "Fri" },
  { value: 6, label: "Saturday", shortLabel: "Sat" }
] as const;

type TimeZoneDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
};

type Interval = {
  startsAt: Date;
  endsAt: Date;
};

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timezone: string) {
  const key = `en-US:${timezone}`;
  const existing = formatterCache.get(key);

  if (existing) {
    return existing;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  formatterCache.set(key, formatter);

  return formatter;
}

function formatTime(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function getTimeZoneDateParts(date: Date, timezone: string): TimeZoneDateParts {
  const parts = getFormatter(timezone).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.get("year")),
    month: Number(values.get("month")),
    day: Number(values.get("day")),
    hour: Number(values.get("hour")),
    minute: Number(values.get("minute")),
    weekday: weekdayMap[values.get("weekday") ?? "Sun"] ?? 0
  };
}

function localDateToUtc(
  localDate: Omit<TimeZoneDateParts, "weekday">,
  timezone: string
) {
  let guess = new Date(
    Date.UTC(
      localDate.year,
      localDate.month - 1,
      localDate.day,
      localDate.hour,
      localDate.minute
    )
  );

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const actual = getTimeZoneDateParts(guess, timezone);
    const desiredStamp = Date.UTC(
      localDate.year,
      localDate.month - 1,
      localDate.day,
      localDate.hour,
      localDate.minute
    );
    const actualStamp = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute
    );
    const deltaMinutes = Math.round((desiredStamp - actualStamp) / 60000);

    if (deltaMinutes === 0) {
      break;
    }

    guess = new Date(guess.getTime() + deltaMinutes * 60000);
  }

  return guess;
}

function addLocalDays(
  localDate: Pick<TimeZoneDateParts, "year" | "month" | "day">,
  amount: number
) {
  const utc = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day + amount, 12, 0)
  );

  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate()
  };
}

function overlaps(a: Interval, b: Interval) {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

function subtractIntervals(base: Interval, blockers: Interval[]) {
  let windows = [base];

  for (const blocker of blockers) {
    windows = windows.flatMap((window) => {
      if (!overlaps(window, blocker)) {
        return [window];
      }

      const next: Interval[] = [];

      if (blocker.startsAt > window.startsAt) {
        next.push({
          startsAt: window.startsAt,
          endsAt: blocker.startsAt
        });
      }

      if (blocker.endsAt < window.endsAt) {
        next.push({
          startsAt: blocker.endsAt,
          endsAt: window.endsAt
        });
      }

      return next.filter((candidate) => candidate.endsAt > candidate.startsAt);
    });
  }

  return windows;
}

function toDateKey(localDate: Pick<TimeZoneDateParts, "year" | "month" | "day">) {
  return `${String(localDate.year).padStart(4, "0")}-${String(localDate.month).padStart(2, "0")}-${String(localDate.day).padStart(2, "0")}`;
}

function toAvailabilityWindow(interval: Interval, timezone: string): AvailabilityWindow {
  return {
    startsAt: interval.startsAt.toISOString(),
    endsAt: interval.endsAt.toISOString(),
    label: `${formatTime(interval.startsAt, timezone)} - ${formatTime(interval.endsAt, timezone)}`
  };
}

export function normalizeRequestedSlots(slots: RequestedDateTimeSlotBlock[]) {
  return [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function toBlockingIntervals(
  blocks: AvailabilityConflictBlock[],
  requestedSlots: RequestedDateTimeSlotBlock[]
) {
  const blockIntervals = blocks.map((block) => ({
    startsAt: new Date(block.startsAt),
    endsAt: new Date(block.endsAt)
  }));
  const requestIntervals = requestedSlots.map((slot) => ({
    startsAt: new Date(slot.startsAt),
    endsAt: new Date(slot.endsAt)
  }));

  return [...blockIntervals, ...requestIntervals].sort(
    (left, right) => left.startsAt.getTime() - right.startsAt.getTime()
  );
}

export function buildPublicAvailabilityDays(params: {
  rules: CreatorAvailabilityRule[];
  blockingIntervals: Interval[];
  timezone: string;
  days: number;
  from?: Date;
}) {
  const { rules, blockingIntervals, timezone, days, from = new Date() } = params;
  const startParts = getTimeZoneDateParts(from, timezone);
  const today = {
    year: startParts.year,
    month: startParts.month,
    day: startParts.day
  };

  const output: PublicAvailabilityDay[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const localDate = addLocalDays(today, offset);
    const middayUtc = localDateToUtc(
      {
        ...localDate,
        hour: 12,
        minute: 0
      },
      timezone
    );
    const weekday = getTimeZoneDateParts(middayUtc, timezone).weekday;
    const dayRules = rules.filter((rule) => rule.weekday === weekday);
    const dayWindows = dayRules.flatMap((rule) => {
      const startsAt = localDateToUtc(
        {
          ...localDate,
          hour: Math.floor(rule.startsAtMinute / 60),
          minute: rule.startsAtMinute % 60
        },
        rule.timezone
      );
      const endsAt = localDateToUtc(
        {
          ...localDate,
          hour: Math.floor(rule.endsAtMinute / 60),
          minute: rule.endsAtMinute % 60
        },
        rule.timezone
      );

      const availableIntervals = subtractIntervals(
        { startsAt, endsAt },
        blockingIntervals.filter((blocker) =>
          overlaps({ startsAt, endsAt }, blocker)
        )
      );

      return availableIntervals.map((interval) =>
        toAvailabilityWindow(interval, rule.timezone)
      );
    });

    if (dayWindows.length > 0) {
      output.push({
        date: toDateKey(localDate),
        timezone,
        windows: dayWindows
      });
    }
  }

  return output;
}

export function slotsFitAvailability(
  requestedSlots: RequestedDateTimeSlotBlock[],
  availability: PublicAvailabilityDay[]
) {
  return requestedSlots.every((slot) => {
    const slotStart = new Date(slot.startsAt).getTime();
    const slotEnd = new Date(slot.endsAt).getTime();

    return availability.some((day) =>
      day.windows.some((window) => {
        const windowStart = new Date(window.startsAt).getTime();
        const windowEnd = new Date(window.endsAt).getTime();

        return slotStart >= windowStart && slotEnd <= windowEnd;
      })
    );
  });
}

export function isValidMinuteRange(startsAtMinute: number, endsAtMinute: number) {
  return (
    Number.isInteger(startsAtMinute) &&
    Number.isInteger(endsAtMinute) &&
    startsAtMinute >= 0 &&
    startsAtMinute <= 1439 &&
    endsAtMinute > startsAtMinute &&
    endsAtMinute <= 1440
  );
}
