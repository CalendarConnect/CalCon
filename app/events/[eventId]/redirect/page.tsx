"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function EventRedirectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const createParticipantTrial = useMutation(api.subscriptions.createParticipantTrial);

  useEffect(() => {
    const setupTrial = async () => {
      if (!isLoaded || !user) return;

      try {
        await createParticipantTrial();
        router.push("/dashboard/events");
      } catch (error) {
        console.error("Failed to setup trial:", error);
        router.push("/");
      }
    };

    setupTrial();
  }, [user, isLoaded, createParticipantTrial, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Setting up your account...</h1>
        <p className="text-gray-600">Just a moment while we get everything ready.</p>
      </div>
    </div>
  );
}
