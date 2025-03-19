"use client";
import { motion } from "motion/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRight, Users } from "lucide-react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export default function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToWaitlist = useMutation(api.waitlist.add);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await addToWaitlist({ email });
      toast.success("You're on the waitlist! We'll notify you when we launch.");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <section className="py-24 relative bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
        {/* Founding Members Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-fit rounded-full border border-[#f35f43] bg-[#f7b772]/20 px-4 py-1"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-[#f35f43]">
            <Users className="h-4 w-4" />
            <span>Founding 1000 Program</span>
          </div>
        </motion.div>

        {/* CTA Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-[#18181b]">Join Us in Building the</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f35f43] via-[#f35f43] to-[#f7b772]">Future</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Be one of our first 1000 members. Get lifetime preferred pricing at $9/month, early access to features, and help shape the future of professional scheduling.
          </p>
        </motion.div>

        {/* Email Signup Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            className="h-12 min-w-[300px] rounded-full text-center sm:text-left"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-[#18181b] hover:bg-[#18181b]/90 text-white rounded-full px-8 h-12 min-w-[200px]"
          >
            {isSubmitting ? "Joining..." : "Join the Waitlist"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.form>

        {/* Launch Info */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          Launching April 2nd, 2024. Early access members get immediate access on launch day.
        </motion.p>
      </div>
    </section>
  );
} 