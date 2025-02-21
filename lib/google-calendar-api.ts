import { auth } from "@clerk/nextjs";

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

interface FreeBusyRequest {
    timeMin: string;
    timeMax: string;
    items: { id: string }[];
}

interface FreeBusyResponse {
    calendars: {
        [key: string]: {
            busy: Array<{
                start: string;
                end: string;
            }>;
        };
    };
}

interface GoogleEvent {
    summary: string;
    description: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    attendees?: Array<{
        email: string;
    }>;
}

export class GoogleCalendarAPIClient {
    private token: string;
    private timeZone: string;

    constructor(token: string, timeZone: string = "UTC") {
        this.token = token;
        this.timeZone = timeZone;
    }

    private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Google Calendar API request failed");
        }

        return response.json();
    }

    async getFreeBusy(
        timeMin: string,
        timeMax: string,
        calendarIds: string[]
    ): Promise<FreeBusyResponse> {
        const request: FreeBusyRequest = {
            timeMin,
            timeMax,
            items: calendarIds.map(id => ({ id })),
        };

        return this.fetchWithAuth("/freeBusy", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    async createEvent(event: {
        summary: string;
        description: string;
        start: string;
        end: string;
        attendees: string[];
    }): Promise<{ id: string }> {
        const googleEvent: GoogleEvent = {
            summary: event.summary,
            description: event.description,
            start: {
                dateTime: event.start,
                timeZone: this.timeZone,
            },
            end: {
                dateTime: event.end,
                timeZone: this.timeZone,
            },
            attendees: event.attendees.map(email => ({ email })),
        };

        return this.fetchWithAuth("/calendars/primary/events", {
            method: "POST",
            body: JSON.stringify(googleEvent),
        });
    }

    async updateEvent(
        eventId: string,
        updates: Partial<{
            summary: string;
            description: string;
            start: string;
            end: string;
            attendees: string[];
        }>
    ): Promise<void> {
        const googleEvent: Partial<GoogleEvent> = {
            ...(updates.summary && { summary: updates.summary }),
            ...(updates.description && { description: updates.description }),
            ...(updates.start && {
                start: { dateTime: updates.start, timeZone: this.timeZone },
            }),
            ...(updates.end && {
                end: { dateTime: updates.end, timeZone: this.timeZone },
            }),
            ...(updates.attendees && {
                attendees: updates.attendees.map(email => ({ email })),
            }),
        };

        await this.fetchWithAuth(`/calendars/primary/events/${eventId}`, {
            method: "PATCH",
            body: JSON.stringify(googleEvent),
        });
    }

    async deleteEvent(eventId: string): Promise<void> {
        await this.fetchWithAuth(`/calendars/primary/events/${eventId}`, {
            method: "DELETE",
        });
    }
}
