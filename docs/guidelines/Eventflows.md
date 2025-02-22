# Event Management System Documentation

## Table of Contents
1. [Data Model](#data-model)
2. [Event Status Flows](#event-status-flows)
3. [Implementation Details](#implementation-details)
4. [Common Pitfalls & Best Practices](#common-pitfalls--best-practices)
5. [Development Guidelines](#development-guidelines)

## Data Model

### Tables

1. **events**
   - `_id`: Id<"events">
   - `userId`: string (creator's ID)
   - `title`: string
   - `description`: string
   - `location`: string
   - `duration`: string
   - `status`: "pending" | "completed"
   - `createdAt`: string (ISO date)
   - `updatedAt`: string (ISO date)

2. **eventParticipants**
   - `_id`: Id<"eventParticipants">
   - `eventId`: Id<"events">
   - `participantId`: Id<"contacts">
   - `status`: "pending" | "accepted" | "declined"
   - `updatedAt`: string (ISO date)

### Relationships
- Event creator (userId) -> users table
- Event participants (participantId) -> contacts table
- Event participation (eventId) -> events table

## Event Status Flows

### Participant Flow
1. **Pending Status**
   - Initial state when invited to an event
   - Available actions:
     - Accept -> Changes status to "accepted"
     - Decline -> Changes status to "declined"

2. **Accepted Status**
   - After accepting an invitation
   - Available actions:
     - Decline -> Changes status to "declined"

3. **Declined Status**
   - After declining an invitation
   - Available actions:
     - Remove -> Removes participant entry only (preserves event)

### Creator Flow
1. **Event Management**
   - Can view all participant statuses
   - Can delete entire event
   - Event deletion cascades to all participant entries

## Implementation Details

### Key Components

1. **Mutations**
   ```typescript
   // Update participant status
   updateParticipantStatus({
     eventId: Id<"events">,
     participantId: Id<"contacts">,
     status: "accepted" | "declined"
   })

   // Remove participant
   removeParticipant({
     eventId: Id<"events">,
     participantId: Id<"contacts">
   })

   // Delete event (creator only)
   deleteEvent({
     id: Id<"events">
   })
   ```

2. **Queries**
   ```typescript
   // Get invited events
   getInvitedEvents({
     userId: string
   })
   ```

### Important Implementation Notes
1. Event deletion cascades to participant entries
2. Participant removal only affects the participant entry
3. Status updates are tracked with timestamps
4. Each action maintains data integrity

## Common Pitfalls & Best Practices

### 🚨 Critical Warnings

1. **Data Deletion**
   - NEVER use deleteEvent for participant removal
   - ALWAYS use removeParticipant for participant-initiated removals
   - ONLY use deleteEvent for creator-initiated full event deletion

2. **Status Management**
   - ALWAYS include both eventId and participantId for status updates
   - VERIFY participant exists before status updates
   - MAINTAIN proper status flow (pending -> accepted/declined)

3. **UI Implementation**
   - SHOW correct action buttons based on current status
   - PRESERVE existing functionality when adding new features
   - SEPARATE creator and participant actions clearly

### Best Practices

1. **Code Organization**
   - Keep mutations separate by concern (status, removal, deletion)
   - Use proper type safety for IDs and statuses
   - Maintain clear separation between creator and participant flows

2. **Error Handling**
   - Validate permissions before actions
   - Handle missing participants gracefully
   - Provide clear error messages

3. **Testing**
   - Verify status transitions
   - Test cascade deletions
   - Validate participant removal isolation

## Development Guidelines

### Adding New Features

1. **Planning**
   - Map out status flow changes
   - Consider impact on existing flows
   - Document new mutations/queries

2. **Implementation**
   - Follow existing patterns
   - Maintain type safety
   - Add comprehensive error handling

3. **Verification**
   - Test all status transitions
   - Verify data integrity
   - Check permission enforcement

### Code Change Protocol

1. **Before Making Changes**
   - Review existing functionality
   - Map out dependencies
   - Plan for backward compatibility

2. **During Implementation**
   - Keep existing functions intact
   - Add new functionality separately
   - Maintain clear separation of concerns

3. **Before Committing**
   - Review entire diff output
   - Check for unintended deletions
   - Verify all flows still work

### Common Mistakes to Avoid

1. **❌ DON'T**: Replace existing functions when adding new ones
   ```typescript
   // Wrong: Removing deleteEvent when adding removeParticipant
   const removeParticipant = useMutation(api.events.mutations.removeParticipant);
   // Missing deleteEvent!
   ```

2. **✅ DO**: Keep both functions when needed
   ```typescript
   // Correct: Maintain both functions
   const removeParticipant = useMutation(api.events.mutations.removeParticipant);
   const deleteEvent = useMutation(api.events.mutations.deleteEvent);
   ```

3. **❌ DON'T**: Mix participant and event deletion
   ```typescript
   // Wrong: Using deleteEvent for participant removal
   await deleteEvent({ id: event._id }); // This deletes the entire event!
   ```

4. **✅ DO**: Use appropriate mutation for each action
   ```typescript
   // Correct: Use removeParticipant for participant removal
   await removeParticipant({
     eventId: event._id,
     participantId: event.participantId
   });
   ```

Remember: Always verify the scope and impact of your changes before implementing them.