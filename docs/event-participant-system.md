# Event and Participant System Documentation

## Core Purpose and Flow

The primary feature of CalendarConnect is to help groups of users find mutually available time slots for meetings. Here's how it works:

1. Event Creation and Invitation
   - A user creates an event and invites participants
   - Participants must be connected contacts in the system

2. Participant Acceptance Mechanism
   - When a participant accepts an event invitation, they implicitly:
     a) Confirm their participation in the event
     b) Grant permission for the event creator to check their calendar's free/busy status
   
3. Availability Analysis
   - Using the granted permissions, the system can analyze everyone's calendar
   - The goal is to find time slots when all participants are free
   - This is achieved through Google Calendar's freebusy API

This acceptance-based permission model is fundamental to the app's core functionality of finding suitable meeting times for all participants.

## Overview

This document details the implementation of the event and participant management system in CalendarConnect. The system uses Convex for data storage and follows strict TypeScript typing patterns.

## Future Improvements

1. Token Refresh Enhancement = IMPORTANT!!!
- Implement background token refresh
- Add token expiration tracking
- Create refresh token rotation system

2. Availability Check Enhancement
- Add detailed calendar availability checking
- Implement time zone handling
- Add conflict resolution for overlapping events

3. Error Recovery
- Add automatic retry for failed token checks
- Implement token refresh on invalid token detection
- Add user notification system for token issues

### Learnings from Implementation

1. Token Refresh Possibilities
- We discovered that token refresh IS possible through Clerk's OAuth implementation
- Clerk maintains the OAuth connection and handles token refresh automatically
- We can detect invalid tokens through API responses

2. Best Practices
- Store token check results separately from availability data
- Use real-time subscriptions for status updates
- Implement proper error handling for each participant
- Keep UI feedback clear and immediate

3. Security Considerations
- Never expose tokens client-side
- Use server-side routes for token validation
- Implement proper error handling for expired tokens
- Track token status per participant

## Database Schema

### Events Table

```typescript
events: defineTable({
    userId: v.string(),        // Creator's user ID from Clerk
    title: v.string(),        // Event title
    description: v.string(),  // Event description
    location: v.string(),     // Event location
    duration: v.string(),     // Duration in minutes
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    createdAt: v.string(),   // Creation timestamp
    updatedAt: v.string(),   // Last update timestamp
})
.index("by_status", ["userId", "status"])
```

### Event Participants Table

```typescript
eventParticipants: defineTable({
    eventId: v.id("events"),           // Reference to the event
    participantId: v.id("contacts"),   // Reference to the contact
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    updatedAt: v.string()
})
.index("by_participant", ["participantId"])
.index("by_event", ["eventId"])
```

## Event Creation Flow

1. User Input Required:
   - Title (string)
   - Description (string)
   - Location (string)
   - Duration (enum: "15", "30", "45", "60", "120", "180" minutes)
   - Participant IDs (array of contact IDs)

2. Validation Steps:
   - All fields must be filled
   - At least one participant must be selected
   - All participants must be "connected" contacts
   - User must be authenticated via Clerk
   - Free tier users limited to 3 events

3. Creation Process:
   ```typescript
   // 1. Create event
   const eventId = await ctx.db.insert("events", {
     userId: args.userId,
     title: args.title,
     description: args.description,
     location: args.location,
     duration: args.duration,
     status: "pending",
     createdAt: timestamp,
     updatedAt: timestamp
   });

   // 2. Add participants
   await Promise.all(
     args.participantIds.map(participantId => 
       ctx.db.insert("eventParticipants", {
         eventId,
         participantId,
         status: "pending",
         updatedAt: timestamp
       })
     )
   );
   ```

## Participant Management

### Status Flow
1. Initial State: "pending"
2. User Actions:
   - Accept → "accepted"
   - Decline → "declined"
   - Remove → participant entry deleted

### Status Update Operation
```typescript
const updateParticipantStatus = mutation({
  args: {
    eventId: v.id("events"),
    participantId: v.id("contacts"),
    status: v.union(v.literal("accepted"), v.literal("declined"))
  },
  handler: async (ctx, args) => {
    // Update logic
  }
});
```

