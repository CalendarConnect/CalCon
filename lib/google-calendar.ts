import { auth } from "@clerk/nextjs";
import { GoogleCalendarAPIClient } from "./google-calendar-api";

export interface GoogleCalendarCredentials {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
}

export interface TimeSlot {
    start: string;
    end: string;
}

export interface ParticipantAvailability {
    participantId: string;
    available: boolean;
    conflictingEventIds?: string[];
}

export interface RecommendedTimeSlot extends TimeSlot {
    score: number;
    participantAvailability: ParticipantAvailability[];
}

class GoogleCalendarAPI {
    private credentials: GoogleCalendarCredentials | null = null;
    private apiClient: GoogleCalendarAPIClient | null = null;
    private static instance: GoogleCalendarAPI;

    private constructor() {}

    static getInstance(): GoogleCalendarAPI {
        if (!GoogleCalendarAPI.instance) {
            GoogleCalendarAPI.instance = new GoogleCalendarAPI();
        }
        return GoogleCalendarAPI.instance;
    }

    async initialize(): Promise<void> {
        const { getToken } = auth();
        const token = await getToken({ template: "google-calendar" });
        
        if (!token) {
            throw new Error("No Google Calendar token found");
        }

        this.credentials = {
            access_token: token,
            refresh_token: "", // Will be implemented with proper token refresh
            expiry_date: 0 // Will be implemented with proper token management
        };

        this.apiClient = new GoogleCalendarAPIClient(token);
    }

    private async ensureInitialized() {
        if (!this.credentials || !this.apiClient) {
            await this.initialize();
        }
    }

    async checkAvailability(
        timeSlots: TimeSlot[],
        participantIds: string[]
    ): Promise<RecommendedTimeSlot[]> {
        await this.ensureInitialized();
        if (!this.apiClient) throw new Error("API client not initialized");

        const timeMin = timeSlots[0].start;
        const timeMax = timeSlots[timeSlots.length - 1].end;

        // Get busy periods for all participants
        const freeBusy = await this.apiClient.getFreeBusy(
            timeMin,
            timeMax,
            participantIds
        );

        // Calculate availability and scores for each time slot
        return timeSlots.map(slot => {
            const participantAvailability = participantIds.map(id => {
                const busyPeriods = freeBusy.calendars[id]?.busy || [];
                const hasConflict = busyPeriods.some(
                    period =>
                        new Date(period.start) < new Date(slot.end) &&
                        new Date(period.end) > new Date(slot.start)
                );

                return {
                    participantId: id,
                    available: !hasConflict,
                    conflictingEventIds: [] // Could be populated if needed
                };
            });

            // Calculate score based on availability
            const availableCount = participantAvailability.filter(p => p.available).length;
            const score = (availableCount / participantIds.length) * 100;

            return {
                ...slot,
                score,
                participantAvailability
            };
        });
    }

    async createEvent(
        eventDetails: {
            summary: string;
            description: string;
            start: string;
            end: string;
            attendees: string[];
        }
    ): Promise<string> {
        await this.ensureInitialized();
        if (!this.apiClient) throw new Error("API client not initialized");

        const response = await this.apiClient.createEvent(eventDetails);
        return response.id;
    }

    async updateEvent(
        googleEventId: string,
        updates: Partial<{
            summary: string;
            description: string;
            start: string;
            end: string;
            attendees: string[];
        }>
    ): Promise<void> {
        await this.ensureInitialized();
        if (!this.apiClient) throw new Error("API client not initialized");

        await this.apiClient.updateEvent(googleEventId, updates);
    }

    async deleteEvent(googleEventId: string): Promise<void> {
        await this.ensureInitialized();
        if (!this.apiClient) throw new Error("API client not initialized");

        await this.apiClient.deleteEvent(googleEventId);
    }
}

export const googleCalendarAPI = GoogleCalendarAPI.getInstance();
