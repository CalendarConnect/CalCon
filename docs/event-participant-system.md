# CalendarConnect Documentation

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [System Architecture](#system-architecture)
   - [Database Schema](#database-schema)
   - [Security Model](#security-model)
4. [Core Functionality](#core-functionality)
   - [Event Creation](#event-creation)
   - [Participant Management](#participant-management)
   - [Availability Checking](#availability-checking)
5. [Google Calendar Integration](#google-calendar-integration)
   - [Authentication](#authentication)
   - [Calendar Access](#calendar-access)
   - [Time Slot Management](#time-slot-management)
6. [Best Practices](#best-practices)
   - [Performance Guidelines](#performance-guidelines)
   - [Error Handling](#error-handling)
   - [Security Guidelines](#security-guidelines)

## Overview

CalendarConnect is a scheduling system that helps groups find mutually available meeting times through Google Calendar integration. The system automates the process of checking participants' calendars and finding suitable meeting slots while respecting business hours and scheduling constraints.

## Project Structure

```
├── app/
│   ├── (pages)/
│   │   ├── dashboard/
│   │   │   ├── events/
│   │   │   │   ├── page.tsx               # Main events page with calendar integration
│   │   │   │   └── loading.tsx            # Loading state component
│   │   │   └── _components/
│   │   │       ├── event-card.tsx         # Event display component
│   │   │       ├── time-slot-dialog.tsx   # Time slot selection dialog
│   │   │       └── google-calendar-button.tsx  # OAuth connection button
│   │   └── layout.tsx
│   └── actions/
│       └── google-calendar.ts             # Server actions for calendar operations
├── server/
│   └── googleCalendar.ts                  # Core calendar integration logic
├── convex/
│   ├── events/
│   │   ├── mutations.ts                   # Event CRUD operations
│   │   └── queries.ts                     # Event queries
│   ├── schema.ts                          # Database schema
│   └── _generated/                        # Generated type definitions
├── types/
│   ├── event.ts                           # Event type definitions
│   └── google.ts                          # Google Calendar type definitions
└── docs/
    └── event-participant-system.md        # This documentation file
```

## System Architecture

### Database Schema

#### Events Table
```typescript
events: defineTable({
    userId: v.string(),        // Creator's user ID from Clerk
    title: v.string(),        
    description: v.string(),  
    location: v.string(),     
    duration: v.string(),     // Duration in minutes
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    selectedDateTime: v.optional(v.string()), // Selected meeting time
    createdAt: v.string(),   
    updatedAt: v.string(),   
})
.index("by_status", ["userId", "status"])
```

#### Event Participants Table
```typescript
eventParticipants: defineTable({
    eventId: v.id("events"),          
    participantId: v.id("contacts"),   
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    updatedAt: v.string()
})
.index("by_participant", ["participantId"])
.index("by_event", ["eventId"])
```

### Security Model

1. Token Management
   - OAuth tokens managed by Clerk
   - No token storage in application
   - Automatic token refresh
   - Server-side token handling only

2. Access Control
   - Per-participant OAuth authorization
   - Limited to free/busy information
   - No access to detailed calendar data
   - Scoped availability results

## Core Functionality

### Event Creation
1. User Input Collection
   - Title and description
   - Location
   - Duration
   - Participant selection
2. Initial Status
   - Event marked as "pending"
   - Invitations sent to participants

### Participant Management
1. Acceptance Flow
   - Invitation receipt
   - OAuth authorization
   - Calendar access grant
2. Prerequisites
   - All participants must accept
   - Calendar access must be granted

### Availability Checking
1. Process Flow
   - Participant acceptance verification
   - Calendar availability check
   - Time slot selection
   - Notification of selection

2. Time Constraints
   - Business hours (9 AM - 5 PM)
   - Weekdays only
   - Meeting end time before 5 PM
   - Three slots from different dates

## Google Calendar Integration

### Authentication
```typescript
async function getOAuthClient() {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const response = await clerk.users.getUserOauthAccessToken(
      userId,
      "oauth_google"
    );

    const token = response.data[0];
    if (!token?.token) {
      throw new Error("No OAuth token found");
    }

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL
    );

    client.setCredentials({ access_token: token.token });
    return client;
  } catch (error) {
    console.error("[Calendar] Error getting OAuth client:", error);
    throw error;
  }
}
```

### Calendar Access

1. Request Structure
```typescript
interface EventDetails {
  eventId: Id<"events">;
  creator: Participant;
  participants: Participant[];
  timezone: string;
  duration: string;
}

interface Participant {
  clerkUserId: string;
}

interface TimeSlot {
  start: string;
  end: string;
  participantAvailability: {
    [participantId: string]: {
      available: boolean;
      conflicts?: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}
```

2. Business Rules
```typescript
function isBusinessHour(date: Date): boolean {
  const hours = date.getHours();
  return hours >= 9 && hours < 17; // 9 AM to 5 PM
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
}

function getNextBusinessHourStart(date: Date): Date {
  const next = new Date(date);
  // Round to nearest 15 minutes
  next.setMinutes(Math.floor(next.getMinutes() / 15) * 15);
  next.setSeconds(0);
  next.setMilliseconds(0);

  // If outside business hours, move to next day at 9 AM
  if (next.getHours() >= 17) {
    next.setDate(next.getDate() + 1);
    next.setHours(9);
    next.setMinutes(0);
  } else if (next.getHours() < 9) {
    next.setHours(9);
    next.setMinutes(0);
  }

  // If it's weekend, move to Monday
  while (!isWeekday(next)) {
    next.setDate(next.getDate() + 1);
    next.setHours(9);
    next.setMinutes(0);
  }

  return next;
}
```

### Time Slot Management

1. Duration Handling
```typescript
function durationToMinutes(duration: string): number {
  const durationMap: { [key: string]: number } = {
    "15": 15,
    "30": 30,
    "45": 45,
    "1 hour": 60,
    "2 hours": 120,
    "3 hours": 180
  };
  
  const minutes = durationMap[duration];
  if (!minutes) {
    console.warn("[Calendar] Unknown duration format:", duration, "defaulting to 60 minutes");
    return 60;
  }
  return minutes;
}
```

2. Availability Checking Process
```typescript
async function checkAvailability(eventDetails: EventDetails): Promise<TimeSlot[]> {
  // 1. Get emails for all participants from Clerk
  const participantEmails = await Promise.all(
    allParticipants.map(async (p) => {
      const user = await clerk.users.getUser(p.clerkUserId);
      return user.primaryEmailAddress?.emailAddress;
    })
  );

  // 2. Set up time window (next 7 days)
  const timeMin = getNextBusinessHourStart(new Date());
  const timeMax = addDays(timeMin, 7);

  // 3. Query FreeBusy API
  const freeBusy = await calendar.freebusy.query({
    auth: oAuthClient,
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: timezone,
      items: validParticipants.map(p => ({ id: p.email }))
    }
  });

  // 4. Process busy periods and find available slots
  const availableSlots = findAvailableSlots(
    busyPeriods,
    timeMin,
    timeMax,
    durationToMinutes(duration),
    timezone
  );

  return availableSlots.slice(0, 3);
}
```

## Best Practices

### Performance Guidelines
1. Calendar Operations
   - Parallel participant email retrieval
   - Efficient FreeBusy API usage
   - 7-day search window (reduced from 30)
   - Three-slot limit with different dates
   - 15-minute slot increments

2. Data Management
   - Clerk for user email management
   - Google Calendar for availability data
   - Timezone-aware operations
   - Efficient conflict detection

### Error Handling
1. Token Management
   - Proper Clerk authentication checks
   - OAuth token validation
   - Detailed error logging with [Calendar] prefix
   - Clear error messages for debugging

2. Calendar Access
   - Participant email validation
   - FreeBusy API error handling
   - Timezone conversion safety
   - Null safety for API responses

### Security Guidelines
1. Token Protection
   - Server-side only OAuth token access
   - Clerk-managed OAuth flow
   - No client-side token exposure
   - Environment variable protection

2. Access Control
   - Per-user authentication checks
   - FreeBusy-only calendar access
   - Email-based calendar queries
   - Participant validation

### Key Features
1. Time Slot Selection
   - Business hours enforcement (9 AM - 5 PM)
   - Weekday-only scheduling
   - Meeting end time before 5 PM
   - Different dates for each slot
   - Conflict-free scheduling

2. Timezone Handling
   - Consistent timezone usage
   - Local time display
   - UTC conversion handling
   - Business hours in local time