### Participant Removal
```typescript
const removeParticipant = mutation({
  args: {
    eventId: v.id("events"),
    participantId: v.id("contacts")
  },
  handler: async (ctx, args) => {
    // Removal logic
  }
});
```

## Google Calendar Integration

### Authentication Implementation

The system uses Clerk's Google OAuth integration to securely handle Google Calendar authentication. This implementation is split across several components:

#### 1. Required Scopes
```typescript
const REQUIRED_SCOPES: GoogleCalendarScope[] = [
  'https://www.googleapis.com/auth/calendar',      // Read/write access to Calendars
  'https://www.googleapis.com/auth/calendar.events' // Read/write access to Events
]
```

#### 2. Server Actions (`/app/actions/google-calendar.ts`)

```typescript
// Fetch OAuth token for the current user
export async function getGoogleCalendarToken() {
  const { userId } = await auth()
  if (!userId) throw new Error('User not authenticated')
  
  const client = await clerkClient()
  const tokenResponse = await client.users.getUserOauthAccessToken(
    userId,
    'oauth_google'
  )
  
  return {
    success: true,
    token: tokenResponse.data[0].token,
    provider: 'google',
    scopes: tokenResponse.data[0].scopes || [],
  }
}

// Validate required Google Calendar scopes
export async function checkGoogleCalendarScopes() {
  const tokenResponse = await getGoogleCalendarToken()
  const hasAllScopes = REQUIRED_SCOPES.every(scope => 
    tokenResponse.scopes.includes(scope)
  )
  
  return {
    success: true,
    hasRequiredScopes: hasAllScopes,
    scopes: tokenResponse.scopes,
    missingScopes: hasAllScopes ? [] : REQUIRED_SCOPES.filter(
      scope => !tokenResponse.scopes.includes(scope)
    ),
  }
}
```

#### 3. UI Component (`/app/(pages)/dashboard/_components/google-calendar-button.tsx`)

The GoogleCalendarButton component provides:
- Visual connection status
- Token management
- Scope verification
- Detailed scope information display

Key features:
- Automatic token fetching
- Scope validation
- Visual feedback for connection status
- Detailed scope information display
- Token information display

#### 4. Type Definitions (`/types/google.ts`)

```typescript
export type GoogleCalendarScope = 
  | 'https://www.googleapis.com/auth/calendar'
  | 'https://www.googleapis.com/auth/calendar.events'
  | 'https://www.googleapis.com/auth/calendar.readonly'
  | 'https://www.googleapis.com/auth/calendar.events.readonly'
  | 'https://www.googleapis.com/auth/calendar.settings.readonly'
  | 'https://www.googleapis.com/auth/calendar.addons.execute'
  | 'https://www.googleapis.com/auth/calendar.freebusy'

export interface GoogleCalendarTokenResponse {
  success: boolean
  token?: string
  provider?: string
  scopes?: string[]
  error?: string
}

export interface GoogleCalendarScopesResponse {
  success: boolean
  hasRequiredScopes: boolean
  scopes?: string[]
  missingScopes?: string[]
  error?: string
}
```

### Usage in Event System

To access the Google Calendar token for a user:

```typescript
// 1. Import the necessary function
import { getGoogleCalendarToken } from "@/app/actions/google-calendar"

// 2. Fetch the token
const response = await getGoogleCalendarToken()
if (!response.success) {
  throw new Error('Failed to get Google Calendar token')
}

// 3. Use the token
const token = response.token
// Now you can use this token for Google Calendar API calls
```

### Security Considerations

1. Token Storage
   - Tokens are managed by Clerk
   - Never stored in local storage or cookies
   - Automatically refreshed by Clerk

2. Scope Management
   - Only request minimum required scopes
   - Validate scopes before operations
   - Clear error handling for missing scopes

3. Error Handling
   - Proper error messages for users
   - Logging for debugging
   - Graceful fallbacks

### Implementation Notes

1. The token is fetched on-demand and not stored
2. Scopes are verified before any calendar operations
3. Users must be authenticated via Clerk
4. Token refresh is handled automatically by Clerk
5. All operations are performed server-side for security

