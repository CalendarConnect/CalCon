"use client";

import { ReactNode } from "react";
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
import { Share, Trash2, X, MapPin, Clock, AlertCircle } from "lucide-react";
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

// Define types using Convex generated types
type Event = Doc<"events">;
type Contact = Doc<"contacts">;

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
  
  const events = useQuery<Event[]>(
    api.events.queries.getEvents,
    shouldQuery ? { userId: user.id } : "skip"
  );

  const invitedEvents = useQuery<Event[]>(
    api.events.queries.getInvitedEvents,
    shouldQuery ? { userId: user.id } : "skip"
  );

  const contacts = useQuery<Contact[]>(
    api.contacts.queries.getContacts,
    shouldQuery ? { userId: user.id } : "skip"
  );

  const incomingInvitations = useQuery<Contact[]>(
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

  const renderEventCard = (event: Event, isInvited = false): ReactNode => {
    console.log("Rendering event card:", { event, isInvited });
    
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
                      onClick={async () => {
                        try {
                          await deleteEvent({ id: event._id });
                          toast.success("Event deleted successfully");
                        } catch (error) {
                          toast.error("Failed to delete event");
                        }
                      }}
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
                      {event.participants?.map((participant) => (
                        <div key={participant._id} className="flex items-center justify-between">
                          <span className="text-sm">
                            {participant.contact?.fullName || participant.contact?.email || "Unknown"}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${getStatusColor(participant.status)}`}
                          >
                            {participant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
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
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isInvited && event.participantStatus === "pending" && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  try {
                    await updateParticipantStatus({
                      eventId: event._id,
                      participantId: event.participantId,
                      status: "accepted"
                    });
                    toast.success("Event accepted");
                  } catch (error) {
                    console.error("Failed to accept event:", error);
                    toast.error("Failed to accept event");
                  }
                }}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await updateParticipantStatus({
                      eventId: event._id,
                      participantId: event.participantId,
                      status: "declined"
                    });
                    toast.success("Event declined");
                  } catch (error) {
                    console.error("Failed to decline event:", error);
                    toast.error("Failed to decline event");
                  }
                }}
              >
                Decline
              </Button>
            </>
          )}
          {isInvited && event.participantStatus === "accepted" && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await updateParticipantStatus({
                    eventId: event._id,
                    participantId: event.participantId,
                    status: "declined"
                  });
                  toast.success("Event declined");
                } catch (error) {
                  console.error("Failed to decline event:", error);
                  toast.error("Failed to decline event");
                }
              }}
            >
              Decline
            </Button>
          )}
          {isInvited && event.participantStatus === "declined" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  await removeParticipant({
                    eventId: event._id,
                    participantId: event.participantId,
                  });
                  toast.success("Event removed from your list");
                } catch (error) {
                  toast.error("Failed to remove event");
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
          {!isInvited && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare(event._id)}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
      </div>

      <div className="space-y-36">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Events</h2>
          {(events?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {events.map((event) => renderEventCard(event, false))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No events created yet.
            </div>
          )}
        </div>

        <div className="mt-24">
          <h2 className="text-xl font-semibold mb-4">Invited Events</h2>
          {(invitedEvents?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {invitedEvents.map((event) => renderEventCard(event, true))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No event invitations yet.
            </div>
          )}
        </div>
      </div>

      {(events?.length ?? 0) === 0 && (invitedEvents?.length ?? 0) === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No events found. Create an event to get started!
        </div>
      )}
    </div>
  );
}
