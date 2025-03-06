import { v } from "convex/values";
import { query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Get all events for a user
export const getEvents = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("========= Getting User Events =========");
    console.log("User ID:", args.userId);

    // Get user's events
    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    console.log("Found events:", events);

    // For each event, get participants and their statuses
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        console.log("Getting participants for event:", event._id);
        
        // Get all participants for this event
        const participants = await ctx.db
          .query("eventParticipants")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();

        console.log("Found participants:", participants);

        // Get contact details for each participant
        const participantsWithDetails = await Promise.all(
          participants.map(async (participant) => {
            const contact = await ctx.db.get(participant.participantId);
            return {
              ...participant,
              contact
            };
          })
        );

        console.log("Participants with details:", participantsWithDetails);

        return {
          ...event,
          participants: participantsWithDetails
        };
      })
    );

    console.log("Final events with participants:", eventsWithParticipants);
    console.log("========= End Getting User Events =========");

    return eventsWithParticipants;
  },
});

// Get a specific event by ID
export const getEvent = query({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    console.log("========= Getting Event Details =========");
    console.log("Event ID:", args.id);

    const event = await ctx.db.get(args.id);
    if (!event) {
      console.log("Event not found");
      return null;
    }

    // Get creator info
    console.log("Fetching creator info for event:", event.userId);
    const creator = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", event.userId))
      .first();
    console.log("Creator info:", creator);

    // Get all participants for this event with their contact details
    console.log("Fetching participants for event:", args.id);
    const participants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();

    // Get contact details for each participant
    const participantsWithDetails = await Promise.all(
      participants.map(async (participant) => {
        const contact = await ctx.db.get(participant.participantId);
        return {
          ...participant,
          contact
        };
      })
    );

    console.log("Participants with details:", participantsWithDetails);
    console.log("========= End Getting Event Details =========");

    return {
      ...event,
      creator,
      participants: participantsWithDetails
    };
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
      .withIndex("by_status", (q) => 
        q.eq("userId", args.userId).eq("status", args.status)
      )
      .collect();

    return events;
  },
});

// Get events where user is a participant with their status
export const getInvitedEvents = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("========= Getting Invited Events =========");
    console.log("User ID:", args.userId);

    // First get contacts where this user is the contact (not the owner)
    const userAsContact = await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("contactUserId"), args.userId))
      .collect();

    console.log("User as contact:", userAsContact.map(c => ({ id: c._id, name: c.fullName })));

    if (userAsContact.length === 0) {
      console.log("No contacts found where user is contact");
      return [];
    }

    // Get all event participations for these contacts
    console.log("Fetching participations for contacts...");
    const participations = await Promise.all(
      userAsContact.map(async (contact) => {
        console.log("Checking participations for contact:", contact._id);
        const contactParticipations = await ctx.db
          .query("eventParticipants")
          .withIndex("by_participant", (q) => q.eq("participantId", contact._id))
          .collect();
        console.log("Found participations for contact:", contactParticipations);
        return contactParticipations;
      })
    );

    // Flatten participations array
    const allParticipations = participations.flat();
    console.log("All participations found:", allParticipations);

    if (allParticipations.length === 0) {
      console.log("No participations found");
      return [];
    }

    // Get unique event IDs
    const eventIds = [...new Set(allParticipations.map(p => p.eventId))];
    console.log("Unique event IDs:", eventIds);

    // Get all events
    console.log("Fetching full event details...");
    const events = await Promise.all(
      eventIds.map(async (eventId) => {
        console.log("Fetching event:", eventId);
        const event = await ctx.db.get(eventId);
        if (!event) {
          console.log("Event not found:", eventId);
          return null;
        }
        
        // Get creator info
        console.log("Fetching creator info for event:", event.userId);
        const creator = await ctx.db
          .query("users")
          .withIndex("by_userId", (q) => q.eq("userId", event.userId))
          .first();
        console.log("Creator info:", creator);

        // Get all participants for this event
        console.log("Fetching participants for event:", eventId);
        const eventParticipants = await ctx.db
          .query("eventParticipants")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect();
        console.log("Event participants:", eventParticipants);

        // Find this user's participation status
        const userParticipation = eventParticipants.find(p => 
          userAsContact.some(contact => contact._id === p.participantId)
        );
        console.log("User participation status:", userParticipation);

        return {
          ...event,
          creator,
          participantStatus: userParticipation?.status || "pending",
          participantId: userParticipation?.participantId,
          participants: eventParticipants
        };
      })
    );

    // Filter out null events and events where user is creator
    const filteredEvents = events
      .filter((event): event is NonNullable<typeof event> => 
        event !== null && event.userId !== args.userId
      );

    console.log("Final filtered events:", filteredEvents);
    console.log("========= End Getting Invited Events =========");
    
    return filteredEvents;
  },
});

// Get participant statuses for an event
export const getEventParticipantStatuses = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // Get all participants for this event
    const participants = await ctx.db
      .query("eventParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return participants;
  },
});
