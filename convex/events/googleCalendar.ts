import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { RecommendedTimeSlot, TimeSlot, googleCalendarAPI } from "../../lib/google-calendar";

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

        try {
            // Get availability for all participants using Google Calendar API
            const recommendedSlots = await googleCalendarAPI.checkAvailability(
                timeSlots,
                event.participantIds
            );

            // Sort slots by score (highest first)
            const sortedSlots = [...recommendedSlots].sort((a, b) => b.score - a.score);

            // Update the event with recommended time slots
            await ctx.db.patch(args.eventId, {
                recommendedTimeSlots: sortedSlots
            });

            return sortedSlots;
        } catch (error) {
            console.error("Failed to get calendar availability:", error);
            throw new Error("Failed to get calendar availability");
        }
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

        try {
            // Create event in Google Calendar
            const googleEventId = await googleCalendarAPI.createEvent({
                summary: event.title,
                description: event.description,
                start: args.startTime,
                end: args.endTime,
                attendees: event.participantIds
            });

            // Update the event with selected time slot and Google Calendar ID
            await ctx.db.patch(args.eventId, {
                selectedTimeSlot: {
                    start: args.startTime,
                    end: args.endTime,
                    confirmedParticipants: []
                },
                startTime: args.startTime,
                endTime: args.endTime,
                googleCalendarEventId: googleEventId
            });

            return { success: true, googleEventId };
        } catch (error) {
            console.error("Failed to create Google Calendar event:", error);
            throw new Error("Failed to create Google Calendar event");
        }
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
        if (!event.googleCalendarEventId) throw new Error("No Google Calendar event ID found");

        try {
            // Update the Google Calendar event
            await googleCalendarAPI.updateEvent(
                event.googleCalendarEventId,
                {
                    summary: event.title,
                    description: event.description,
                    start: event.selectedTimeSlot.start,
                    end: event.selectedTimeSlot.end,
                    attendees: event.participantIds
                }
            );

            return { success: true };
        } catch (error) {
            console.error("Failed to sync with Google Calendar:", error);
            throw new Error("Failed to sync with Google Calendar");
        }
    },
});
