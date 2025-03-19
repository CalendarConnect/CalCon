"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User2, Building2, Briefcase, Mail, SparkleIcon } from "lucide-react";
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

interface ContactFormData {
  fullName: string;
  companyName: string;
  role: string;
  email: string;
}

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  companyName: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Invalid email address"),
});

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddContactDialog = ({
  open,
  onOpenChange,
}: AddContactDialogProps) => {
  const { user } = useUser();
  const createContact = useMutation(api.contacts.mutations.createContact);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      role: "",
      email: "",
    },
  });

  const onSubmit = async (values: ContactFormData) => {
    if (!user?.emailAddresses[0]?.emailAddress || !user?.fullName) {
      toast.error("User information not available");
      return;
    }

    try {
      setIsLoading(true);
      await createContact({
        userId: user.id,
        senderName: user.fullName,
        senderEmail: user.emailAddresses[0].emailAddress,
        ...values,
      });
      
      // Show success confetti animation
      setShowConfetti(true);
      setTimeout(() => {
        toast.success("Contact invitation sent successfully", {
          style: { 
            borderRadius: "16px", 
            background: "linear-gradient(to right, #fff7ed, #ffedd5)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
            border: "1px solid rgba(251, 146, 60, 0.2)"
          },
          icon: <SparkleIcon className="h-5 w-5 text-orange-500" />
        });
        setShowConfetti(false);
        form.reset();
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      toast.error("Failed to send invitation", {
        style: { 
          borderRadius: "16px", 
          background: "linear-gradient(to right, #fff0f0, #fff5f5)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(252, 165, 165, 0.2)"
        }
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          
          {/* Background gradients */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-50/80 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-50/80 rounded-full opacity-30 blur-3xl"></div>
          
          <div className="px-8 pt-8 pb-6 flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Add New Contact
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-2">
                Send an invitation to connect and schedule meetings together
              </p>
            </div>
            
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <User2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-8 pb-8">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <User2 className="h-4 w-4" />
                          </div>
                          <Input 
                            {...field} 
                            placeholder="Enter full name" 
                            className="h-11 pl-10 pr-4 text-base bg-white border border-gray-200 shadow-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-0 transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs mt-1.5 font-medium text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Company Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <Input 
                            {...field} 
                            placeholder="Enter company name" 
                            className="h-11 pl-10 pr-4 text-base bg-white border border-gray-200 shadow-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-0 transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs mt-1.5 font-medium text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Job Title</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <Input 
                            {...field} 
                            placeholder="Enter job title" 
                            className="h-11 pl-10 pr-4 text-base bg-white border border-gray-200 shadow-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-0 transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs mt-1.5 font-medium text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail className="h-4 w-4" />
                          </div>
                          <Input 
                            {...field} 
                            type="email" 
                            placeholder="Enter email address" 
                            className="h-11 pl-10 pr-4 text-base bg-white border border-gray-200 shadow-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:ring-0 transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs mt-1.5 font-medium text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="h-11 px-5 text-sm text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
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
                      Sending...
                    </span>
                  ) : (
                    "Send Invitation"
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
