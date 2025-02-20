# Contact Invitation System Documentation

## Overview
The Contact Invitation System is a feature that allows users to connect with other users through a two-way invitation process. This document outlines the system's architecture, components, and workflows.

## Database Schema
The system uses the Convex database with the following schema for contacts:

```typescript
contacts: defineTable({
    userId: v.string(),               // ID of the user who owns this contact
    contactUserId: v.optional(v.string()), // ID of the connected user (if accepted)
    fullName: v.string(),            // Contact's full name
    companyName: v.string(),         // Contact's company
    role: v.string(),                // Contact's role
    email: v.string(),               // Contact's email
    status: v.union(v.literal("connected"), v.literal("pending"), v.literal("declined")),
    createdAt: v.string(),           // Creation timestamp
    updatedAt: v.string(),           // Last update timestamp
    senderName: v.optional(v.string()),    // Name of the user who sent the invitation
    senderEmail: v.optional(v.string()),   // Email of the user who sent the invitation
})
```

### Database Indexes
- `by_userId`: Filters contacts by user ID
- `by_email`: Filters contacts by email address
- `by_status`: Compound index for filtering by user ID and status

## Components

### 1. Contact Creation
Located in `convex/contacts/mutations.ts`:
- `createContact`: Creates a new contact invitation
- Validates email uniqueness
- Enforces free-tier limit (max 3 contacts)
- Stores sender information for recipient's reference

### 2. Contact Management
Located in `convex/contacts/mutations.ts`:
- `acceptInvitation`: Accepts a pending invitation
  - Updates original invitation status to "connected"
  - Creates reciprocal contact for accepting user
- `declineInvitation`: Declines a pending invitation
- `updateContact`: Updates contact information
- `deleteContact`: Removes a contact

### 3. Contact Queries
Located in `convex/contacts.ts`:
- `getContacts`: Retrieves all contacts for a user
- `getContactByEmail`: Finds a contact by email
- `getIncomingInvitationsV2`: Fetches pending invitations

## User Interface

### Contact List Page
Located in `app/(pages)/dashboard/contacts/page.tsx`:
- Displays all contacts and their status
- Shows incoming invitations section
- Provides actions for managing contacts

### Components
1. `AddContactDialog`:
   - Form for creating new contact invitations
   - Validates input fields
   - Handles submission and error states

2. `EditContactDialog`:
   - Updates existing contact information
   - Maintains data integrity

3. `DeleteContactDialog`:
   - Confirms contact deletion
   - Handles removal process

## Workflows

### 1. Sending an Invitation
1. User clicks "Add Contact" button
2. Fills in contact details
3. System:
   - Validates input
   - Checks free-tier limits
   - Creates pending invitation
   - Stores sender information

### 2. Receiving an Invitation
1. Recipient sees invitation in "Incoming Invitations" section
2. Shows sender's:
   - Name
   - Company
   - Role
   - Email
3. Provides Accept/Decline actions

### 3. Accepting an Invitation
1. Recipient clicks "Accept"
2. System:
   - Updates original invitation to "connected"
   - Creates reciprocal contact
   - Both users now see each other in their contacts list

### 4. Declining an Invitation
1. Recipient clicks "Decline"
2. System updates invitation status to "declined"
3. Invitation removed from active view

## Status Indicators
- `pending`: Yellow badge - Awaiting response
- `connected`: Green badge - Active connection
- `declined`: Red badge - Rejected invitation

## Free Tier Limitations
- Maximum 3 contacts allowed
- Upgrade prompt shown when limit reached
- Pro users have unlimited contacts

## Error Handling
- Duplicate email prevention
- Missing user information checks
- Network error handling
- User-friendly error messages

## Best Practices
1. Always validate email uniqueness
2. Maintain sender information for transparency
3. Handle all invitation states appropriately
4. Provide clear user feedback
5. Respect subscription limits

## Future Improvements
1. Contact search functionality
2. Bulk invitation features
3. Contact categorization
4. Enhanced notification system
5. Contact import/export capabilities