## Token Status Implementation

### Overview
The token status system provides real-time validation of Google Calendar tokens for all event participants, including the active user. The implementation uses a hybrid approach:
- Active user status is managed through Clerk's OAuth system
- Participant tokens are validated through the backend token validation system

### Components

#### Frontend (`event-availability.tsx`)
```typescript
// Active User Display
const { user } = useUser();

// Display in Dialog
{user && (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium">
        {user.fullName || user.primaryEmailAddress?.emailAddress || "You"}
        {" (You)"}
      </p>
      <p className="text-sm text-muted-foreground">
        {user.primaryEmailAddress?.emailAddress}
      </p>
    </div>
    <Badge variant="default">Token Valid</Badge>
  </div>
)}

// Participant Display
{tokenCheck?.results?.map((result) => {
  const participant = tokenCheck.participants?.find(
    p => p.participantId === result.participantId
  );
  return (
    <div key={result.participantId} className="flex items-center justify-between">
      <div>
        <p className="font-medium">
          {participant?.contact?.fullName || participant?.contact?.email}
        </p>
        <p className="text-sm text-muted-foreground">
          {participant?.contact?.email}
        </p>
        {result.error && (
          <p className="text-sm text-red-500">{result.error}</p>
        )}
      </div>
      <Badge variant={result.success ? "default" : "destructive"}>
        {result.success ? "Token Valid" : "Token Invalid"}
      </Badge>
    </div>
  );
})}
```

#### Backend (`availability.ts`)
```typescript
// Token Check Record Structure
interface TokenCheck {
  eventId: Id<"events">;
  participantIds: Id<"contacts">[];
  status: "pending" | "completed";
  results: Array<{
    participantId: Id<"contacts">;
    success: boolean;
    error?: string;
  }>;
  checkedAt: string;
}

// Token Check Creation
const checkId = await ctx.db.insert("tokenChecks", {
  eventId: args.eventId,
  participantIds: participantsWithDetails.map(p => p.participantId),
  status: "pending",
  results: participantsWithDetails.map(p => ({
    participantId: p.participantId,
    success: false
  })),
  checkedAt: new Date().toISOString(),
});
```

### Key Features

1. **Active User Integration**
   - Uses Clerk's `useUser` hook for current user information
   - Always displays current user at the top of the token status list
   - Assumes valid token status for active user

2. **Participant Token Validation**
   - Real-time token validation for all participants
   - Clear status display with success/error states
   - Error message display for failed validations

3. **UI/UX Considerations**
   - Loading states during token checks
   - Clear visual distinction between active user and participants
   - Error handling with toast notifications
   - Responsive dialog design

4. **Type Safety**
   - Strong typing for all database operations
   - Type-safe participant and user handling
   - Proper error boundary implementation

### Usage Flow

1. User clicks "Check Availability" button
2. System creates token check record
3. Current user is displayed with valid status
4. Participant tokens are checked in parallel
5. Results are updated in real-time
6. Final status is displayed for all participants

### Error Handling

1. **Token Validation Errors**
   - Individual error messages per participant
   - Visual feedback through badge colors
   - Detailed error messages in UI

2. **System Errors**
   - Toast notifications for system-level errors
   - Graceful fallback states
   - Loading state management

### Best Practices

1. **Performance**
   - Parallel token validation
   - Efficient database queries
   - Optimized re-renders

2. **Security**
   - Server-side token validation
   - Proper scope checking
   - Secure token management

3. **Maintainability**
   - Clear separation of concerns
   - Type-safe implementations
   - Documented code structure

## Token Check System

We have implemented a robust token validation system with the following components:

1. Database Schema
```typescript
// Token check tracking
export const tokenChecks = defineTable({
  eventId: v.id("events"),
  participantIds: v.array(v.id("contacts")),
  status: v.union(v.literal("pending"), v.literal("completed")),
  results: v.array(
    v.object({
      participantId: v.id("contacts"),
      success: v.boolean(),
      error: v.optional(v.string()),
    })
  ),
  checkedAt: v.string(),
}).index("by_event", ["eventId"]);

// Event availability tracking
export const eventAvailability = defineTable({
  eventId: v.id("events"),
  timeRange: v.object({
    start: v.string(),
    end: v.string(),
  }),
  availableParticipants: v.array(v.id("contacts")),
  checkedAt: v.string(),
}).index("by_event", ["eventId"]);
```

