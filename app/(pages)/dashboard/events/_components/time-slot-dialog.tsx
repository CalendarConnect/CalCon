"use client";

import { format } from "date-fns";
import { Calendar, Loader2, Clock, Check, CalendarClock, CalendarDays, Users, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableSlots: TimeSlot[];
  isSearching: boolean;
  onSelectTimeSlot: (selectedTime: string) => Promise<void>;
}

export const TimeSlotDialog = ({
  isOpen,
  onOpenChange,
  availableSlots,
  isSearching,
  onSelectTimeSlot,
}: TimeSlotDialogProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    if (isOpen && isSearching) {
      // Reset states
      setShowResults(false);
      setIsAnimationComplete(false);
      setCurrentMessage(0);
      setIsTransitioning(false);
      setSelectedSlot(null);
      setIsConfirming(false);

      // First message shows immediately
      // Transition to second message (after 5s - increased significantly)
      timeouts.push(setTimeout(() => {
        setIsTransitioning(true);
        timeouts.push(setTimeout(() => {
          setCurrentMessage(1);
          setIsTransitioning(false);
        }, 300));
      }, 5000));

      // Transition to third message (after 6.5s - adjusted to maintain spacing)
      timeouts.push(setTimeout(() => {
        setIsTransitioning(true);
        timeouts.push(setTimeout(() => {
          setCurrentMessage(2);
          setIsTransitioning(false);
        }, 300));
      }, 6500));

      // Start showing results (after 9s - adjusted to maintain spacing)
      timeouts.push(setTimeout(() => {
        setShowResults(true);
        setIsAnimationComplete(true);
      }, 9000));
    } else if (!isSearching) {
      // When isSearching becomes false, show results immediately
      setShowResults(true);
      setIsAnimationComplete(true);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isOpen, isSearching]);

  // Reset selected slot when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(null);
      setIsConfirming(false);
    }
  }, [isOpen]);

  const handleTimeSlotSelect = async (startTime: string) => {
    if (!isAnimationComplete) return;
    // Toggle selection - if clicking the same slot, deselect it
    setSelectedSlot(currentSelected => currentSelected === startTime ? null : startTime);
  };

  const handleSaveTimeSlot = async () => {
    if (!selectedSlot) return;
    setIsConfirming(true);
    await onSelectTimeSlot(selectedSlot);
  };

  const loadingMessages = [
    "Analyzing calendars of all participants...",
    "Calculating optimal meeting times...",
    "Found the best time slots for everyone!"
  ];
  
  // Beautify the date text with formatting
  const formatDateText = (date: Date) => {
    const today = new Date();
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    
    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get the start of next week
    const startOfNextWeek = new Date(startOfWeek);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
    
    // Get the start of the week after next
    const startOfWeekAfterNext = new Date(startOfNextWeek);
    startOfWeekAfterNext.setDate(startOfNextWeek.getDate() + 7);

    let prefix = '';
    if (isToday) {
      prefix = 'Today';
    } else if (date >= startOfWeek && date < startOfNextWeek) {
      prefix = 'This';
    } else if (date >= startOfNextWeek && date < startOfWeekAfterNext) {
      prefix = 'Next';
    }

    return {
      prefix,
      isToday,
      dayName: format(date, 'EEEE'),
      fullDate: format(date, 'MMMM d, yyyy')
    };
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          
          <div className="px-8 pt-8 pb-5 flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Select Optimal Time Slot
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-2">
                We've calculated the best meeting times for all participants
              </p>
            </div>
            
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CalendarClock className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="h-[520px] flex flex-col">
              <div className="w-full relative h-full">
                {/* Loading State */}
                <AnimatePresence>
                  {!showResults && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-100 to-transparent rounded-full blur-2xl transform scale-150 opacity-70" />
                        <div className="relative flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-full animate-ping" />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="relative z-10"
                          >
                            <Loader2 
                              className="h-20 w-20 text-orange-500" 
                              strokeWidth={1.5}
                            />
                          </motion.div>
                          <CalendarDays className="h-8 w-8 text-orange-600 absolute" />
                        </div>
                      </div>
                      
                      <div className="w-full h-[60px] relative flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {loadingMessages.map((message, index) => (
                            index === currentMessage && (
                              <motion.p 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="w-full px-8 text-lg text-center text-gray-800 font-medium"
                              >
                                {message}
                              </motion.p>
                            )
                          ))}
                        </AnimatePresence>
                      </div>
                      
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ 
                          width: currentMessage === 0 ? "33%" : 
                                 currentMessage === 1 ? "66%" : 
                                 "100%" 
                        }}
                        transition={{ duration: 0.5 }}
                        className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mt-10 max-w-md"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                  {showResults && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-full h-full overflow-y-auto"
                    >
                      {availableSlots.length > 0 && (
                        <div className="w-full">
                          <div className="mb-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                            <div className="flex items-start gap-3">
                              <div className="rounded-lg bg-white p-2 border border-gray-200 shadow-sm">
                                <Users className="h-5 w-5 text-orange-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-800">
                                  Availability Analysis Complete
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 pr-4">
                                  Only the free timeslots of all participants are analyzed, which are then used in the algorithm to calculate the best date and time for everyone. Including timezones and working hours.
                                </p>
                                <div className="mt-2">
                                  <span className="inline-flex items-center text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    <span className="mr-1 text-orange-500 text-xs">✦</span> Coming soon: Personal Preferences
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center mb-5 px-1">
                            <h4 className="text-sm font-semibold text-gray-700">
                              Please select a time slot when all participants are available
                            </h4>
                            <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs">
                                {availableSlots.length}
                              </span>
                              Options
                            </div>
                          </div>

                          <div className="space-y-3 mb-3 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
                            {availableSlots.map((slot, index) => {
                              const startDate = new Date(slot.start);
                              const endDate = new Date(slot.end);
                              const dateInfo = formatDateText(startDate);
                              
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ 
                                    duration: 0.3,
                                    delay: 0.1 + (index * 0.05) // Stagger effect 
                                  }}
                                >
                                  <div
                                    onClick={() => handleTimeSlotSelect(slot.start)}
                                    className={cn(
                                      "group flex items-center p-4 border rounded-xl bg-white transition-all duration-300 overflow-hidden relative",
                                      selectedSlot === slot.start 
                                        ? "border-orange-500 shadow-[0_0_0_1px_rgba(249,115,22,0.6)] shadow-orange-500/20" 
                                        : "border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5",
                                      !isAnimationComplete && "pointer-events-none opacity-70",
                                    )}
                                  >
                                    {/* Left date section */}
                                    <div className={cn(
                                      "flex-shrink-0 w-[76px] h-[76px] rounded-lg mr-4 flex flex-col items-center justify-center overflow-hidden relative transition-all",
                                      selectedSlot === slot.start
                                        ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white" 
                                        : "bg-gray-50 text-gray-700 group-hover:bg-gray-100/80"
                                    )}>
                                      {selectedSlot === slot.start && (
                                        <motion.div 
                                          initial={{ opacity: 0, scale: 0 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow-sm"
                                        >
                                          <Check className="h-2.5 w-2.5 text-orange-600" />
                                        </motion.div>
                                      )}
                                      <span className={cn(
                                        "text-xs font-medium uppercase",
                                        selectedSlot === slot.start ? "text-orange-100" : "text-gray-500"
                                      )}>
                                        {format(startDate, 'MMM')}
                                      </span>
                                      <span className={cn(
                                        "text-2xl font-bold",
                                        selectedSlot === slot.start ? "text-white" : "text-gray-800"
                                      )}>
                                        {format(startDate, 'd')}
                                      </span>
                                      <span className={cn(
                                        "text-xs font-medium",
                                        selectedSlot === slot.start ? "text-orange-100" : "text-gray-500"
                                      )}>
                                        {format(startDate, 'EEEE').substring(0, 3)}
                                      </span>
                                    </div>
                                    
                                    {/* Main content */}
                                    <div className="flex-grow">
                                      {/* Date info */}
                                      <div className="mb-2 flex items-center">
                                        <div className={cn(
                                          "font-medium text-sm flex items-center",
                                          selectedSlot === slot.start ? "text-orange-600" : "text-gray-700"
                                        )}>
                                          <span>
                                            {dateInfo.prefix} {!dateInfo.isToday && dateInfo.dayName}
                                          </span>
                                          <ChevronRight className="h-3.5 w-3.5 inline mx-1 opacity-70" />
                                          <span>{dateInfo.fullDate}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Time info */}
                                      <div className="flex items-center gap-4">
                                        <div className={cn(
                                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs",
                                          selectedSlot === slot.start
                                            ? "bg-orange-50 text-orange-700"
                                            : "bg-gray-50 text-gray-700"
                                        )}>
                                          <Clock className="h-3.5 w-3.5" />
                                          <span className="whitespace-nowrap">
                                            {format(startDate, 'h:mm')} - {format(endDate, 'h:mm a')}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))} minutes
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Right icon */}
                                    <div className={cn(
                                      "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all",
                                      selectedSlot === slot.start 
                                        ? "text-orange-600" 
                                        : "text-gray-400 group-hover:text-gray-600"
                                    )}>
                                      <CalendarClock className="h-5 w-5" />
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-6 flex justify-end gap-3">
                            <Button
                              onClick={() => onOpenChange(false)}
                              variant="outline"
                              className="h-10 px-4 text-sm text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveTimeSlot}
                              disabled={!selectedSlot || isConfirming}
                              className={cn(
                                "h-10 px-5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 rounded-xl disabled:opacity-70 disabled:shadow-none",
                              )}
                            >
                              {isConfirming ? (
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
                                  Confirming...
                                </span>
                              ) : (
                                "Confirm Selection"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {availableSlots.length === 0 && showResults && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-orange-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            No Available Time Slots
                          </h3>
                          <p className="text-sm text-gray-500 max-w-md">
                            We couldn't find any time slots when all participants are available. Consider adjusting the participant list or checking back later.
                          </p>
                          <Button
                            onClick={() => onOpenChange(false)}
                            className="mt-6 h-10 px-5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 rounded-xl"
                          >
                            Close
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Add custom scrollbar styles */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #ddd;
              border-radius: 10px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #ccc;
            }
          `}</style>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}; 