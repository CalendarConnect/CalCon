"use client";
import { ArrowRight, Sparkles, Clock, Mail, Play } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export default function HeroSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
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
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 w-full space-y-8">
        {/* Header Content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            <span className="text-[#18181b]">The</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f35f43] via-[#f35f43] to-[#f7b772]">Daily Frustration</span>
            <br />
            <span className="text-[#18181b]">of Professional</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f35f43] via-[#f35f43] to-[#f7b772]">Scheduling</span>
          </h1>

          {/* Launch date badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto w-fit rounded-full border border-[#f35f43] bg-[#f7b772]/20 px-6 py-2"
          >
            <div className="flex items-center gap-2 text-base font-medium text-[#f35f43]">
              <Sparkles className="h-5 w-5" />
              <span>Launching April 2nd, 2025</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
        >
          <iframe
            src="https://www.youtube.com/embed/H94cmY5SaAw?autoplay=0"
            title="CalCon Introduction"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </motion.div>

        {/* Pain Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <p className="text-lg text-gray-600 leading-relaxed text-center">
            Every day, professionals waste countless hours coordinating meetings through endless email chains. Each meeting becomes a tedious dance of back-and-forth messages, trying to find that perfect time slot when everyone is available.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
              <Clock className="h-6 w-6 text-[#f35f43] mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Time Wasted</h3>
                <p className="text-gray-600">Every minute spent on email coordination is a minute taken away from meaningful work.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
              <Mail className="h-6 w-6 text-[#f35f43] mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Email Overload</h3>
                <p className="text-gray-600">Managing demos, sales calls, and meetings with executives shouldn't require endless email threads.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
