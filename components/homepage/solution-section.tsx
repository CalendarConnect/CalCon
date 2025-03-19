"use client";
import { motion } from "motion/react";
import { Shield, Zap, Bot } from "lucide-react";

export default function SolutionSection() {
  return (
    <section id="solution" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 space-y-16">
        {/* Solution Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-[#18181b]">From Problem to</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f35f43] via-[#f35f43] to-[#f7b772]">Solution</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We - AI and myself - solved the immediate problem first: schedule meetings across Google Calendar users in seconds, while maintaining complete privacy. But we also built it with tomorrow in mind.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Instant Scheduling */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#f35f43]/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-[#f35f43]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Instant Scheduling
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No more email chains. Schedule meetings across any calendar system in seconds. It just works, right now, today.
            </p>
          </div>

          {/* Privacy First */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#f35f43]/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#f35f43]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Complete Privacy
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Share only free/busy status, never sensitive details. Every calendar connection represents trust between professionals.
            </p>
          </div>

          {/* AI Ready */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#f35f43]/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-[#f35f43]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Ready for AI
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built for the future where AI assistants schedule meetings across organizations while preserving privacy and professional boundaries.
            </p>
          </div>
        </motion.div>

        {/* Vision Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center space-y-6 pt-8"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Building Tomorrow's Infrastructure
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're not just building a product - we're creating the essential infrastructure for the future of professional scheduling. As AI assistants become mainstream, they'll use CalCon to coordinate meetings across organizations while preserving privacy.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 