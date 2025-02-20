import { v } from "convex/values";
import { query } from "../_generated/server";

// Get all events for a user
export const getEvents = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return events;
  },
});

// Get a specific event by ID
export const getEventById = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    return event;
  },
});

// Get events by status
export const getEventsByStatus = query({
  args: { 
    userId: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    return events;
  },
});

// Get events where user is a participant
export const getInvitedEvents = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting invited events for user:", args.userId);

    // Get all events where:
    // 1. The user is not the creator
    const invitedEvents = await ctx.db
      .query("events")
      .filter((q) => q.neq(q.field("userId"), args.userId))
      .collect();

    console.log("Found events:", invitedEvents);

    // Get all event creator user info
    const creatorIds = [...new Set(invitedEvents.map(event => event.userId))];
    console.log("Creator IDs:", creatorIds);

    const creators = await Promise.all(
      creatorIds.map(async creatorId => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_userId", (q) => q.eq("userId", creatorId))
          .first();
        console.log(`Creator ${creatorId}:`, user);
        return user;
      })
    );

    console.log("All creators:", creators);

    // Create a map of creator IDs to their info
    const creatorMap = new Map(
      creators
        .filter((creator): creator is NonNullable<typeof creator> => creator !== null)
        .map(creator => [creator.userId, creator])
    );

    console.log("Creator map:", Object.fromEntries(creatorMap));

    // Now filter to only include events where the user is a participant
    const filteredEvents = invitedEvents.filter(event => {
      // For each event, check if any of its participants is a contact that represents the current user
      return event.participantIds.some(async participantId => {
        const contact = await ctx.db
          .query("contacts")
          .filter((q) => 
            q.and(
              q.eq(q.field("_id"), participantId),
              q.eq(q.field("userId"), args.userId)
            )
          )
          .first();
        return !!contact;
      });
    });

    // Add creator info to each event
    const eventsWithCreators = filteredEvents.map(event => {
      const creator = creatorMap.get(event.userId);
      console.log(`Event ${event._id} creator:`, creator);
      return {
        ...event,
        creator
      };
    });

    console.log("Final filtered events with creators:", eventsWithCreators);
    return eventsWithCreators;
  },
});
