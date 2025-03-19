"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { Code2, Calendar, Bot } from "lucide-react";

export default function FounderStory() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-950 to-black text-white">
      {/* Background dot pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="#f35f43" />
            </pattern>
            {/* Mask for C shape */}
            <mask id="cMask">
              <rect width="100%" height="100%" fill="white" />
              <path
                d="M 60 20 A 40 40 0 1 0 60 80"
                stroke="black"
                strokeWidth="40"
                fill="none"
                transform="scale(6)"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" mask="url(#cMask)" />
        </svg>
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#f35f43]/10 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Founder Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative lg:sticky lg:top-32 mt-8 lg:mt-12"
          >
            <div className="relative w-[380px] h-[460px] mx-auto lg:mx-0 overflow-visible rounded-[2rem] border-[15px] border-[#f35f43]/90 shadow-lg shadow-[#f35f43]/5">
              <Image
                src="/Chris.jpeg"
                alt="Christian Bleeker"
                fill
                className="object-cover object-center rounded-[1.25rem]"
                sizes="(max-width: 768px) 100vw, 380px"
                priority
              />
              {/* Gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
            </div>
            {/* Quote overlay */}
            <div className="absolute -bottom-4 right-0 w-[240px] bg-[#f35f43]/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <p className="text-white/90 text-sm italic leading-snug">
                "So I could almost say, it's built by AI, for AI."
                <span className="block mt-1.5 text-white/80 font-medium">- Christian Bleeker</span>
              </p>
            </div>
          </motion.div>

          {/* Story Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="text-white">From Frustration to</span>{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f35f43] to-[#f7b772]">Innovation</span>
              </h2>
              <p className="text-gray-300 text-lg">
                As a growth marketer and business development manager, I lived the daily struggle of scheduling meetings. The endless back-and-forth email ping-pong just to find a suitable time was consuming hours of my week.
              </p>
            </div>

            <div className="space-y-6">
              {/* Learning to Code */}
              <div className="flex gap-5 p-5 rounded-xl bg-gray-900/50 border border-[#f35f43]/10 hover:border-[#f35f43]/30 transition-colors">
                <div className="mt-1">
                  <Code2 className="h-6 w-6 text-[#f35f43]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">The Learning Journey</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Through Vibe-coding—partnering with AI to write code—I turned vision into reality. Each new AI model brought better results. Every prompt refined the solution. Six months of innovation produced eight versions, each more powerful than the last. The result: a professional platform that delivers real value.
                  </p>
                </div>
              </div>

              {/* Calendar Integration */}
              <div className="flex gap-5 p-5 rounded-xl bg-gray-900/50 border border-[#f35f43]/10 hover:border-[#f35f43]/30 transition-colors">
                <div className="mt-1">
                  <Calendar className="h-6 w-6 text-[#f35f43]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">Smart Scheduling</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Built and bootstrapped independently, CalCon already serves Google Calendar users with intelligent scheduling. Our algorithm finds the perfect meeting time instantly. Microsoft Calendar integration arrives in two months, expanding your network's reach. All Google Calendar users can already use it to organize their meetings in the most efficient way today.
                  </p>
                </div>
              </div>

              {/* AI-Ready */}
              <div className="flex gap-5 p-5 rounded-xl bg-gray-900/50 border border-[#f35f43]/10 hover:border-[#f35f43]/30 transition-colors">
                <div className="mt-1">
                  <Bot className="h-6 w-6 text-[#f35f43]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white mb-2">Built for the Future</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    AI and I built CalCon together—a true AI-native startup from day one. Now, I invite you to join our Discord community and help shape its future. Share your ideas, provide feedback, and be part of building the infrastructure that AI assistants will use tomorrow. Real growth comes from real conversations, not just data. Let's create the future of scheduling together.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 