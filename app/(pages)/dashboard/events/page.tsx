"use client";

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
import { Share, Trash2 } from "lucide-react";
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

export default function EventsPage() {
  const { user } = useUser();
  const events = useQuery(api.events.queries.getEvents, {
    userId: user?.id || "",
  });

  const invitedEvents = useQuery(api.events.queries.getInvitedEvents, {
    userId: user?.id || "",
  });

  console.log("User ID:", user?.id);
  console.log("Invited Events:", invitedEvents);

  const deleteEvent = useMutation(api.events.mutations.deleteEvent);

  // Get all contacts to display participant information
  const contacts = useQuery(api.contacts.queries.getContacts, {
    userId: user?.id || "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleShare = async (eventId: Id<"events">) => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast.success("Event URL copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy event URL");
    }
  };

  if (!events || !contacts || !invitedEvents) {
    return <div>Loading...</div>;
  }

  const renderEventCard = (event: any) => (
    <Card key={event._id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </div>
          <Badge variant="secondary" className={getStatusColor(event.status)}>
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Location:</strong> {event.location}
          </p>
          <p className="text-sm">
            <strong>Duration:</strong> {event.duration} minutes
          </p>
          <p className="text-sm">
            <strong>Status:</strong> {event.status === "pending" 
              ? "Waiting for participants to be connected with you"
              : event.status}
          </p>
          {event.participantIds && event.participantIds.length > 0 && (
            <div>
              {event.userId !== user?.id && (
                <p className="text-sm mb-2">
                  <strong>Invited by:</strong>{" "}
                  {event.creator?.name || event.creator?.email || "Unknown"}
                </p>
              )}
              <p className="text-sm font-medium mb-1">Other Participants:</p>
              <div className="space-y-1">
                {event.participantIds
                  .filter((participantId: string) => {
                    const contact = contacts.find((c) => c._id === participantId);
                    return contact?.userId !== event.userId; // Filter out the event creator
                  })
                  .map((participantId: string) => {
                    const contact = contacts.find((c) => c._id === participantId);
                    return (
                      <div key={participantId} className="flex items-center">
                        <span className="text-sm">
                          {contact ? (contact.fullName || contact.email) : "Unknown"}
                        </span>
                        <Badge
                          variant="secondary"
                          className="ml-2"
                        >
                          {contact ? (contact.status === "connected" ? "connected" : "pending") : "pending"}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare(event._id)}
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        {event.userId === user?.id && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
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
      </CardFooter>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Events</h2>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {events.map((event) => renderEventCard(event))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No events created yet.
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Invited Events</h2>
          {invitedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {invitedEvents.map((event) => renderEventCard(event))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No event invitations yet.
            </div>
          )}
        </div>
      </div>

      {events.length === 0 && invitedEvents.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No events found. Create an event to get started!
        </div>
      )}
    </div>
  );
}