2. Token Check Flow
- When checking availability:
  1. Create token check record for all participants
  2. Create availability record to track results
  3. Check each participant's token status
  4. Update availability record with valid participants

3. Real-time Updates
- UI component subscribes to token check results
- Updates participant status in real-time
- Shows clear error messages for invalid tokens

### Learnings from Implementation

1. Token Refresh Possibilities
- We discovered that token refresh IS possible through Clerk's OAuth implementation
- Clerk maintains the OAuth connection and handles token refresh automatically
- We can detect invalid tokens through API responses

2. Best Practices
- Store token check results separately from availability data
- Use real-time subscriptions for status updates
- Implement proper error handling for each participant
- Keep UI feedback clear and immediate

3. Security Considerations
- Never expose tokens client-side
- Use server-side routes for token validation
- Implement proper error handling for expired tokens
- Track token status per participant

4. Error Handling Patterns
```typescript
// Pattern for token retrieval errors
if (!googleAccount) {
  return {
    success: false,
    error: 'No Google account connected'
  }
}

// Pattern for scope validation
if (!hasRequiredScopes) {
  return {
    success: false,
    error: 'Missing required calendar permissions'
  }
}
```

### Technical Implementation Details

1. Token Check Mutations
```typescript
export const checkAvailability = mutation({
  args: {
    eventId: v.id("events"),
    timeRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
  },
  async handler(ctx, args) {
    // Implementation details...
  }
});
```

2. Token Status Updates
```typescript
export const updateTokenCheckResult = mutation({
  args: {
    checkId: v.id("tokenChecks"),
    participantId: v.id("contacts"),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  async handler(ctx, args) {
    // Implementation details...
  }
});
```

3. UI Component Integration
```typescript
function EventAvailability({ eventId }: { eventId: Id<"events"> }) {
  // Component implementation...
}
```

## Future Improvements

1. Token Refresh Enhancement
- Implement background token refresh
- Add token expiration tracking
- Create refresh token rotation system

2. Availability Check Enhancement
- Add detailed calendar availability checking
- Implement time zone handling
- Add conflict resolution for overlapping events

3. Error Recovery
- Add automatic retry for failed token checks
- Implement token refresh on invalid token detection
- Add user notification system for token issues

## Security Considerations

1. Token Storage
- Never store tokens in client-side storage
- Use secure server-side storage only
- Implement proper encryption for stored tokens

2. Access Control
- Validate user permissions before token checks
- Implement proper scope validation
- Track token usage and implement rate limiting

3. Error Handling
- Never expose sensitive information in error messages
- Implement proper logging for security events
- Add monitoring for suspicious token activity

## Type Safety

### Key Types
1. Event References:
   ```typescript
   Id<"events">
   ```

2. Contact References:
   ```typescript
   Id<"contacts">
   ```

3. Status Types:
   ```typescript
   type EventStatus = "pending" | "confirmed" | "cancelled"
   type ParticipantStatus = "pending" | "accepted" | "declined"
   ```

## Query Patterns

### Find Event Participants
```typescript
const participants = await ctx.db
  .query("eventParticipants")
  .withIndex("by_event", q => q.eq("eventId", eventId))
  .collect();
```

### Find User's Events
```typescript
const events = await ctx.db
  .query("events")
  .withIndex("by_status", q => 
    q.eq("userId", userId)
     .eq("status", status)
  )
  .collect();
```

## Error Handling

### Common Patterns
```typescript
try {
  // Operation logic
} catch (error) {
  console.error("Operation failed:", error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Operation failed"
  };
}
```

### Validation Checks
1. Subscription Status:
   ```typescript
   if ((!subscription || subscription.status !== "active") && usage.length >= 3) {
     throw new Error("Free tier limit reached: Maximum 3 events. Please upgrade to create more events.");
   }
   ```

