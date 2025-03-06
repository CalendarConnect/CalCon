"use client";

import { ReactNode, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share, Trash2, X, MapPin, Clock, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { findCommonAvailability } from "@/server/googleCalendar";

// Define types using Convex generated types
type Event = {
  _id: Id<"events">;
  _creationTime: number;
  createdAt: string;
  userId: string;
  description: string;
  status: "pending" | "confirmed" | "cancelled";
  updatedAt: string;
  title: string;
  location: string;
  duration: string;
  participants?: {
    _id: Id<"eventParticipants">;
    eventId: Id<"events">;
    participantId: Id<"contacts">;
    status: "pending" | "accepted" | "declined";
    updatedAt: string;
    contact?: {
      _id: Id<"contacts">;
      _creationTime: number;
      contactUserId?: string;
      senderName?: string;
      senderEmail?: string;
      createdAt: string;
      email: string;
      fullName?: string;
      updatedAt: string;
    } | null;
  }[];
  creator?: {
    _id: Id<"users">;
    _creationTime: number;
    name?: string;
    image?: string;
    subscription?: string;
    credits?: string;
    createdAt: string;
    email: string;
    userId: string;
    tokenIdentifier: string;
  } | null;
  participantStatus?: "pending" | "accepted" | "declined";
  participantId?: Id<"contacts">;
  selectedDateTime?: string;
};
type Contact = Doc<"contacts">;

// Create a separate EventCard component
const EventCard = ({ 
  event, 
  isInvited, 
  onShare, 
  onDelete, 
  onAccept, 
  onDecline, 
  onRemove,
  onFindAvailability,
  onUpdateDateTime,
  contacts,
  getStatusColor 
}: { 
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
}) => {
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);

  const hasAccepted = event.participants?.every(
    p => p.status === "accepted"
  ) ?? false;

  const handleFindClick = async () => {
    const slots = await onFindAvailability(event);
    if (slots) {
      setAvailableSlots(slots);
      setIsTimeSlotDialogOpen(true);
    }
  };

  const handleSelectTimeSlot = async (selectedTime: string) => {
    try {
      await onUpdateDateTime(event._id, selectedTime);
      toast.success("Meeting time has been set!");
      setIsTimeSlotDialogOpen(false);
    } catch (error) {
      console.error("Error updating event time:", error);
      toast.error("Failed to set meeting time");
    }
  };

  return (
    <Card key={event._id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </div>
          {!isInvited && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-500">
                  <X className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Event</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this event? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(event._id)}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
            <p className="text-sm">
              <strong>Location:</strong> {event.location}
            </p>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
            <p className="text-sm">
              <strong>Duration:</strong> {event.duration} minutes
            </p>
          </div>
          {isInvited ? (
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
              <p className="text-sm">
                <strong>Status:</strong> {event.participantStatus || "pending"}
              </p>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
              <p className="text-sm">
                <strong>Status:</strong> {event.status === "pending" 
                  ? "Waiting for participants to be connected with you"
                  : event.status}
              </p>
            </div>
          )}
          {event.selectedDateTime && (
            <div className="flex items-center mt-4 p-3 bg-green-50 rounded-lg">
              <Calendar className="h-4 w-4 mr-2 text-green-600" />
              <p className="text-sm text-green-700">
                <strong>Date and time everyone is available:</strong> {format(new Date(event.selectedDateTime), 'PPpp')}
              </p>
            </div>
          )}
          {event.participants && event.participants.length > 0 && (
            <div>
              {isInvited && (
                <p className="text-sm mb-2">
                  <strong>Created by:</strong>{" "}
                  {event.creator?.name || event.creator?.email || "Unknown"}
                </p>
              )}
              {!isInvited && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Participants:</p>
                  <div className="space-y-2 border rounded-lg p-3">
                    {event.participants.map((participant) => (
                      <div key={participant._id} className="flex items-center justify-between">
                        <span className="text-sm">
                          {participant.contact?.fullName || participant.contact?.email || "Unknown"}
                        </span>
                        <Badge
                          className={getStatusColor(participant.status)}
                        >
                          {participant.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {hasAccepted && !isInvited && (
                    <div className="mt-4">
                      <Button 
                        className="w-full"
                        variant="default"
                        onClick={handleFindClick}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Find Available Timeslot
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {isInvited && (
                <div>
                  <p className="text-sm font-medium mb-1">Participants:</p>
                  <div className="space-y-1">
                    {event.participants.map((participant) => {
                      console.log("Processing participant:", participant);
                      const contact = contacts.find((c) => c._id === participant.participantId);
                      if (!contact) {
                        console.log("Contact not found for participant:", participant.participantId);
                        return null;
                      }
                      
                      return (
                        <div key={participant.participantId} className="flex items-center justify-between">
                          <span className="text-sm">
                            {contact.fullName || contact.email || "Unknown"}
                            {contact.userId === event.userId && " (Creator)"}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${getStatusColor(participant.status)}`}
                          >
                            {participant.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Time Slot Selection Dialog */}
        <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a Time Slot</DialogTitle>
              <DialogDescription>
                Choose from the available time slots below:
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {availableSlots.map((slot, index) => (
                <div key={index} className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => handleSelectTimeSlot(slot.start)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {format(new Date(slot.start), 'PPpp')} - {format(new Date(slot.end), 'p')}
                    </span>
                  </Button>
                  {slot.participantAvailability && (
                    <div className="pl-6 space-y-1">
                      {Object.entries(slot.participantAvailability).map(([participantId, status]) => {
                        const participant = event.participants?.find(p => 
                          p.contact?.contactUserId && p.contact.contactUserId === participantId
                        );
                        const participantName = participant?.contact?.fullName || participant?.contact?.email || "Unknown";
                        return (
                          <div key={participantId} className="flex items-center text-sm">
                            <div className={`w-2 h-2 rounded-full mr-2 ${status.available ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span>{participantName}: {status.available ? 'Available' : 'Busy'}</span>
                            {!status.available && status.conflicts && status.conflicts.length > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Has meeting: {format(new Date(status.conflicts[0].start), 'p')} - {format(new Date(status.conflicts[0].end), 'p')})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsTimeSlotDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isInvited && event.participantStatus === "pending" && (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => onAccept(event)}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDecline(event)}
            >
              Decline
            </Button>
          </>
        )}
        {isInvited && event.participantStatus === "accepted" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDecline(event)}
          >
            Decline
          </Button>
        )}
        {isInvited && event.participantStatus === "declined" && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemove(event)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
        {!isInvited && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare(event._id)}
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function EventsPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    console.log("========= Auth State Changed =========");
    console.log("Auth State:", { 
      isLoaded, 
      isSignedIn, 
      userId: user?.id,
      userEmail: user?.emailAddresses?.[0]?.emailAddress 
    });
  }, [isLoaded, isSignedIn, user]);

  // Only query if we have a valid user
  const shouldQuery = isLoaded && isSignedIn && user?.id;
  
  const events = useQuery(
    api.events.queries.getEvents,
    shouldQuery ? { userId: user.id } : "skip"
  );

  const invitedEvents = useQuery(
    api.events.queries.getInvitedEvents,
    shouldQuery ? { userId: user.id } : "skip"
  );

  const contacts = useQuery(
    api.contacts.queries.getContacts,
    shouldQuery ? { userId: user.id } : "skip"
  );

  const incomingInvitations = useQuery(
    api.contacts.queries.getIncomingInvitationsV2,
    shouldQuery ? { userEmail: user?.emailAddresses[0]?.emailAddress || "" } : "skip"
  );

  useEffect(() => {
    console.log("========= Query States Changed =========");
    console.log("Query States:", {
      shouldQuery,
      events: events === "skip" ? "skipped" : events !== undefined,
      invitedEvents: invitedEvents === "skip" ? "skipped" : invitedEvents !== undefined,
      contacts: contacts === "skip" ? "skipped" : contacts !== undefined,
      incomingInvitations: incomingInvitations === "skip" ? "skipped" : incomingInvitations !== undefined
    });
  }, [shouldQuery, events, invitedEvents, contacts, incomingInvitations]);

  const removeParticipant = useMutation(api.events.mutations.removeParticipant);
  const deleteEvent = useMutation(api.events.mutations.deleteEvent);
  const updateParticipantStatus = useMutation(api.events.mutations.updateParticipantStatus);
  const updateEventDateTime = useMutation(api.events.mutations.updateEventDateTime);

  // Handle authentication loading state
  if (!isLoaded) {
    console.log("Auth still loading");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading authentication...</h2>
          <p className="text-gray-500">Please wait while we verify your session.</p>
        </div>
      </div>
    );
  }

  // Handle not signed in state
  if (!isSignedIn) {
    console.log("User not signed in");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Please sign in</h2>
          <p className="text-gray-500">You need to be signed in to view events.</p>
        </div>
      </div>
    );
  }

  // Handle data loading state
  if (!shouldQuery || !events || !contacts || !invitedEvents || !incomingInvitations) {
    console.log("Loading state - missing data:", { 
      shouldQuery,
      events: events === undefined,
      contacts: contacts === undefined,
      invitedEvents: invitedEvents === undefined,
      incomingInvitations: incomingInvitations === undefined
    });
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading your events...</h2>
          <p className="text-gray-500">Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-blue-600 hover:bg-blue-600 text-white";
      case "accepted":
        return "bg-blue-600 hover:bg-blue-600 text-white";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-500 text-white";
      case "cancelled":
        return "bg-red-500 hover:bg-red-500 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-500 text-white";
    }
  };

  const handleShare = async (eventId: Id<"events">): Promise<void> => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast.success("Event URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy event URL");
    }
  };

  const handleAcceptEvent = async (event: Event) => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await updateParticipantStatus({
        eventId: event._id,
        participantId: event.participantId!,
        status: "accepted",
        timezone: userTimezone,
      });
      toast.success("Event accepted");
    } catch (error) {
      console.error("Error accepting event:", error);
      toast.error("Failed to accept event");
    }
  };

  const handleDeclineEvent = async (event: Event) => {
    try {
      await updateParticipantStatus({
        eventId: event._id,
        participantId: event.participantId!,
        status: "declined",
      });
      toast.success("Event declined");
    } catch (error) {
      console.error("Error declining event:", error);
      toast.error("Failed to decline event");
    }
  };

  const handleRemoveEvent = async (event: Event) => {
    try {
      const userContact = contacts?.find(c => c.contactUserId === user?.id);
      if (!userContact) {
        toast.error("Contact not found");
        return;
      }
      await removeParticipant({
        eventId: event._id,
        participantId: userContact._id,
      });
      toast.success("Event removed from your list");
    } catch (error) {
      console.error("Error removing event:", error);
      toast.error("Failed to remove event");
    }
  };

  const handleFindAvailability = async (event: Event): Promise<Array<{ start: string; end: string }>> => {
    console.log("=== Starting availability check ===");
    console.log("Event:", event);

    if (!event.participants || event.participants.length === 0) {
      console.log("No participants found in event");
      toast.error("No participants found for this event");
      return [];
    }

    // Get participant IDs and map them to clerk user IDs
    const participants = event.participants
      .map(p => ({
        clerkUserId: p.contact?.contactUserId || ''
      }))
      .filter(p => p.clerkUserId); // Filter out any without clerk IDs

    console.log("Participants:", participants);

    if (participants.length === 0) {
      console.log("No participants with Clerk IDs found");
      toast.error("No valid participants found");
      return [];
    }

    // Create event details object with creator explicitly included
    const eventDetails = {
      eventId: event._id,
      creator: {
        clerkUserId: user?.id || '' // Make sure we have the creator's ID
      },
      participants: participants, // The creator will be added to this list in the backend
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      duration: event.duration
    };

    console.log("Event details for availability check:", eventDetails);
    console.log("Total participants (including creator):", participants.length + 1);

    try {
      console.log("Calling findCommonAvailability");
      const availableSlots = await findCommonAvailability(eventDetails);
      console.log("Available slots:", availableSlots);

      if (!availableSlots || availableSlots.length === 0) {
        console.log("No available slots found");
        toast.error("No available time slots found");
        return [];
      }

      const formattedSlots = availableSlots.map(slot => ({
        start: slot.start,
        end: slot.end
      }));
      
      console.log("Formatted available slots:", formattedSlots);
      return formattedSlots;
    } catch (error) {
      console.error("Error checking availability:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
      }
      toast.error("Failed to check availability");
      return [];
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isInvited={false}
                onShare={handleShare}
                onDelete={async (eventId) => {
                  try {
                    await deleteEvent({ id: eventId });
                    toast.success("Event deleted successfully");
                  } catch (error) {
                    toast.error("Failed to delete event");
                  }
                }}
                onAccept={handleAcceptEvent}
                onDecline={handleDeclineEvent}
                onRemove={handleRemoveEvent}
                onFindAvailability={handleFindAvailability}
                onUpdateDateTime={async (eventId, selectedTime) => {
                  await updateEventDateTime({
                    eventId,
                    selectedDateTime: selectedTime
                  });
                }}
                contacts={contacts}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No events found. Create an event to get started!
          </div>
        )}
      </div>

      <div className="mt-24">
        <h2 className="text-xl font-semibold mb-4">Invited Events</h2>
        {invitedEvents && invitedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {invitedEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isInvited={true}
                onShare={handleShare}
                onDelete={async (eventId) => {
                  try {
                    await deleteEvent({ id: eventId });
                    toast.success("Event deleted successfully");
                  } catch (error) {
                    toast.error("Failed to delete event");
                  }
                }}
                onAccept={handleAcceptEvent}
                onDecline={handleDeclineEvent}
                onRemove={handleRemoveEvent}
                onFindAvailability={handleFindAvailability}
                onUpdateDateTime={async (eventId, selectedTime) => {
                  await updateEventDateTime({
                    eventId,
                    selectedDateTime: selectedTime
                  });
                }}
                contacts={contacts}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No invited events found.
          </div>
        )}
      </div>
    </div>
  );
}
