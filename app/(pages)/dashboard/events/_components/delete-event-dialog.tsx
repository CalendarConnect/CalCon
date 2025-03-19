"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { deleteCalendarEvent } from "@/server/googleCalendar";

interface DeleteEventDialogProps {
  eventId: Id<"events">;
  isConfirmed: boolean;
  hasCalendarEventId: boolean;
  googleCalendarEventId?: string;
  acceptedParticipants?: Array<{ contact?: { contactUserId?: string } }>;
  creatorClerkUserId: string;
  onDelete: (eventId: Id<"events">) => Promise<void>;
  trigger?: React.ReactNode;
}

export const DeleteEventDialog = ({
  eventId,
  isConfirmed,
  hasCalendarEventId,
  googleCalendarEventId,
  acceptedParticipants = [],
  creatorClerkUserId,
  onDelete,
  trigger,
}: DeleteEventDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // If event is confirmed and has calendar link, delete from calendars first
      if (isConfirmed && hasCalendarEventId && googleCalendarEventId) {
        try {
          // Delete from Google Calendar using the stored event ID
          // Only include participants who have accepted
          await deleteCalendarEvent({
            eventId: googleCalendarEventId,
            creator: { clerkUserId: creatorClerkUserId },
            participants: acceptedParticipants
              .map(p => ({
                clerkUserId: p.contact?.contactUserId || ''
              }))
              .filter(p => p.clerkUserId) // Filter out any invalid clerk IDs
          });
        } catch (error) {
          console.error("Error deleting calendar event:", error);
          // Don't return here, continue with database deletion even if calendar deletion fails
          toast.error("Warning: Could not delete from all calendars, but the event will be removed from the system");
        }
      }

      // Delete the event from our database
      await onDelete(eventId);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 ml-3 flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1c1c1f] border border-[#2a2a2d] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden">
        <DialogHeader className="border-b border-[#2a2a2d] pb-3">
          <DialogTitle className="text-[0.8125rem] font-medium text-white/90">Delete Event</DialogTitle>
          <DialogDescription className="text-[0.8125rem] text-white/60 mt-1.5">
            {isConfirmed && hasCalendarEventId ? (
              <>
                <p>This event has been confirmed and added to all participants' calendars.</p>
                <div className="mt-3 space-y-2">
                  <p>Deleting this event will:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li className="text-[0.8125rem] text-white/60">Remove it from all participants' calendars</li>
                    <li className="text-[0.8125rem] text-white/60">Delete all meeting links</li>
                    <li className="text-[0.8125rem] text-white/60">Cancel the event for everyone</li>
                  </ul>
                </div>
                <p className="mt-3 text-white/80 font-medium">Are you sure you want to proceed?</p>
              </>
            ) : (
              "Are you sure you want to delete this event? This action cannot be undone."
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-end mt-6 pt-6 border-t border-[#2a2a2d]">
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-3 text-[0.8125rem] text-white/60 hover:text-white/90 hover:bg-white/5"
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </DialogTrigger>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 px-3 text-[0.8125rem] bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
          >
            {isDeleting ? "Deleting..." : (isConfirmed && hasCalendarEventId ? "Delete from all calendars" : "Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 