import { query } from "../_generated/server";
import { v } from "convex/values";

// Get the number of events and contacts for a user
export const getUserUsage = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Count events
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // Count contacts
    const contacts = await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    return {
      eventsCount: events.length,
      contactsCount: contacts.length,
      // Free tier limits
      eventsLimit: 3,
      contactsLimit: 3,
      // Whether user has reached limits
      hasReachedEventsLimit: events.length >= 3,
      hasReachedContactsLimit: contacts.length >= 3,
    };
  },
});
