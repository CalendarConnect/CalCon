"use client";

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
import { Calendar, CalendarCheck, Mail, Video, Check, X, CalendarPlus, CalendarClock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ConfirmMeetingDialogProps {
  isConfirming: boolean;
  onConfirm: () => Promise<void>;
  trigger?: React.ReactNode;
}

export const ConfirmMeetingDialog = ({
  isConfirming,
  onConfirm,
  trigger
}: ConfirmMeetingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clickedConfirm, setClickedConfirm] = useState(false);

  const handleConfirm = async () => {
    setClickedConfirm(true);
    await onConfirm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            className="w-full h-9 px-4 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 rounded-xl disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-1.5"
            disabled={isConfirming}
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
              <>
                <Calendar className="w-4 h-4" />
                <span>Confirm Event</span>
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-[28px] shadow-[0_20px_80px_-12px_rgba(0,0,0,0.15)] border-0">
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
                Confirm Meeting
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-2 font-normal">
                The meeting will be scheduled and participants will be notified
              </DialogDescription>
            </div>
            
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CalendarPlus className="h-6 w-6" />
              </div>
            </div>
          </div>
        
          <div className="px-8 pt-2 pb-8">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Check className="h-3 w-3" />
                </span>
                By confirming this meeting:
              </h3>
              
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="group"
                >
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50/10 transition-all shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800">Calendar Event</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        The meeting will be automatically added to all participants' calendars
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="group"
                >
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50/10 transition-all shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800">Email Notification</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        All participants will receive an official Google Calendar email
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="group"
                >
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-orange-200 hover:bg-orange-50/10 transition-all shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800">Video Conference</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        A Google Meet link will be generated for the meeting
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 flex justify-between gap-3"
            >
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="h-10 px-4 text-sm text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isConfirming || clickedConfirm}
                className={cn(
                  "h-10 px-5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 rounded-xl disabled:opacity-70 disabled:shadow-none",
                )}
              >
                {isConfirming || clickedConfirm ? (
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
                  <span className="flex items-center gap-2">
                    Yes, Confirm Meeting
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}; 