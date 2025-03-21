import { defineSchema, defineTable } from "convex/server"
import { Infer, v } from "convex/values"

export const INTERVALS = {
    MONTH: "month",
    YEAR: "year",
} as const;

export const intervalValidator = v.union(
    v.literal(INTERVALS.MONTH),
    v.literal(INTERVALS.YEAR),
);

export type Interval = Infer<typeof intervalValidator>;

// Define a price object structure that matches your data
const priceValidator = v.object({
    amount: v.number(),
    polarId: v.string(),
});

// Define a prices object structure for a specific interval
const intervalPricesValidator = v.object({
    usd: priceValidator,
});


export default defineSchema({
    users: defineTable({
        createdAt: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        userId: v.string(),
        subscription: v.optional(v.string()),
        credits: v.optional(v.string()),
        tokenIdentifier: v.string(),
    })
        .index("by_token", ["tokenIdentifier"])
        .index("by_userId", ["userId"]),
    plans: defineTable({
        key: v.string(),
        name: v.string(),
        description: v.string(),
        polarProductId: v.string(),
        prices: v.object({
            month: v.optional(intervalPricesValidator),
            year: v.optional(intervalPricesValidator),
        }),
    })
        .index("key", ["key"])
        .index("polarProductId", ["polarProductId"]),
    subscriptions: defineTable({
        userId: v.optional(v.string()),
        polarId: v.optional(v.string()),
        polarPriceId: v.optional(v.string()),
        currency: v.optional(v.string()),
        interval: v.optional(v.string()),
        status: v.optional(v.string()),
        currentPeriodStart: v.optional(v.number()),
        currentPeriodEnd: v.optional(v.number()),
        cancelAtPeriodEnd: v.optional(v.boolean()),
        amount: v.optional(v.number()),
        startedAt: v.optional(v.number()),
        endsAt: v.optional(v.number()),
        endedAt: v.optional(v.number()),
        canceledAt: v.optional(v.number()),
        customerCancellationReason: v.optional(v.string()),
        customerCancellationComment: v.optional(v.string()),
        metadata: v.optional(v.any()),
        customFieldData: v.optional(v.any()),
        customerId: v.optional(v.string()),
    })
        .index("userId", ["userId"])
        .index("polarId", ["polarId"]),
    webhookEvents: defineTable({
        type: v.string(),
        polarEventId: v.string(),
        createdAt: v.string(),
        modifiedAt: v.string(),
        data: v.any(),
    })
        .index("type", ["type"])
        .index("polarEventId", ["polarEventId"]),
    contacts: defineTable({
        userId: v.string(),
        contactUserId: v.optional(v.string()),
        fullName: v.string(),
        companyName: v.string(),
        role: v.string(),
        email: v.string(),
        status: v.union(v.literal("connected"), v.literal("pending"), v.literal("declined")),
        createdAt: v.string(),
        updatedAt: v.string(),
        senderName: v.optional(v.string()),
        senderEmail: v.optional(v.string()),
    })
        .index("by_userId", ["userId"])
        .index("by_email", ["email"])
        .index("by_status", ["userId", "status"]),
    events: defineTable({
        userId: v.string(), // Creator's user ID
        title: v.string(),
        description: v.string(),
        location: v.string(),
        duration: v.string(), // Duration in minutes
        status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("archived")),
        selectedDateTime: v.optional(v.string()),
        calendarEventLink: v.optional(v.string()),
        meetLink: v.optional(v.string()),
        googleCalendarEventId: v.optional(v.string()), // ID from Google Calendar API
        createdAt: v.string(),
        updatedAt: v.string(),
        timezone: v.string(), // Creator's timezone
    })
        .index("by_status", ["userId", "status"]),
    eventParticipants: defineTable({
        eventId: v.id("events"),
        participantId: v.id("contacts"),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
        updatedAt: v.string(),
        timezone: v.optional(v.string()), // Participant's timezone when accepting
    })
        .index("by_participant", ["participantId"])
        .index("by_event", ["eventId"]),
    waitlist: defineTable({
        email: v.string(),
        createdAt: v.string(),
    })
        .index("by_email", ["email"]),
})