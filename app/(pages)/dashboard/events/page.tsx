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
import { Share, Trash2, X, MapPin, Clock, AlertCircle, Calendar, Users, Video, Archive } from "lucide-react";
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
import { TimeSlotDialog } from "./_components/time-slot-dialog";
import { createCalendarEvent, deleteCalendarEvent } from "@/server/googleCalendar";
import { ConfirmMeetingDialog } from "./_components/confirm-meeting-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DeleteEventDialog } from "./_components/delete-event-dialog";
import { motion } from "framer-motion";

// Define types using Convex generated types
type Event = {
  _id: Id<"events">;
  _creationTime: number;
  createdAt: string;
  userId: string;
  description: string;
  status: "pending" | "confirmed" | "cancelled" | "archived";
  updatedAt: string;
  title: string;
  location: string;
  duration: string;
  timezone: string;
  calendarEventLink?: string;
  meetLink?: string;
  selectedDateTime?: string;
  participantStatus?: "pending" | "accepted" | "declined";
  participantId?: Id<"contacts">;
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
  googleCalendarEventId?: string;
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
  onArchive,
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
  onArchive: (event: Event) => Promise<void>;
  onFindAvailability: (event: Event) => Promise<Array<{ start: string; end: string }>>;
  onUpdateDateTime: (eventId: Id<"events">, selectedTime: string) => Promise<void>;
  contacts: Contact[];
  getStatusColor: (status: string) => string;
}) => {
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const updateEventWithCalendarLinks = useMutation(api.events.mutations.updateEventWithCalendarLinks);
  const { user } = useUser();

  const hasAccepted = event.participants?.every(
    p => p.status === "accepted"
  ) ?? false;

  const handleFindClick = async () => {
    setIsSearching(true);
    setIsTimeSlotDialogOpen(true);
    const slots = await onFindAvailability(event);
    if (slots) {
      setAvailableSlots(slots);
      setTimeout(() => {
        setIsSearching(false);
      }, 9500); // Increased to 9.5s to ensure animation completes
    } else {
      setIsSearching(false);
    }
  };

  const handleSelectTimeSlot = async (selectedTime: string) => {
    try {
      await onUpdateDateTime(event._id, selectedTime);
      toast.success("Schedule wisely and thrive 🖖");
      setIsTimeSlotDialogOpen(false);
    } catch (error) {
      console.error("Error updating event time:", error);
      toast.error("Failed to set meeting time");
    }
  };

  const handleConfirmEvent = async () => {
    if (!event.selectedDateTime || !user) return;

    setIsConfirming(true);
    try {
      // Create calendar event
      const result = await createCalendarEvent({
        eventId: event._id,
        title: event.title,
        description: event.description,
        location: event.location,
        selectedDateTime: event.selectedDateTime,
        duration: event.duration,
        creator: { clerkUserId: user.id },
        participants: event.participants?.map(p => ({
          clerkUserId: p.contact?.contactUserId || ''
        })) || [],
        timezone: event.timezone
      });

      if (!result.eventId || !result.eventLink) {
        throw new Error("Missing required calendar event data");
      }

      // Update event with calendar links
      await updateEventWithCalendarLinks({
        eventId: event._id,
        calendarEventLink: result.eventLink,
        meetLink: result.meetLink || undefined,
        googleCalendarEventId: result.eventId
      });

      toast.success("Event has been confirmed and added to calendars!");
    } catch (error) {
      console.error("Error confirming event:", error);
      toast.error("Failed to confirm event");
    } finally {
      setIsConfirming(false);
    }
  };

  // Get the status badge color based on event status
  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case "accepted":
        return "bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-600 border border-emerald-200/50";
      case "declined":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-rose-600 border border-rose-200/50";
      case "pending":
        return "bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 border border-orange-200/50";
      case "confirmed":
        return "bg-gradient-to-r from-blue-50 to-sky-50 text-sky-600 border border-sky-200/50";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200/50";
    }
  };

  // Format datetime to display
  const formatDateTime = (dateTime: string) => {
    try {
      const startDate = new Date(dateTime);
      const endDate = new Date(startDate.getTime() + parseInt(event.duration) * 60 * 1000);
      
      const dateStr = format(startDate, 'MMMM d, yyyy');
      const timeStr = `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
      
      return { dateStr, timeStr };
    } catch (e) {
      return { dateStr: "Invalid date", timeStr: "Invalid time" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full"
    >
      <div
        className={`relative h-auto w-full overflow-hidden bg-white rounded-2xl
          border border-gray-100 shadow-[0_5px_25px_-12px_rgba(0,0,0,0.08)] 
          transition-all duration-300 ease-out ${isHovered ? 'shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)]' : ''}`}
      >
        {/* Status indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          event.status === "confirmed" ? "bg-gradient-to-r from-sky-500 to-blue-500" :
          event.status === "pending" ? "bg-gradient-to-r from-orange-500 to-orange-600" :
          event.status === "cancelled" ? "bg-gradient-to-r from-rose-500 to-red-500" :
          "bg-gradient-to-r from-gray-300 to-gray-400"
        }`} />

        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5">
                {/* Status badge */}
                <div className={`px-2 py-0.5 text-[10px] font-medium uppercase rounded-full ${getStatusBadgeStyle(event.status)}`}>
                  {event.status}
                </div>
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
              </div>
              <p className="text-xs text-gray-500 min-h-[32px] line-clamp-2">{event.description}</p>
            </div>
            
            {!isInvited && (
              <DeleteEventDialog
                eventId={event._id}
                isConfirmed={event.status === "confirmed"}
                hasCalendarEventId={!!event.calendarEventLink}
                googleCalendarEventId={event.googleCalendarEventId}
                acceptedParticipants={event.participants?.filter(p => p.status === "accepted")}
                creatorClerkUserId={user?.id || ""}
                onDelete={onDelete}
              />
            )}
          </div>

          <div className="space-y-4 mt-4">
            {/* Participants Section */}
            {event.participants && event.participants.length > 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <div className="flex -space-x-2">
                  {event.participants.slice(0, 4).map((participant, index) => (
                    <motion.div
                      key={participant._id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      <Avatar
                        className="w-7 h-7 border-2 border-white shadow-sm"
                        style={{ zIndex: 5 - index }}
                      >
                        {participant.status === 'accepted' && participant.contact?.contactUserId && (
                          <AvatarImage
                            src={`https://img.clerk.com/v1/user/${participant.contact.contactUserId}/profile-image?width=48&height=48&quality=85&timestamp=${Date.now()}`}
                            alt={participant.contact?.fullName || participant.contact?.email || "Participant"}
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 text-xs font-semibold">
                          {(participant.contact?.fullName || participant.contact?.email || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  ))}
                  {event.participants.length > 4 && (
                    <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 text-xs font-semibold">
                        +{event.participants.length - 4}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {['accepted', 'declined', 'pending'].map(status => {
                    const count = event.participants.filter(p => p.status === status).length;
                    if (count === 0) return null;
                    
                    return (
                      <div 
                        key={status}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeStyle(status)}`}
                      >
                        <span>{count}</span>
                        <span>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meeting Info Cards */}
            <div className="flex items-stretch gap-2">
              <div className="flex-1 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 flex items-center gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Duration</p>
                  <p className="text-sm text-gray-800 font-medium">{event.duration} min</p>
                </div>
              </div>
              <div className="flex-1 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 flex items-center gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-medium">Platform</p>
                  <p className="text-sm text-gray-800 font-medium">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Selected DateTime */}
            {event.selectedDateTime && (
              <div className="p-3 bg-gradient-to-br from-blue-50/30 to-sky-50/30 rounded-xl border border-blue-100/50 flex items-center gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-100/70 flex items-center justify-center text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 uppercase font-medium">Scheduled</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-1.5">
                    <p className="text-sm text-gray-800 font-medium">
                      {formatDateTime(event.selectedDateTime).dateStr}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDateTime(event.selectedDateTime).timeStr}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Find Available Timeslot Button */}
              {hasAccepted && !isInvited && !event.calendarEventLink && event.status !== "confirmed" && (
                <Button 
                  className="w-full h-10 px-4 text-sm font-medium bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl 
                    transition-all duration-200 flex items-center justify-center gap-1.5
                    hover:border-gray-300 hover:shadow-sm"
                  variant="default"
                  onClick={handleFindClick}
                >
                  <Calendar className="w-4 h-4" />
                  {isSearching ? "Searching Availability..." : event.selectedDateTime ? "Change Timeslot" : "Find Available Timeslot"}
                </Button>
              )}

              {event.selectedDateTime && !event.calendarEventLink && !isInvited && hasAccepted && (
                <ConfirmMeetingDialog
                  isConfirming={isConfirming}
                  onConfirm={handleConfirmEvent}
                />
              )}

              {event.calendarEventLink && (
                <div className="space-y-2">
                  <a 
                    href={event.calendarEventLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full h-10 px-4 text-sm font-medium bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl 
                      transition-all duration-200 flex items-center justify-center gap-2
                      hover:border-gray-300 hover:shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-orange-500" />
                    View in Calendar
                  </a>
                  {event.meetLink && (
                    <a 
                      href={event.meetLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full h-10 px-4 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl 
                        transition-all duration-200 flex items-center justify-center gap-2
                        shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Invitation Responses */}
          {isInvited && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
              {event.participantStatus === "pending" && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9 px-3 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all"
                    onClick={() => onAccept(event)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-sm font-medium text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
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
                  className="h-9 px-3 text-sm font-medium text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => onDecline(event)}
                >
                  Decline
                </Button>
              )}
              {isInvited && event.participantStatus === "declined" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-sm font-medium text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-1.5"
                  onClick={() => onRemove(event)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              )}
            </div>
          )}

          {/* Other Action Buttons */}
          {!isInvited && !event.calendarEventLink && event.status !== "confirmed" && !hasAccepted && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-sm font-medium text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-1.5"
                onClick={() => onShare(event._id)}
              >
                <Share className="w-3.5 h-3.5" />
                Share
              </Button>
            </div>
          )}
          {!isInvited && event.status === "confirmed" && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-sm font-medium text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-1.5"
                onClick={() => onArchive(event)}
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Time Slot Dialog */}
      <TimeSlotDialog
        isOpen={isTimeSlotDialogOpen}
        onOpenChange={setIsTimeSlotDialogOpen}
        availableSlots={availableSlots}
        isSearching={isSearching}
        onSelectTimeSlot={handleSelectTimeSlot}
      />
    </motion.div>
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
    console.log("Query States:", {
      shouldQuery,
      events: events === undefined ? "undefined" : Array.isArray(events) ? "array" : "skip",
      invitedEvents: invitedEvents === undefined ? "undefined" : Array.isArray(invitedEvents) ? "array" : "skip",
      contacts: contacts === undefined ? "undefined" : Array.isArray(contacts) ? "array" : "skip",
      incomingInvitations: incomingInvitations === undefined ? "undefined" : Array.isArray(incomingInvitations) ? "array" : "skip"
    });
  }, [shouldQuery, events, invitedEvents, contacts, incomingInvitations]);

  const removeParticipant = useMutation(api.events.mutations.removeParticipant);
  const deleteEvent = useMutation(api.events.mutations.deleteEvent);
  const updateParticipantStatus = useMutation(api.events.mutations.updateParticipantStatus);
  const updateEventDateTime = useMutation(api.events.mutations.updateEventDateTime);
  const updateEvent = useMutation(api.events.mutations.updateEvent);
  const updateEventStatus = useMutation(api.events.mutations.updateEventStatus);

  // Filter out archived events from the main view
  const activeEvents = events?.filter(event => event.status !== "archived") || [];
  const activeInvitedEvents = invitedEvents?.filter(event => event.status !== "archived") || [];

  // Handle authentication loading state
  if (!isLoaded) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <h1 className="text-xl font-medium tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Handle not signed in state
  if (!isSignedIn) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <h1 className="text-xl font-medium tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Please sign in to view meetings.</p>
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <h1 className="text-xl font-medium tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading your meetings...</p>
        </div>
      </div>
    );
  }

  if (!events) {
    return <div>Loading...</div>;
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

  const handleArchiveEvent = async (event: Event) => {
    try {
      await updateEventStatus({
        id: event._id,
        status: "archived"
      });
      toast.success("Event archived successfully");
    } catch (error) {
      console.error("Error archiving event:", error);
      toast.error("Failed to archive event");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Meetings</h1>
          <p className="text-base text-gray-500">
            Manage your meetings and invitations.
          </p>
        </div>

        <Card className="rounded-2xl border-0 bg-white shadow-md overflow-hidden mb-8">
          <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2 px-8 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900">Your Meetings</CardTitle>
          </CardHeader>
          <CardContent className="px-8 py-6">
            {activeEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isInvited={false}
                    onShare={handleShare}
                    onDelete={async (eventId) => {
                      try {
                        // Get the event to check if it's confirmed
                        const eventToDelete = events.find(e => e._id === eventId);
                        if (!eventToDelete) {
                          throw new Error("Event not found");
                        }

                        // If event is confirmed and has calendar link, delete from calendars first
                        if (eventToDelete.status === "confirmed" && eventToDelete.googleCalendarEventId) {
                          try {
                            // Delete from Google Calendar using the stored event ID
                            // Only include participants who have accepted
                            const acceptedParticipants = eventToDelete.participants?.filter(p => p.status === "accepted") || [];
                            await deleteCalendarEvent({
                              eventId: eventToDelete.googleCalendarEventId,
                              creator: { clerkUserId: user?.id || '' },
                              participants: acceptedParticipants.map(p => ({
                                clerkUserId: p.contact?.contactUserId || ''
                              })).filter(p => p.clerkUserId) // Filter out any invalid clerk IDs
                            });
                          } catch (error) {
                            console.error("Error deleting calendar event:", error);
                            toast.error("Failed to delete from calendars");
                            return;
                          }
                        }

                        // Delete the event from our database
                        await deleteEvent({ id: eventId });
                        toast.success("Event deleted successfully");
                      } catch (error) {
                        console.error("Error deleting event:", error);
                        toast.error("Failed to delete event");
                      }
                    }}
                    onAccept={handleAcceptEvent}
                    onDecline={handleDeclineEvent}
                    onRemove={handleRemoveEvent}
                    onArchive={handleArchiveEvent}
                    onFindAvailability={handleFindAvailability}
                    onUpdateDateTime={async (eventId, selectedTime) => {
                      await updateEventDateTime({
                        eventId,
                        selectedDateTime: selectedTime
                      });
                    }}
                    contacts={contacts || []}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Meetings Yet</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Create your first meeting to get started. Your scheduled meetings will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {activeInvitedEvents.length > 0 && (
          <Card className="rounded-2xl border-0 bg-white shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2 px-8 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">Meeting Invitations</CardTitle>
            </CardHeader>
            <CardContent className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeInvitedEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isInvited={true}
                    onShare={handleShare}
                    onDelete={async (eventId) => {
                      try {
                        // Get the event to check if it's confirmed
                        const eventToDelete = events.find(e => e._id === eventId);
                        if (!eventToDelete) {
                          throw new Error("Event not found");
                        }

                        // If event is confirmed and has calendar link, delete from calendars first
                        if (eventToDelete.status === "confirmed" && eventToDelete.googleCalendarEventId) {
                          try {
                            // Delete from Google Calendar using the stored event ID
                            // Only include participants who have accepted
                            const acceptedParticipants = eventToDelete.participants?.filter(p => p.status === "accepted") || [];
                            await deleteCalendarEvent({
                              eventId: eventToDelete.googleCalendarEventId,
                              creator: { clerkUserId: user?.id || '' },
                              participants: acceptedParticipants.map(p => ({
                                clerkUserId: p.contact?.contactUserId || ''
                              })).filter(p => p.clerkUserId) // Filter out any invalid clerk IDs
                            });
                          } catch (error) {
                            console.error("Error deleting calendar event:", error);
                            toast.error("Failed to delete from calendars");
                            return;
                          }
                        }

                        // Delete the event from our database
                        await deleteEvent({ id: eventId });
                        toast.success("Event deleted successfully");
                      } catch (error) {
                        console.error("Error deleting event:", error);
                        toast.error("Failed to delete event");
                      }
                    }}
                    onAccept={handleAcceptEvent}
                    onDecline={handleDeclineEvent}
                    onRemove={handleRemoveEvent}
                    onArchive={handleArchiveEvent}
                    onFindAvailability={handleFindAvailability}
                    onUpdateDateTime={async (eventId, selectedTime) => {
                      await updateEventDateTime({
                        eventId,
                        selectedDateTime: selectedTime
                      });
                    }}
                    contacts={contacts || []}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
