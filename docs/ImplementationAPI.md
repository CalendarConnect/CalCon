# Google Calendar Time Slot Recommendation Implementation

## CalCon Overview
CalendarConnect (CalCon) is a modern calendar application built with:
- Next.js 15 (App Router)
- TypeScript
- Clerk for authentication
- Convex DB for real-time data
- Tailwind CSS & shadcn/ui for UI
- Polar.sh for subscriptions

The application allows users to manage events and contacts in a business context, with a focus on efficient scheduling and participant management.

NO modifications to existing Clerk implementation
NO changes to authentication flows
Maintain current provider setup in app/provider.tsx
Component Usage
MUST use existing components from components directory
NO custom CSS/Tailwind modifications
Follow existing styling patterns exactly

Feature Description: Smart Time Slot Recommendations
Purpose
Enhance event creation by automatically suggesting optimal meeting times based on all participants' Google Calendar availability, reducing the back-and-forth typically needed to schedule meetings.

User Flow
Initial Authentication
User signs up/logs in using Clerk with Google
Google Calendar access granted during authentication
Tokens stored securely in Clerk's private metadata
Event Creation a. User clicks "Create Event" in dashboard b. Fills required information:
Title
Description
Location
Duration (15/30/45/60/120/180 minutes)
Selects participants from contacts c. System automatically:
Checks all participants' Google Calendar availability
Finds common free time slots
Ranks slots based on business hours preference
Shows top 3 recommendations d. User selects preferred time slot e. Event is created and added to all calendars
Post-Creation
Event appears in CalCon dashboard
Added to all participants' Google Calendars
Status updates in real-time



## Core Technical Rules
1. **Clerk Implementation**
   - MUST use existing Clerk import patterns:
   ```typescript
   import { useUser } from "@clerk/nextjs";
   import { auth } from "@clerk/nextjs";

## Overview
Integration of Google Calendar API for automatic time slot recommendations in event creation process.

## System Architecture

### Current System
- Event creation using Convex DB
- Participant selection from contacts
- Status management (pending/confirmed/cancelled)

### New Integration Components
- Google Calendar API integration via Clerk OAuth
- FreeBusy API for availability checking
- Time slot recommendation algorithm
- Time slot selection UI

Technical Implementation Details
1. Current Event Schema

events: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    duration: v.string(),
    participantIds: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    createdAt: v.string(),
    updatedAt: v.string(),
})

2. Required Schema Extensions

events: defineTable({
    // ... existing fields ...
    
    // New fields
    recommendedTimeSlots: v.optional(v.array(v.object({
        start: v.string(),
        end: v.string(),
        score: v.number(),
        participantAvailability: v.array(v.object({
            userId: v.string(),
            available: v.boolean(),
        })),
    }))),
    selectedTimeSlot: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        googleEventIds: v.array(v.string()), // IDs of created Google Calendar events
    })),
    timezone: v.string(),
})


3. Clerk Integration Details

// Current provider setup (MUST NOT MODIFY)
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

export default function Provider({ children }: { children: ReactNode }) {
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

4. Token Management

// Store in Clerk's private metadata
interface GoogleTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

// Token refresh mechanism
async function getValidGoogleToken(userId: string): Promise<string> {
    const user = await clerkClient.users.getUser(userId);
    const { googleTokens } = user.privateMetadata as { googleTokens: GoogleTokens };
    // ... token refresh logic
}

## Authentication Flow

### Clerk OAuth Configuration
- Required scopes:
  - `https://www.googleapis.com/auth/calendar.readonly`
  - `https://www.googleapis.com/auth/calendar.events`
- Token storage in Clerk's private metadata
- Automatic token refresh mechanism