2. Participant Connection:
   ```typescript
   if (!allConnected) {
     throw new Error("Can only invite connected contacts");
   }
   ```

## Best Practices

1. Always use proper ID types:
   ```typescript
   v.id("tableName")  // For schema
   Id<"tableName">    // For TypeScript
   ```

2. Include timestamps for all operations:
   ```typescript
   const now = new Date().toISOString();
   ```

3. Use indexes for efficient queries:
   ```typescript
   .index("by_status", ["userId", "status"])
   ```

4. Validate relationships before operations:
   ```typescript
   const existing = await ctx.db
     .query("eventParticipants")
     .filter(q => q.eq(q.field("eventId"), eventId))
     .first();
   ```

## Performance Considerations

1. Use parallel operations where possible:
   ```typescript
   await Promise.all(participantIds.map(/* ... */));
   ```

2. Leverage indexes for queries
3. Batch related operations
4. Use proper error handling for all async operations

## Common Issues and Solutions

1. Missing Participants
   - Always verify participant creation
   - Use transaction-like patterns

2. Status Conflicts
   - Include timestamps
   - Validate current status before updates

3. Relationship Integrity
   - Use proper ID types
   - Validate references before operations

## Token Check System

We have implemented a robust token validation system with the following components:

1. Database Schema
```typescript
// Token check tracking
export const tokenChecks = defineTable({
  eventId: v.id("events"),
  participantIds: v.array(v.id("contacts")),
  status: v.union(v.literal("pending"), v.literal("completed")),
  results: v.array(
    v.object({
      participantId: v.id("contacts"),
      success: v.boolean(),
      error: v.optional(v.string()),
    })
  ),
  checkedAt: v.string(),
}).index("by_event", ["eventId"]);

// Event availability tracking
export const eventAvailability = defineTable({
  eventId: v.id("events"),
  timeRange: v.object({
    start: v.string(),
    end: v.string(),
  }),
  availableParticipants: v.array(v.id("contacts")),
  checkedAt: v.string(),
}).index("by_event", ["eventId"]);
```

2. Token Check Flow
- When checking availability:
  1. Create token check record for all participants
  2. Create availability record to track results
  3. Check each participant's token status
  4. Update availability record with valid participants

3. Real-time Updates
- UI component subscribes to token check results
- Updates participant status in real-time
- Shows clear error messages for invalid tokens

4. Error Handling Patterns
```typescript
// Pattern for token retrieval errors
if (!googleAccount) {
  return {
    success: false,
    error: 'No Google account connected'
  }
}

// Pattern for scope validation
if (!hasRequiredScopes) {
  return {
    success: false,
    error: 'Missing required calendar permissions'
  }
}
```

### Technical Implementation Details

1. Token Check Mutations
```typescript
export const checkAvailability = mutation({
  args: {
    eventId: v.id("events"),
    timeRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
  },
  async handler(ctx, args) {
    // Implementation details...
  }
});
```

2. Token Status Updates
```typescript
export const updateTokenCheckResult = mutation({
  args: {
    checkId: v.id("tokenChecks"),
    participantId: v.id("contacts"),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  async handler(ctx, args) {
    // Implementation details...
  }
});
```

3. UI Component Integration
```typescript
function EventAvailability({ eventId }: { eventId: Id<"events"> }) {
  // Component implementation...
}
```

## Future Improvements

1. Token Refresh Enhancement
- Implement background token refresh
- Add token expiration tracking
- Create refresh token rotation system

2. Availability Check Enhancement
- Add detailed calendar availability checking
- Implement time zone handling
- Add conflict resolution for overlapping events

3. Error Recovery
- Add automatic retry for failed token checks
- Implement token refresh on invalid token detection
- Add user notification system for token issues

## Security Considerations

1. Token Storage
- Never store tokens in client-side storage
- Use secure server-side storage only
- Implement proper encryption for stored tokens

2. Access Control
- Validate user permissions before token checks
- Implement proper scope validation
- Track token usage and implement rate limiting

3. Error Handling
- Never expose sensitive information in error messages
- Implement proper logging for security events
- Add monitoring for suspicious token activity
