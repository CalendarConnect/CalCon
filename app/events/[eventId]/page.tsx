"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useUser, SignUpButton, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { Calendar, Clock, MapPin, Sparkles, Users, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventPage({ params }: EventPageProps) {
  const resolvedParams = use(params);
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const event = useQuery(api.events.queries.getEventById, {
    eventId: resolvedParams.eventId as Id<"events">,
  });

  const eventCreator = useQuery(
    api.users.getUserByToken,
    {
      tokenIdentifier: event?.userId || "",
    },
    {
      enabled: !!event?.userId
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return <Skeleton />;
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <p className="text-gray-600">This event may have been deleted or does not exist.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Join {event.title}</CardTitle>
            <CardDescription>
              Create your free account to find the best time to meet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create your free account to:
              <ul className="list-disc list-inside mt-2">
                <li>Schedule up to 3 events</li>
                <li>Add up to 3 contacts</li>
                <li>Upgrade anytime for unlimited access</li>
              </ul>
            </p>
            <div className="flex justify-center">
              <SignUpButton mode="modal" redirectUrl={`/events/${resolvedParams.eventId}`}>
                <Button size="lg">
                  Create Account
                </Button>
              </SignUpButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-white">
      {/* Background pattern and gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white">
        {/* Background image */}
        <div 
          className="absolute inset-0 -z-10" 
          style={{
            backgroundImage: 'url("/background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4
          }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_48px]" />
        {/* Gradient */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 -z-10 m-auto h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-400 to-blue-300 opacity-20 blur-[100px]" />
      </div>

      <motion.div 
        className="space-y-6 text-center max-w-3xl -mt-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Pill badge */}
        <motion.div
          variants={itemVariants}
          className="mx-auto w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-1"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
            <Sparkles className="h-4 w-4" />
            <span>Goodbye back and forth mails, hello meeting time</span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 leading-relaxed"
        >
          You have been invited by {eventCreator?.name || "Someone"}
          <br />
          to find the best time for your meeting together
        </motion.h1>

        {/* CTA Button */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center pt-4"
        >
          <SignUpButton 
            mode="modal"
            redirectUrl={`/event-signup/${resolvedParams.eventId}`}
          >
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-6 h-auto text-lg"
            >
              Find the Perfect Time
            </Button>
          </SignUpButton>
        </motion.div>

        {/* Event Details Card */}
        <motion.div
          variants={itemVariants}
          className="mt-12"
        >
          <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Title:</span> {event.title}
              </div>
              {event.description && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Description:</span> {event.description}
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Duration:</span> {event.duration} minutes
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Location:</span> {event.location}
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="pt-1">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Attendees:</span>
                    <ul className="mt-1 space-y-1">
                      <li className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Host</Badge>
                        {eventCreator?.name || "Loading..."}
                      </li>
                      <li className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">You</Badge>
                        Pending Response
                      </li>
                      {event.participants?.map((participant, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-gray-100">Invited</Badge>
                          {participant.name || participant.email}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}
