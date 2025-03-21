import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Create a new event
export const createEvent = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    duration: v.string(),
    participantIds: v.array(v.id("contacts")),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Creating event with args:", args);

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

    // Create the event first
    const eventData = {
      userId: args.userId,
      title: args.title,
      description: args.description,
      location: args.location,
      duration: args.duration,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
      timezone: args.timezone,
    };

    console.log("Creating event with data:", eventData);

    // Insert the event
    const eventId = await ctx.db.insert("events", eventData);
    console.log("Created event with ID:", eventId);

    console.log("Creating participants for event:", args.participantIds);

    // Create participant entries
    await Promise.all(
      args.participantIds.map(async (participantId) => {
        console.log("Creating participant entry:", { eventId, participantId });
        const participantEntry = await ctx.db.insert("eventParticipants", {
          eventId,
          participantId,
          status: "pending",
          updatedAt: now
        });
        console.log("Created participant entry:", participantEntry);
        return participantEntry;
      })
    );

    // Verify participants were created
    const createdParticipants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    
    console.log("Verified created participants:", createdParticipants);

    return eventId;
  },
});

// Update participant status
export const updateParticipantStatus = mutation({
  args: {
    eventId: v.id("events"),
    participantId: v.id("contacts"),
    status: v.union(v.literal("accepted"), v.literal("declined")),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // Update participant status
    const participant = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("participantId"), args.participantId))
      .first();

    if (!participant) {
      throw new Error("Participant not found");
    }

    const updateData: any = {
      status: args.status,
      updatedAt: now,
    };

    // Only store timezone if the participant accepts and provides it
    if (args.status === "accepted" && args.timezone) {
      updateData.timezone = args.timezone;
    }

    await ctx.db.patch(participant._id, updateData);
    await ctx.db.patch(args.eventId, { updatedAt: now });

    return participant._id;
  },
});

// Update an event
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    duration: v.string(),
    participantIds: v.array(v.id("contacts")),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const now = new Date().toISOString();

    // Get current participants
    const currentParticipants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get current participant IDs
    const currentParticipantIds = currentParticipants.map(p => p.participantId);

    // Find new participants to add
    const newParticipantIds = args.participantIds.filter(
      id => !currentParticipantIds.some(currentId => currentId === id)
    );

    // Add new participants
    await Promise.all(
      newParticipantIds.map(async (participantId) => {
        await ctx.db.insert("eventParticipants", {
          eventId: args.eventId,
          participantId,
          status: "pending",
          updatedAt: now
        });
      })
    );

    // Remove participants that are no longer included
    await Promise.all(
      currentParticipants
        .filter(p => !args.participantIds.some(id => id === p.participantId))
        .map(async (p) => {
          await ctx.db.delete(p._id);
        })
    );

    // Update the event
    await ctx.db.patch(args.eventId, {
      title: args.title,
      description: args.description,
      location: args.location,
      duration: args.duration,
      updatedAt: now,
    });

    return args.eventId;
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Get the event first to check if it's confirmed
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    // First get all participants for this event
    const participants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();

    // If the event is confirmed and has calendar links, we need to delete from calendars
    if (event.status === "confirmed" && event.calendarEventLink) {
      // Note: The actual calendar deletion will be handled by the client-side
      // through the Google Calendar API, as we need OAuth tokens
      
      // Update event status to cancelled first
      await ctx.db.patch(args.id, { 
        status: "cancelled",
        updatedAt: new Date().toISOString()
      });
    }

    // Delete all participant entries
    await Promise.all(
      participants.map(async (participant) => {
        await ctx.db.delete(participant._id);
      })
    );

    // Finally delete the event itself
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Update event status
export const updateEventStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.patch(args.id, { 
      status: args.status,
      updatedAt: now
    });
    return args.id;
  },
});

// Remove participant from event
export const removeParticipant = mutation({
  args: {
    eventId: v.id("events"),
    participantId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    // Find the participant entry
    const participant = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("participantId"), args.participantId))
      .first();

    if (!participant) {
      throw new Error("Participant not found");
    }

    // Delete just this participant entry
    await ctx.db.delete(participant._id);
    return participant._id;
  },
});

export const updateEventDateTime = mutation({
  args: {
    eventId: v.id("events"),
    selectedDateTime: v.string(),
  },
  handler: async (ctx, args) => {
    const { eventId, selectedDateTime } = args;

    // Update the event with the selected date/time
    const updatedEvent = await ctx.db.patch(eventId, {
      selectedDateTime,
      updatedAt: new Date().toISOString(),
    });

    return updatedEvent;
  }
});

// Update event with calendar links
export const updateEventWithCalendarLinks = mutation({
  args: {
    eventId: v.id("events"),
    calendarEventLink: v.string(),
    meetLink: v.optional(v.string()),
    googleCalendarEventId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    await ctx.db.patch(args.eventId, {
      status: "confirmed",
      calendarEventLink: args.calendarEventLink,
      meetLink: args.meetLink,
      googleCalendarEventId: args.googleCalendarEventId,
      updatedAt: now,
    });

    return args.eventId;
  },
});
