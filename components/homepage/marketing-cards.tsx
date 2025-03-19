"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const ProjectsData = [
  {
    id: 1,
    name: "AI-First Calendar Network",
    description:
      "Built for the AI revolution. Ready for OpenAI's Operator, GPT-powered assistants, and the future of automated scheduling. Be the first to experience it.",
    svg: `
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_408_139" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
<circle cx="90" cy="90" r="90" fill="black"/>
</mask>
<g mask="url(#mask0_408_139)">
<circle cx="90" cy="90" r="87" fill="black" stroke="white" stroke-width="6"/>
<path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_139)"/>
<rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_408_139)"/>
</g>
<defs>
<linearGradient id="paint0_linear_408_139" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint1_linear_408_139" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="white" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
    `,
    url: "https://nextjs.org/",
    color: "from-[#000000] to-[#3B3B3B]",
  },
  {
    id: 2,
    name: "Founding 1000 Program",
    description:
      "Join as one of our first 1000 members at $9/month for life. Get unlimited contacts, all future features, and early access to updates. Shape the future of scheduling.",
    svg: `
      <svg viewBox="0 0 256 256" width="256" height="256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M20 0h216c11.046 0 20 8.954 20 20v216c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0ZM64 76.8C29.867 76.8 8.533 93.867 0 128c12.8-17.067 27.733-23.467 44.8-19.2 9.737 2.434 16.697 9.499 24.401 17.318C81.751 138.857 96.275 153.6 128 153.6c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C110.249 91.543 95.725 76.8 64 76.8ZM77.1575 20.9877C77.1436 21.1129 77.0371 21.2066 76.9111 21.2066H63.7746C63.615 21.2066 63.4961 21.3546 63.5377 21.5087C64.1913 23.9314 66.1398 25.3973 68.7994 25.3973C69.6959 25.4161 70.5846 25.2317 71.3968 24.8582C72.1536 24.5102 72.8249 24.0068 73.3659 23.3828C73.4314 23.3073 73.5454 23.2961 73.622 23.3602L76.2631 25.6596C76.3641 25.7476 76.3782 25.8999 76.2915 26.0021C74.697 27.8832 72.1135 29.25 68.5683 29.25C63.1142 29.25 59.0001 25.4731 59.0001 19.7348C59.0001 16.9197 59.9693 14.559 61.5847 12.8921C62.4374 12.0349 63.4597 11.3584 64.5882 10.9043C65.7168 10.4502 66.9281 10.2281 68.1473 10.2517C73.6753 10.2517 77.25 14.1394 77.25 19.5075C77.2431 20.0021 77.2123 20.4961 77.1575 20.9877Z" fill="white" style="fill:white;fill:white;fill-opacity:1;"/>
</svg>
      `,
    url: "https://www.typescriptlang.org/",
    color: "from-[#007ACC] to-[#2F74C0]",
  },
  {
    id: 3,
    name: "Complete Privacy Protection",
    description:
      "Your calendar details stay private. We see only free/busy status - no event details, no participant information, no meeting titles. Your trust is our foundation.",
    svg: `
    <svg
  viewBox="0 0 256 154"
  width="256"
  height="154"
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid"
  >
  <defs
    ><linearGradient x1="-2.778%" y1="32%" x2="100%" y2="67.556%" id="gradient">
      <stop stop-color="#2298BD" offset="0%"></stop>
      <stop stop-color="#0ED7B5" offset="100%"></stop>
    </linearGradient></defs>
  <path
    d="M128 0C93.867 0 72.533 17.067 64 51.2 76.8 34.133 91.733 27.733 108.8 32c9.737 2.434 16.697 9.499 24.401 17.318C145.751 62.057 160.275 76.8 192 76.8c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C174.249 14.743 159.725 0 128 0ZM64 76.8C29.867 76.8 8.533 93.867 0 128c12.8-17.067 27.733-23.467 44.8-19.2 9.737 2.434 16.697 9.499 24.401 17.318C81.751 138.857 96.275 153.6 128 153.6c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C110.249 91.543 95.725 76.8 64 76.8Z" fill="white" style="fill:white;fill:white;fill-opacity:1;"/>
</svg>
    `,
    url: "https://tailwindui.com/",
    color: "from-[#38BDF8] to-[#818CF8]",
  },
  {
    id: 4,
    name: "Professional Network Building",
    description:
      "Every calendar connection represents trust. Build your network naturally through scheduling. Be part of the next evolution in professional networking.",
    svg: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="none" d="M0 0h256v256H0z"/><path fill="none" stroke="#fff" stroke-width="25" stroke-linecap="round" d="M208 128l-80 80M192 40L40 192"/></svg>
    `,
    url: "https://ui.shadcn.com",
    color: "from-[#000000] to-[#3B3B3B]",
  },
  {
    id: 5,
    name: "Early Access Benefits",
    description:
      "Shape the future of scheduling. Get lifetime preferred pricing, priority access to new features, and direct influence on product development. Limited spots available.",
    svg: `<svg width="110" height="32" viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="16.0003" cy="16" rx="4.99998" ry="5" fill="#9785FF" style="fill:#9785FF;fill:color(display-p3 0.5922 0.5216 1.0000);fill-opacity:1;"/>
<path d="M25.0091 27.8382C25.4345 28.2636 25.3918 28.9679 24.8919 29.3027C22.3488 31.0062 19.2899 31.9997 15.9991 31.9997C12.7082 31.9997 9.64935 31.0062 7.10616 29.3027C6.60633 28.9679 6.56361 28.2636 6.98901 27.8382L10.6429 24.1843C10.9732 23.854 11.4855 23.8019 11.9012 24.0148C13.1303 24.6445 14.5232 24.9997 15.9991 24.9997C17.4749 24.9997 18.8678 24.6445 20.0969 24.0148C20.5126 23.8019 21.0249 23.854 21.3552 24.1843L25.0091 27.8382Z" fill="#9785FF" style="fill:#9785FF;fill:color(display-p3 0.5922 0.5216 1.0000);fill-opacity:1;"/>
</svg>`,
    url: "https://clerk.com/",
    color: "from-[#6C47FF] to-[#4F37C8]",
  },
  {
    id: 6,
    name: "Launch Day Access",
    description:
      "Be ready on April 2nd. Get immediate access to all features, start building your network, and experience the future of scheduling before anyone else.",
    svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.0001 2L21.0437 7V17L12.0001 22L2.95654 17V7L12.0001 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 22V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21.0437 7L12.0001 12L2.95654 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.95654 17L12.0001 12L21.0437 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    url: "https://convex.link/rasmicstarter",
    color: "from-[#FF4F00] to-[#FF8A00]",
  },
];

export default function TechStack() {
  return (
    <section className="py-24 px-4">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f35f43] via-[#f35f43] to-[#f7b772] dark:from-[#f35f43] dark:via-[#f35f43] dark:to-[#f7b772] pb-2">
        The Future of Professional Scheduling
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          Join the waitlist today and be part of the next evolution in calendar networking. Launching April 2nd.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {ProjectsData.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              {/* Gradient Background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                <div
                  className={`h-full w-full bg-gradient-to-br ${project.color}`}
                ></div>
              </div>

              <div className="relative z-10">
                {/* Logo and External Link */}
                <div className="flex items-center justify-between mb-4">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <div
                      className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                      dangerouslySetInnerHTML={{ __html: project.svg }}
                    />
                  </div>
                  <Link
                    href={project.url}
                    target="_blank"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>

                {/* Content */}
                <Link href={project.url} target="_blank" className="block">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {project.description}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
