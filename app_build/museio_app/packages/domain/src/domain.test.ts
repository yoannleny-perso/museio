import { describe, expect, it } from "vitest";
import {
  addToAgingBuckets,
  addToForecastBuckets,
  bookingBlockingStatuses,
  buildForecastBuckets,
  buildPublicAvailabilityDays,
  computeCommercialLineItemTotals,
  computeCommercialTotals,
  computeDepositAmountMinor,
  computeOverdueDays,
  deriveInvoiceStatus,
  createEmptyPortfolioContent,
  createEmptyAgingBuckets,
  allocateTaxFromPayment,
  getReserveTargetMinor,
  getTaxPayableMinor,
  getAllowedBookingDecisionActions,
  getBookingStatusForDecision,
  getPortfolioThemeOption,
  hasContentForSection,
  portfolioPublishStates,
  slotsFitAvailability,
  countUnreadMessagesForCreator,
  toConflictCenterItem
} from "./index";

describe("domain enums", () => {
  it("includes public portfolio state", () => {
    expect(portfolioPublishStates).toContain("public");
  });

  it("resolves a portfolio theme option", () => {
    expect(getPortfolioThemeOption("midnight-stage").label).toBe("Midnight Stage");
  });

  it("hides empty photo sections in live mode", () => {
    expect(
      hasContentForSection("photos", createEmptyPortfolioContent(), {
        artistName: "Nova Lune",
        shortBio: "",
        fullBio: ""
      })
    ).toBe(false);
  });

  it("treats submitted and accepted requests as blocking states", () => {
    expect(bookingBlockingStatuses).toEqual([
      "submitted",
      "under-review",
      "accepted"
    ]);
  });

  it("subtracts blocking windows from public availability", () => {
    const availability = buildPublicAvailabilityDays({
      rules: [
        {
          id: "rule-1",
          weekday: 1,
          startsAtMinute: 600,
          endsAtMinute: 840,
          timezone: "UTC"
        }
      ],
      blockingIntervals: [
        {
          startsAt: new Date("2026-03-30T12:00:00.000Z"),
          endsAt: new Date("2026-03-30T13:00:00.000Z")
        }
      ],
      timezone: "UTC",
      days: 2,
      from: new Date("2026-03-30T08:00:00.000Z")
    });

    expect(availability).toHaveLength(1);
    expect(availability[0]?.windows).toHaveLength(2);
    expect(availability[0]?.windows[0]?.startsAt).toBe("2026-03-30T10:00:00.000Z");
    expect(availability[0]?.windows[0]?.endsAt).toBe("2026-03-30T12:00:00.000Z");
    expect(availability[0]?.windows[1]?.startsAt).toBe("2026-03-30T13:00:00.000Z");
  });

  it("validates requested slots against exposed public windows", () => {
    const availability = [
      {
        date: "2026-03-30",
        timezone: "UTC",
        windows: [
          {
            startsAt: "2026-03-30T10:00:00.000Z",
            endsAt: "2026-03-30T12:00:00.000Z",
            label: "10:00 AM - 12:00 PM"
          }
        ]
      }
    ];

    expect(
      slotsFitAvailability(
        [
          {
            id: "slot-1",
            startsAt: "2026-03-30T10:30:00.000Z",
            endsAt: "2026-03-30T11:15:00.000Z",
            timezone: "UTC"
          }
        ],
        availability
      )
    ).toBe(true);

    expect(
      slotsFitAvailability(
        [
          {
            id: "slot-2",
            startsAt: "2026-03-30T11:30:00.000Z",
            endsAt: "2026-03-30T12:30:00.000Z",
            timezone: "UTC"
          }
        ],
        availability
      )
    ).toBe(false);
  });

  it("returns server-owned decision actions for each booking status", () => {
    expect(getAllowedBookingDecisionActions("submitted")).toEqual([
      "mark-under-review",
      "accept-into-job-draft",
      "decline",
      "archive"
    ]);
    expect(getAllowedBookingDecisionActions("accepted")).toEqual(["archive"]);
  });

  it("maps creator decisions to booking statuses", () => {
    expect(getBookingStatusForDecision("mark-under-review")).toBe("under-review");
    expect(getBookingStatusForDecision("accept-into-job-draft")).toBe("accepted");
  });

  it("computes commercial totals from line items", () => {
    const lineItems = [
      computeCommercialLineItemTotals({
        id: "line-1",
        label: "Performance Fee",
        description: "",
        quantity: 1,
        unitAmountMinor: 100000,
        taxRateBasisPoints: 1000,
        sortOrder: 0
      })
    ];

    expect(computeCommercialTotals("AUD", lineItems)).toEqual({
      currencyCode: "AUD",
      subtotalMinor: 100000,
      taxMinor: 10000,
      totalMinor: 110000
    });
  });

  it("derives deposit and invoice status coherently", () => {
    expect(
      computeDepositAmountMinor({
        collectionMode: "deposit-and-balance",
        depositConfig: { type: "percentage", value: 25 },
        totalMinor: 100000
      })
    ).toBe(25000);

    expect(
      deriveInvoiceStatus({
        currentStatus: "sent",
        collectionMode: "deposit-and-balance",
        amountPaidMinor: 25000,
        totalMinor: 100000,
        depositAmountMinor: 25000
      })
    ).toBe("deposit-paid");
  });

  it("builds overdue aging buckets from invoice-driven timing", () => {
    const overdueDays = computeOverdueDays("2026-03-01T00:00:00.000Z", new Date("2026-04-15T00:00:00.000Z"));
    const buckets = addToAgingBuckets(createEmptyAgingBuckets(), overdueDays, 50000);

    expect(overdueDays).toBe(45);
    expect(buckets.find((bucket) => bucket.bucket === "31-60-days")?.amountMinor).toBe(50000);
  });

  it("allocates GST proportionally from payment truth", () => {
    expect(
      allocateTaxFromPayment({
        paymentAmountMinor: 55000,
        invoiceTaxMinor: 10000,
        invoiceTotalMinor: 110000
      })
    ).toBe(5000);
  });

  it("builds coherent forecast buckets and reserve targets", () => {
    const buckets = buildForecastBuckets({
      mode: "monthly",
      from: new Date("2026-04-01T00:00:00.000Z"),
      count: 2
    });

    addToForecastBuckets(buckets, "2026-04-15T00:00:00.000Z", "committedMinor", 90000);
    addToForecastBuckets(buckets, "2026-05-04T00:00:00.000Z", "pipelineMinor", 70000);

    expect(buckets[0]?.committedMinor).toBe(90000);
    expect(buckets[1]?.pipelineMinor).toBe(70000);
    expect(
      getTaxPayableMinor({
        gstRegistered: true,
        reportingMethod: "cash",
        gstCollectedMinor: 12000
      })
    ).toBe(12000);
    expect(
      getReserveTargetMinor({
        taxableSalesMinor: 200000,
        reserveRateBasisPoints: 1500
      })
    ).toBe(30000);
  });

  it("counts unread messages from non-creator participants only", () => {
    expect(
      countUnreadMessagesForCreator(
        [
          {
            id: "message-1",
            threadId: "thread-1",
            creatorUserId: "creator-1",
            senderType: "client",
            body: "Checking in",
            clientVisible: true,
            createdAt: "2026-03-31T10:00:00.000Z"
          },
          {
            id: "message-2",
            threadId: "thread-1",
            creatorUserId: "creator-1",
            senderType: "creator",
            body: "Thanks, replying now",
            clientVisible: true,
            createdAt: "2026-03-31T10:05:00.000Z"
          }
        ],
        {
          id: "read-1",
          threadId: "thread-1",
          participantType: "creator",
          participantUserId: "creator-1",
          lastReadAt: "2026-03-31T09:59:00.000Z"
        }
      )
    ).toBe(1);
  });

  it("maps external busy blocks to public-safe conflict items", () => {
    expect(
      toConflictCenterItem({
        id: "block-1",
        startsAt: "2026-03-31T10:00:00.000Z",
        endsAt: "2026-03-31T11:00:00.000Z",
        timezone: "UTC",
        source: "external-calendar",
        title: "Doctor appointment",
        allDay: false,
        externalProvider: "google-calendar"
      }).publicSafeLabel
    ).toBe("Busy from connected calendar");
  });
});
