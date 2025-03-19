"use client";

import { Archive, Settings, Calendar, Video, RotateCcw, Users, Plus, ChevronRight, ChevronDown, User2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow, format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { AddContactDialog } from "../../../(pages)/dashboard/contacts/_components/add-contact-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidePanelProps {
  children?: React.ReactNode;
}

export const SidePanel = ({ children }: SidePanelProps) => {
  const pathname = usePathname();
  const { user } = useUser();
  const events = useQuery(api.events.queries.getEvents, { userId: user?.id || "" });
  const contacts = useQuery(api.contacts.queries.getContacts, { userId: user?.id || "" });
  const updateEventStatus = useMutation(api.events.mutations.updateEventStatus);
  
  // Initialize panels as collapsed by default
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false);
  const [isContactsExpanded, setIsContactsExpanded] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filter for archived events and sort by date
  const archivedEvents = events
    ?.filter(event => event.status === "archived")
    .sort((a, b) => {
      const dateA = new Date(a.selectedDateTime || a._creationTime);
      const dateB = new Date(b.selectedDateTime || b._creationTime);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    }) || [];

  // Set initial expanded states when data loads - only for contacts
  useEffect(() => {
    if (contacts) {
      setIsContactsExpanded(contacts.length > 0);
    }
  }, [contacts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-600 border border-emerald-200/50";
      case "pending":
        return "bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 border border-orange-200/50";
      case "declined":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-rose-600 border border-rose-200/50";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200/50";
    }
  };

  const handleUnarchive = async (eventId: Id<"events">, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      await updateEventStatus({
        id: eventId as Id<"events">,
        status: "confirmed"
      });
      toast.success("Event restored successfully");
    } catch (error) {
      console.error("Error restoring event:", error);
      toast.error("Failed to restore event");
    }
  };

  const renderContent = () => {
    // Handle different pages
    if (pathname.includes("/events")) {
      return (
        <>
          {/* Contacts Section Header */}
          <motion.div 
            className={cn(
              "flex h-14 items-center px-5 border-b border-gray-100 cursor-pointer transition-all relative overflow-hidden",
              isContactsExpanded ? "bg-gray-50" : "hover:bg-gray-50"
            )}
            onClick={() => setIsContactsExpanded(!isContactsExpanded)}
            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
            initial={false}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-100 to-orange-50 flex items-center justify-center text-orange-500">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800">My Contacts</span>
                {contacts && contacts.length > 0 && (
                  <Badge className="ml-2 bg-orange-100 text-orange-600 border-orange-200 border h-5 px-1.5 text-xs">
                    {contacts.length}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all shrink-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddContactOpen(true);
              }}
              title="Add Contact"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <motion.div
              animate={{ rotate: isContactsExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="h-8 w-8 flex items-center justify-center text-gray-400"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>

          {/* Contacts List */}
          <AnimatePresence initial={false}>
            {isContactsExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden bg-white"
              >
                <div className="border-b border-gray-100">
                  <ScrollArea className="max-h-[280px]">
                    <div className="space-y-1 p-3">
                      {contacts && contacts.length > 0 ? (
                        contacts.slice(0, 5).map((contact) => (
                          <motion.div
                            key={contact._id}
                            className="group p-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-100/50 hover:border-gray-200 transition-all"
                            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8 border border-gray-200/80">
                                <AvatarFallback className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 text-xs">
                                  {(contact.fullName || contact.email || "?")[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 space-y-0.5 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-gray-800 truncate">
                                    {contact.fullName || contact.email}
                                  </h3>
                                  <Badge className={`text-[0.65rem] px-1.5 py-0.5 rounded-full whitespace-nowrap ${getStatusColor(contact.status)}`}>
                                    {contact.status}
                                  </Badge>
                                </div>
                                <div className="space-y-0.5">
                                  {contact.role && contact.companyName && (
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {contact.role} at {contact.companyName}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 line-clamp-1">{contact.email}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3">
                            <User2 className="h-6 w-6 text-orange-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 text-center">
                            No contacts yet
                          </p>
                          <p className="text-xs text-gray-500 text-center mt-1 max-w-[200px]">
                            Add contacts to collaborate and schedule meetings together
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 h-9 text-sm bg-white text-gray-700 border-gray-200 hover:bg-gray-50 rounded-lg"
                            onClick={() => setIsAddContactOpen(true)}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Contact
                          </Button>
                        </div>
                      )}
                      {contacts && contacts.length > 5 && (
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="pt-1 text-center"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center items-center h-9 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50/50 rounded-lg"
                          >
                            View All Contacts <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Archive Section Header */}
          <motion.div
            className={cn(
              "flex h-14 items-center px-5 border-b border-gray-100 cursor-pointer transition-all relative overflow-hidden",
              isArchiveExpanded ? "bg-gray-50" : "hover:bg-gray-50"
            )}
            onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
            initial={false}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 flex items-center justify-center text-gray-600">
                <Archive className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800">Archived Meetings</span>
                {archivedEvents.length > 0 && (
                  <Badge className="ml-2 bg-gray-100 text-gray-600 border-gray-200 border h-5 px-1.5 text-xs">
                    {archivedEvents.length}
                  </Badge>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isArchiveExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="h-8 w-8 flex items-center justify-center text-gray-400"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>

          {/* Archived Events List */}
          <AnimatePresence initial={false}>
            {isArchiveExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden bg-white"
              >
                <div className="border-b border-gray-100">
                  <ScrollArea className="max-h-[280px]">
                    <div className="space-y-1.5 p-3">
                      {archivedEvents.length > 0 ? (
                        archivedEvents.map((event, index) => {
                          const eventDate = new Date(event.selectedDateTime || event._creationTime);
                          const isInPast = eventDate < new Date();
                          const itemId = event._id.toString();

                          return (
                            <motion.div
                              key={event._id}
                              className="relative rounded-xl border border-gray-100 bg-white transition-all overflow-hidden"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.2 }}
                              onHoverStart={() => setHoveredItem(itemId)}
                              onHoverEnd={() => setHoveredItem(null)}
                            >
                              <div 
                                className={cn(
                                  "p-3 group transition-all",
                                  hoveredItem === itemId ? "bg-gray-50" : "bg-white"
                                )}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-gray-800 mb-1.5 line-clamp-1">
                                      {event.title}
                                    </h3>
                                    <div className="space-y-1.5">
                                      <div className="flex items-center flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full">
                                          <Calendar className="h-3 w-3 text-gray-500" />
                                          <p className="text-xs text-gray-600 whitespace-nowrap">
                                            {event.selectedDateTime 
                                              ? format(new Date(event.selectedDateTime), 'MMM d')
                                              : 'No date'}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full">
                                          <Video className="h-3 w-3 text-gray-500" />
                                          <p className="text-xs text-gray-600">{event.location}</p>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Archived {formatDistanceToNow(new Date(event.updatedAt))} ago
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 rounded-full p-0 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all shrink-0"
                                    onClick={(e) => handleUnarchive(event._id, e)}
                                    title="Restore event"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Archive className="h-6 w-6 text-gray-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 text-center">
                            No archived meetings
                          </p>
                          <p className="text-xs text-gray-500 text-center mt-1 max-w-[200px]">
                            Archived meetings will appear here for future reference
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      );
    }

    // Default settings panel
    return (
      <>
        <div className="flex h-14 items-center px-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-100 to-orange-50 flex items-center justify-center text-orange-500">
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-gray-800">Settings</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </>
    );
  };

  return (
    <div className="h-full rounded-tl-3xl overflow-hidden">
      <div className="flex h-full flex-col">
        {renderContent()}
      </div>
      <AddContactDialog
        open={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
      />
    </div>
  );
};

export const SidePanelContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[calc(100vh-3rem)] relative">
      {/* Main Content Layer */}
      <div className="absolute inset-0 pr-[320px]">
        <div className="h-full relative">
          <div className="absolute inset-0 bg-gray-50 md:rounded-tl-[28px] md:rounded-tr-[28px] shadow-[0_4px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.05)] transition-all ease-in-out duration-300">
            <div className="h-full overflow-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel Layer - Now on top */}
      <div className="absolute top-0 right-0 bottom-0 min-[1024px]:block hidden w-[320px] bg-white shadow-[-8px_0px_20px_-8px_rgba(0,0,0,0.03)] z-10 overflow-hidden rounded-tl-[28px]">
        <div className="h-full overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SidePanel />
        </div>
      </div>
    </div>
  );
}; 