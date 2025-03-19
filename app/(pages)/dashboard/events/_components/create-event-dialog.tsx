"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clock, MapPin, X, Sparkles, Users, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const durations = [
  { value: "15", label: "15 minutes", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "30", label: "30 minutes", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "45", label: "45 minutes", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "60", label: "1 hour", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "120", label: "2 hours", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "180", label: "3 hours", icon: <Clock className="h-3.5 w-3.5" /> },
] as const;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required").max(100, "Description cannot be longer than 100 characters"),
  location: z.literal("Google Meet"),
  duration: z.enum(["15", "30", "45", "60", "120", "180"], {
    required_error: "Duration is required",
  }),
  participantIds: z.array(z.custom<Id<"contacts">>()),
  timezone: z.string(),
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
  const [showConfetti, setShowConfetti] = useState(false);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
      location: "Google Meet",
      duration: "60",
      participantIds: [],
      timezone: userTimezone,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      // Validate that we have at least one participant
      if (values.participantIds.length === 0) {
        toast.error("Please select at least one participant", {
          style: { 
            borderRadius: "16px", 
            background: "linear-gradient(to right, #fff0f0, #fff5f5)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
            border: "1px solid rgba(252, 165, 165, 0.2)"
          },
        });
        setIsLoading(false);
        return;
      }

      // Validate that all participants are connected
      const allConnected = values.participantIds.every((id) =>
        connectedContacts?.some((contact) => contact._id === id)
      );

      if (!allConnected) {
        toast.error("Can only invite connected contacts", {
          style: { 
            borderRadius: "16px", 
            background: "linear-gradient(to right, #fff0f0, #fff5f5)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
            border: "1px solid rgba(252, 165, 165, 0.2)"
          },
        });
        setIsLoading(false);
        return;
      }

      await createEvent({
        userId: user?.id || "",
        title: values.title,
        description: values.description,
        location: values.location,
        duration: values.duration,
        participantIds: values.participantIds,
        timezone: values.timezone,
      });
      
      // Show confetti and success message
      setShowConfetti(true);
      setTimeout(() => {
        toast.success("Meeting created successfully", {
          style: { 
            borderRadius: "16px", 
            background: "linear-gradient(to right, #fff7ed, #ffedd5)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
            border: "1px solid rgba(251, 146, 60, 0.2)"
          },
          icon: <Sparkles className="h-5 w-5 text-orange-500" />
        });
        form.reset();
        onOpenChange(false);
        setShowConfetti(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error(
        `Failed to create meeting: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          style: { 
            borderRadius: "16px", 
            background: "linear-gradient(to right, #fff0f0, #fff5f5)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
            border: "1px solid rgba(252, 165, 165, 0.2)"
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get timezone abbreviation
  const getTimezoneAbbr = () => {
    const date = new Date();
    return date.toLocaleTimeString('en-us', { timeZoneName: 'short' })
      .split(' ')[2];
  };

  // Format current date
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-white rounded-[28px] shadow-[0_20px_80px_-12px_rgba(0,0,0,0.15)] border-0">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="relative"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-600"></div>
          
          <div className="px-8 pt-8 pb-6 flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Create New Meeting
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-orange-500" />
                  <span>{formatDate()}</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>{getTimezoneAbbr()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          Meeting Title
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              {...field} 
                              placeholder="Enter a descriptive title"
                              className="h-12 pl-4 pr-4 text-base bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-0 transition-colors group-hover:border-gray-300"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs mt-1.5 font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          Description
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Textarea 
                              {...field} 
                              placeholder="What's this meeting about?"
                              className="min-h-[90px] py-3 px-4 text-base bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-0 transition-colors group-hover:border-gray-300 resize-none"
                            />
                          </div>
                        </FormControl>
                        <div className="flex justify-between mt-1.5">
                          <FormMessage className="text-xs font-medium text-red-500" />
                          <span className="text-xs text-gray-400">{field.value.length}/100</span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Duration & Platform Section */}
                <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Meeting Details
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-xs font-medium text-gray-500">
                          Duration
                        </FormLabel>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {durations.map(({ value, label }) => (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              key={value}
                            >
                              <button
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  "w-full flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl transition-all duration-200 border",
                                  field.value === value
                                    ? "bg-gradient-to-b from-orange-50 to-white border-orange-200 shadow-sm"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                                )}
                              >
                                <div className={cn(
                                  "text-sm font-medium",
                                  field.value === value
                                    ? "text-orange-600"
                                    : "text-gray-600"
                                )}>
                                  {label}
                                </div>
                                {field.value === value && (
                                  <div className="rounded-full p-1 bg-orange-100 mt-1">
                                    <Check className="h-3 w-3 text-orange-600" />
                                  </div>
                                )}
                              </button>
                            </motion.div>
                          ))}
                        </div>
                        <FormMessage className="text-xs mt-1.5 font-medium text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-gray-500">Meeting Platform</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center mt-2">
                            <div className="absolute left-3 text-orange-500">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <Input 
                              {...field} 
                              value="Google Meet"
                              disabled
                              className="h-11 pl-10 text-sm bg-gradient-to-r from-orange-50 to-white border border-orange-200 text-orange-600 rounded-xl cursor-not-allowed font-medium"
                            />
                            <div className="absolute right-3 rounded-full p-1 bg-orange-100">
                              <Check className="h-3 w-3 text-orange-600" />
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Participants Section */}
                <div className="rounded-2xl border border-gray-100 p-5 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    Participants
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="participantIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-3 text-gray-400 top-1/2 -translate-y-1/2">
                              <Users className="h-4 w-4" />
                            </div>
                            <Select
                              onValueChange={(value) => {
                                const contactId = value as Id<"contacts">;
                                if (
                                  !field.value.includes(contactId) &&
                                  connectedContacts?.some((c) => c._id === contactId)
                                ) {
                                  field.onChange([...field.value, contactId]);
                                }
                              }}
                              value=""
                            >
                              <SelectTrigger className="h-11 pl-10 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:border-orange-500 focus:ring-0 transition-colors group-hover:border-gray-300">
                                <SelectValue placeholder="Add participants" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                                <ScrollArea className="max-h-[180px]">
                                  {connectedContacts
                                    ?.filter((contact) => !field.value.includes(contact._id))
                                    .map((contact) => (
                                      <SelectItem 
                                        key={contact._id} 
                                        value={contact._id} 
                                        className="text-sm text-gray-800 focus:bg-orange-50 focus:text-orange-600 py-2 px-3 cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-7 w-7 border border-gray-200">
                                            <AvatarFallback className="bg-gradient-to-b from-orange-100 to-orange-50 text-orange-600 text-xs">
                                              {(contact.fullName || contact.email).substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="truncate">
                                            <p className="font-medium truncate">{contact.fullName || contact.email}</p>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        
                        <AnimatePresence>
                          {field.value.length > 0 ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-500 text-white text-xs font-medium">
                                    {field.value.length}
                                  </span>
                                  <span className="text-sm text-gray-700 font-medium">Participants selected</span>
                                </div>
                                {field.value.length > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.onChange([])}
                                    className="h-8 px-3 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                  >
                                    Clear all
                                  </Button>
                                )}
                              </div>
                              
                              <ScrollArea className="max-h-[150px]">
                                <div className="space-y-2">
                                  {field.value.map((participantId) => {
                                    const contact = connectedContacts?.find(
                                      (c) => c._id === participantId
                                    );
                                    return contact ? (
                                      <motion.div
                                        key={participantId}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.15 }}
                                        className="group"
                                      >
                                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 transition-all">
                                          <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-gray-200">
                                              <AvatarFallback className="bg-gradient-to-b from-orange-100 to-orange-50 text-orange-600 text-xs">
                                                {(contact.fullName || contact.email).substring(0, 2).toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <p className="font-medium text-sm text-gray-800">
                                                {contact.fullName || contact.email}
                                              </p>
                                              {contact.fullName && contact.email && (
                                                <p className="text-xs text-gray-500">{contact.email}</p>
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              field.onChange(
                                                field.value.filter((id) => id !== participantId)
                                              );
                                            }}
                                            className="h-7 w-7 p-0 opacity-80 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </motion.div>
                                    ) : null;
                                  })}
                                </div>
                              </ScrollArea>
                            </motion.div>
                          ) : (
                            <div className="mt-4 flex flex-col items-center justify-center py-6 px-4 rounded-xl bg-white border border-gray-200 border-dashed text-center">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                <Users className="h-5 w-5 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-500 mb-1">No participants selected</p>
                              <p className="text-xs text-gray-400">Add at least one participant to continue</p>
                            </div>
                          )}
                        </AnimatePresence>
                        
                        <FormMessage className="text-xs mt-2 font-medium text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-5 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-11 px-5 text-sm text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || form.getValues().participantIds.length === 0}
                  className="h-11 px-6 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 rounded-xl disabled:opacity-70 disabled:shadow-none"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                          fill="none"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Meeting"
                  )}
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Confetti effect animation */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  initial={{ 
                    top: "50%", 
                    left: "50%",
                    backgroundColor: ["#F97316", "#EF4444", "#3B82F6", "#10B981", "#8B5CF6"][Math.floor(Math.random() * 5)]
                  }}
                  animate={{ 
                    top: `${Math.random() * 100}%`, 
                    left: `${Math.random() * 100}%`,
                    opacity: [1, 0.8, 0] 
                  }}
                  transition={{ 
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
