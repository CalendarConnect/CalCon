import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { api } from "../_generated/api";

// Create a new event
export const createEvent = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    duration: v.string(),
    participantIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check subscription status
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    // Get current usage
    const usage = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // If no active subscription or not pro plan and reached limit
    if ((!subscription || subscription.status !== "active") && usage.length >= 3) {
      throw new Error("Free tier limit reached: Maximum 3 events. Please upgrade to create more events.");
    }

    const now = new Date().toISOString();

    // Debug logging
    console.log("Creating event with participant IDs:", args.participantIds);

    // Explicitly define all fields to match schema
    const eventData = {
      userId: args.userId,
      title: args.title,
      description: args.description,
      location: args.location,
      duration: args.duration,
      participantIds: args.participantIds,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    };

    const eventId = await ctx.db.insert("events", eventData);
    return eventId;
  },
});

// Update an event
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    duration: v.optional(v.string()),
    participantIds: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    
    await ctx.db.patch(id, updatedFields);
    return id;
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Update event status
export const updateEventStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const updates = {
      status: args.status,
      updatedAt: new Date().toISOString(),
    };

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});
