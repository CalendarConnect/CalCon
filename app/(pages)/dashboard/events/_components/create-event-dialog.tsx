"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const durations = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
] as const;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  duration: z.enum(["15", "30", "45", "60", "120", "180"], {
    required_error: "Duration is required",
  }),
  participantIds: z.array(z.custom<Id<"contacts">>()),
});

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEventDialog = ({
  open,
  onOpenChange,
}: CreateEventDialogProps) => {
  const { user } = useUser();
  const createEvent = useMutation(api.events.mutations.createEvent);
  const [isLoading, setIsLoading] = useState(false);

  // Get user's contacts for participant selection
  const contacts = useQuery(api.contacts.queries.getContacts, {
    userId: user?.id || "",
  });

  // Filter for only connected contacts
  const connectedContacts = contacts?.filter((contact) => contact.status === "connected");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      duration: "60",
      participantIds: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("Creating event with values:", values);

      // Validate that we have at least one participant
      if (values.participantIds.length === 0) {
        toast.error("Please select at least one participant");
        return;
      }

      // Validate that all participants are connected
      const allConnected = values.participantIds.every((id) =>
        connectedContacts?.some((contact) => contact._id === id)
      );

      if (!allConnected) {
        toast.error("Can only invite connected contacts");
        return;
      }

      await createEvent({
        userId: user?.id || "",
        title: values.title,
        description: values.description,
        location: values.location,
        duration: values.duration,
        participantIds: values.participantIds,
      });
      toast.success("Event created successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(
        `Failed to create event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Event title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Event description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Event location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durations.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participants</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        const contactId = value as Id<"contacts">;
                        // Only add if not already selected and contact is connected
                        if (
                          !field.value.includes(contactId) &&
                          connectedContacts?.some((c) => c._id === contactId)
                        ) {
                          field.onChange([...field.value, contactId]);
                        }
                      }}
                      value=""
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add participants" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectedContacts
                          ?.filter((contact) => !field.value.includes(contact._id))
                          .map((contact) => (
                            <SelectItem key={contact._id} value={contact._id}>
                              {contact.fullName || contact.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {field.value.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        Selected Participants ({field.value.length}):
                      </div>
                      {field.value.map((participantId) => {
                        const contact = connectedContacts?.find(
                          (c) => c._id === participantId
                        );
                        return contact ? (
                          <div
                            key={participantId}
                            className="flex items-center justify-between bg-secondary p-2 rounded-md"
                          >
                            <span>{contact.fullName || contact.email}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((id) => id !== participantId)
                                );
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Create Event
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
