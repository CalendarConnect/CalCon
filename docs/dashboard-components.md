# CalCon Component Documentation

## Table of Contents
1. [Event Card](#event-card)
2. [Time Slot Dialog](#time-slot-dialog)
3. [Delete Dialog](#delete-dialog)
4. [Create Event Dialog](#create-event-dialog)
5. [Navigation Components](#navigation-components)

## Event Card

### Purpose
The EventCard component is the primary display unit for events in the dashboard. It shows event details, participant information, and provides interaction options.

### Props
```typescript
interface EventCardProps {
  event: Event;
  isInvited: boolean;
  onShare: (eventId: Id<"events">) => Promise<void>;
  onDelete: (eventId: Id<"events">) => Promise<void>;
  onAccept: (event: Event) => Promise<void>;
  onDecline: (event: Event) => Promise<void>;
  onRemove: (event: Event) => Promise<void>;
  onFindAvailability: (event: Event) => Promise<Array<{ start: string; end: string }>>;
  onUpdateDateTime: (eventId: Id<"events">, selectedTime: string) => Promise<void>;
  contacts: Contact[];
  getStatusColor: (status: string) => string;
}
```

### Structure
1. **Header Section**
   - Title
   - Duration pill
   - Location pill
   - Delete button (for non-invited events)

2. **Content Section**
   - Description
   - Participant avatars (up to 3)
   - Participant count (+X more)
   - Status badges
   - Selected date/time (if set)
   - Find Available Timeslot button

3. **Footer Section**
   - Action buttons (Accept/Decline/Share)

### States
- Normal
- Hover
- Loading (during availability check)
- With/without selected datetime
- With different participant statuses

## Time Slot Dialog

### Purpose
Displays available time slots for event scheduling after checking participant availability.

### Props
```typescript
interface TimeSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableSlots: TimeSlot[];
  isSearching: boolean;
  onSelectTimeSlot: (selectedTime: string) => Promise<void>;
}
```

### Features
- Shows loading state during search
- Displays formatted date and time
- Allows time slot selection
- Handles empty state
- Responsive design

## Delete Dialog

### Purpose
Confirmation dialog for event deletion with safety check.

### Structure
1. **Header**
   - Title: "Delete Event"
   - Description explaining the action

2. **Footer**
   - Delete button (destructive action)
   - Cancel button

### States
- Open/Closed
- Loading during deletion
- Error state

## Create Event Dialog

### Purpose
Dialog for creating new events with all necessary details.

### Fields
1. **Title**
   - Required
   - Text input
   - Validation

2. **Description**
   - Required
   - Textarea
   - Validation

3. **Location**
   - Required
   - Text input
   - Validation

4. **Duration**
   - Required
   - Select dropdown
   - Predefined options

5. **Participants**
   - Optional
   - Multiple selection
   - Contact integration

### States
- Initial
- Validation errors
- Loading
- Success
- Error

## Navigation Components

### Sidebar Navigation

#### Structure
```css
.sidebar {
  width: 240px;
  height: 100vh;
  background: white;
  border-right: 1px solid #E5E7EB;
}
```

#### Navigation Items
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #4B5563;
  font-size: 0.875rem;
}

.nav-item-active {
  background-color: #F3F4F6;
  color: #2563EB;
}
```

### Page Header

#### Structure
```css
.page-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #111827;
}

.page-description {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.25rem;
}
```

## Component Interactions

### Event Card → Time Slot Dialog
1. User clicks "Find Available Timeslot"
2. Loading state shown in button
3. Availability check performed
4. Time Slot Dialog opens with results

### Event Card → Delete Dialog
1. User clicks delete button
2. Delete Dialog opens
3. User confirms deletion
4. Card removed on success

### Create Event → Event Card
1. User creates new event
2. Event Card added to grid
3. Smooth animation for insertion

## Best Practices

### Performance
- Lazy loading of dialogs
- Optimized re-renders
- Efficient state management

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### Error Handling
- Clear error messages
- Fallback states
- Recovery options
- User feedback

### Responsive Behavior
- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly targets
- Flexible sizing 