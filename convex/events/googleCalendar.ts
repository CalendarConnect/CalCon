import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { RecommendedTimeSlot, TimeSlot } from "../../lib/google-calendar";

// Helper function to generate time slots for a given duration and date range
function generateTimeSlots(
    startDate: Date,
    endDate: Date,
    durationMinutes: number
): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const current = new Date(startDate);
    
    while (current < endDate) {
        const start = new Date(current);
        const end = new Date(current.getTime() + durationMinutes * 60000);
        
        // Only add slots during business hours (9 AM - 5 PM)
        if (start.getHours() >= 9 && end.getHours() <= 17) {
            slots.push({
                start: start.toISOString(),
                end: end.toISOString(),
            });
        }
        
        // Move to next 30-minute slot
        current.setMinutes(current.getMinutes() + 30);
    }
    
    return slots;
}

export const getRecommendedTimeSlots = mutation({
    args: {
        eventId: v.id("events"),
        startDate: v.string(), // ISO string
        endDate: v.string(),   // ISO string
    },
    handler: async (ctx, args) => {
        // Get the event details
        const event = await ctx.db.get(args.eventId);
        if (!event) throw new Error("Event not found");

        // Generate time slots based on event duration
        const duration = parseInt(event.duration);
        const timeSlots = generateTimeSlots(
            new Date(args.startDate),
            new Date(args.endDate),
            duration
        );

        // Get availability for all participants
        // This will be implemented to call Google Calendar API
        const recommendedSlots: RecommendedTimeSlot[] = timeSlots.map(slot => ({
            ...slot,
            score: 0, // Will be calculated based on availability
            participantAvailability: event.participantIds.map(id => ({
                participantId: id,
                available: true, // Will be determined by Google Calendar
                conflictingEventIds: []
            }))
        }));

        // Update the event with recommended time slots
        await ctx.db.patch(args.eventId, {
            recommendedTimeSlots: recommendedSlots
        });

        return recommendedSlots;
    },
});

export const selectTimeSlot = mutation({
    args: {
        eventId: v.id("events"),
        startTime: v.string(),
        endTime: v.string(),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);
        if (!event) throw new Error("Event not found");

        // Update the event with selected time slot
        await ctx.db.patch(args.eventId, {
            selectedTimeSlot: {
                start: args.startTime,
                end: args.endTime,
                confirmedParticipants: [] // Will be populated as participants confirm
            },
            startTime: args.startTime,
            endTime: args.endTime
        });

        // Create event in Google Calendar
        // This will be implemented to call Google Calendar API
        return { success: true };
    },
});

export const syncWithGoogleCalendar = mutation({
    args: {
        eventId: v.id("events"),
    },
    handler: async (ctx, args) => {
        const event = await ctx.db.get(args.eventId);
        if (!event) throw new Error("Event not found");
        if (!event.selectedTimeSlot) throw new Error("No time slot selected");

        // This will be implemented to:
        // 1. Create/update event in Google Calendar
        // 2. Send invites to participants
        // 3. Store Google Calendar event ID
        
        return { success: true };
    },
});