### Token Management
```typescript
interface GoogleTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

Database Schema Updates
Event Schema Extensions

events: defineTable({
    // Existing fields remain unchanged
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    duration: v.string(),
    participantIds: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    
    // New fields for time slot management
    recommendedTimeSlots: v.optional(v.array(v.object({
        start: v.string(),
        end: v.string(),
        score: v.number(),
    }))),
    selectedTimeSlot: v.optional(v.object({
        start: v.string(),
        end: v.string(),
    })),
    timezone: v.string(),
})

API Implementation
1. Google Calendar Integration

// Convex action for checking availability
export const checkAvailability = action({
    args: {
        userId: v.string(),
        participantIds: v.array(v.string()),
        duration: v.string(),
        startDate: v.string(),
        endDate: v.string(),
    },
    handler: async (ctx, args) => {
        // Implementation details
    }
});

2. Time Slot Algorithm
Working hours: 9 AM - 5 PM
Look ahead: 2 weeks
Return top 3 recommended slots
Score based on:
Time of day (preference for business hours)
Proximity to current date
Duration match


Implementation Phases
Phase 1: Authentication Setup
Configure Google OAuth in Clerk
Add calendar scopes
Update sign-in component
Implement token storage
typescript
CopyInsert
const requiredScopes = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];
Phase 2: Backend Implementation
Create Convex actions for:
Availability checking
Time slot ranking
Event creation in Google Calendar
Implement FreeBusy API integration
Add error handling and retries
Phase 3: Frontend Updates
Modify event creation flow
Add time slot selection UI
Implement loading states
Add error handling
Phase 4: Testing & Optimization
Test all flows
Optimize performance
Handle edge cases
Error Handling Matrix
| Error Type | Cause | Solution | |------------|-------|----------| | Token Expired | Time-based | Auto refresh | | API Quota | Rate limit | Implement backoff | | No Slots | Schedule conflict | Show alternative dates | | Access Denied | Permission issue | Re-request access |

Frontend Components
1. Event Creation Flow
Initial event details (existing)
Participant selection (existing)
New time slot selection step
Final confirmation
2. Time Slot Selection UI
Card-based display of recommendations
Clear visual hierarchy
Loading states
Error handling
Timezone display




Implementation Checklist
Phase 1: Setup & Authentication
[ ] Configure Google OAuth scopes in Clerk
[ ] Implement token storage and refresh mechanism
[ ] Update database schema
[ ] Add timezone support
Phase 2: Backend Implementation
[ ] Implement FreeBusy API integration
[ ] Create time slot recommendation algorithm
[ ] Add Convex actions for availability checking
[ ] Implement error handling and retry logic
Phase 3: Frontend Updates
[ ] Create time slot selection component
[ ] Update event creation flow
[ ] Add loading states
[ ] Implement error handling UI
[ ] Add timezone selection/display
Phase 4: Testing & Optimization
[ ] Test with multiple participants
[ ] Verify token refresh flow
[ ] Test edge cases (no availability, API limits)
[ ] Optimize algorithm performance
Best Practices
Always verify Google Calendar access before checking availability
Implement proper error handling for API failures
Consider rate limiting and quota management
Cache results when appropriate
Handle timezone differences correctly
Error Handling
Token expiration/refresh errors
API quota exceeded
No available time slots
Participant calendar access denied
Network failures
Security Considerations
Store tokens securely in Clerk's private metadata
Validate all participant access permissions
Implement proper CORS policies
Follow least privilege principle for API scopes

## ⚠️ Important Implementation Notes

### Clerk Integration (ALREADY CONFIGURED ✅)
- Google OAuth authentication is already set up
- Calendar API scopes are already configured
- Redirect URIs are already set
- Token management is already handled by Clerk

### Implementation Scope
Only implement the calendar functionality using the existing Clerk setup:
1. Use existing Clerk token access:
   ```typescript
   const { getToken } = useAuth();
   const token = await getToken({ template: "google_calendar" });
   ```
2. Add calendar queries and mutations to Convex
3. Update the event creation UI

### Common Mistakes to Avoid
❌ DO NOT:
- Modify any Clerk configuration
- Create new OAuth flows
- Add new authentication logic
- Change existing auth setup

## 📁 Required Implementation Files

### Only Two Files Need Changes:
1. **convex/calendar.ts** - Add calendar queries and mutations
```typescript
// Add these functions to existing calendar.ts
export const getAvailableTimeSlots = query({
  args: {
    participantIds: v.array(v.string()),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Implementation using existing Clerk token
  }
});

export const scheduleEvent = mutation({
  args: {
    eventDetails: v.object({
      title: v.string(),
      description: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      participantIds: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Implementation using existing Clerk token
  }
});
```

2. **app/(pages)/dashboard/events/create/page.tsx** - Update existing event creation
```typescript
// Add to existing imports
import { getAvailableTimeSlots, scheduleEvent } from '@/convex/calendar';

// Add to existing event creation form
const timeSlots = useQuery(getAvailableTimeSlots, {
  participantIds,
  startDate,
  endDate,
});
```

### ❌ DO NOT CREATE OR MODIFY:
- Any Clerk configuration
- Any auth pages
- Any OAuth handlers
- Any middleware
- Any token management
- Any Google Calendar service files

### Why This Approach?
- Uses existing Clerk setup (already configured)
- Maintains current project structure
- Follows established patterns
- Minimizes changes needed
- Leverages existing authentication