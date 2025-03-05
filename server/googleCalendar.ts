"use server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { google, calendar_v3 } from "googleapis";
import { addDays } from "date-fns";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

// Types based on your Convex schema
type Event = {
  userId: string; // Creator's user ID
  title: string;
  description: string;
  location: string;
  duration: string; // Duration in minutes
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

type EventParticipant = {
  eventId: Id<"events">;
  participantId: Id<"contacts">;
  status: "pending" | "accepted" | "declined";
  updatedAt: string;
};

interface Participant {
  clerkUserId: string;
}

interface EventDetails {
  eventId: Id<"events">;
  creator: Participant;
  participants: Participant[];
  timezone: string;
  duration: string;
}

interface TimeSlot {
  start: string;
  end: string;
  participantAvailability: {
    [participantId: string]: {
      available: boolean;
      conflicts?: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

// Convert duration string to minutes
function durationToMinutes(duration: string): number {
  const durationMap: { [key: string]: number } = {
    "15": 15,
    "30": 30,
    "45": 45,
    "1 hour": 60,
    "2 hours": 120,
    "3 hours": 180
  };
  
  const minutes = durationMap[duration];
  if (!minutes) {
    console.warn("[Calendar] Unknown duration format:", duration, "defaulting to 60 minutes");
    return 60;
  }
  return minutes;
}

// Initialize the Google Calendar API client
const calendar = google.calendar('v3');

async function getOAuthClient() {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const response = await clerk.users.getUserOauthAccessToken(
      userId,
      "oauth_google"
    );

    const token = response.data[0];
    if (!token?.token) {
      throw new Error("No OAuth token found");
    }

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL
    );

    client.setCredentials({ access_token: token.token });
    return client;
  } catch (error) {
    console.error("[Calendar] Error getting OAuth client:", error);
    throw error;
  }
}

function isBusinessHour(date: Date): boolean {
  const hours = date.getHours();
  return hours >= 9 && hours < 17; // 9 AM to 5 PM
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
}

function getNextBusinessHourStart(date: Date): Date {
  const next = new Date(date);
  // Round to nearest 15 minutes
  next.setMinutes(Math.floor(next.getMinutes() / 15) * 15);
  next.setSeconds(0);
  next.setMilliseconds(0);

  // If outside business hours, move to next day at 9 AM
  if (next.getHours() >= 17) {
    next.setDate(next.getDate() + 1);
    next.setHours(9);
    next.setMinutes(0);
  } else if (next.getHours() < 9) {
    next.setHours(9);
    next.setMinutes(0);
  }

  // If it's weekend, move to Monday
  while (!isWeekday(next)) {
    next.setDate(next.getDate() + 1);
    next.setHours(9);
    next.setMinutes(0);
  }

  return next;
}

async function checkAvailability(eventDetails: EventDetails): Promise<TimeSlot[]> {
  const { eventId, creator, participants, timezone, duration } = eventDetails;
  console.log("[Calendar] ========== Starting Availability Check ==========");
  console.log("[Calendar] Event ID:", eventId);
  console.log("[Calendar] Creator:", creator);
  console.log("[Calendar] Participants:", participants);
  console.log("[Calendar] Timezone:", timezone);
  console.log("[Calendar] Duration:", duration);

  const allParticipants = [creator, ...participants];
  console.log("[Calendar] Total participants:", allParticipants.length);

  // Get emails for all participants
  const participantEmails = await Promise.all(
    allParticipants.map(async (p) => {
      try {
        console.log("[Calendar] Fetching user details for:", p.clerkUserId);
        const user = await clerk.users.getUser(p.clerkUserId);
        if (!user.primaryEmailAddress?.emailAddress) {
          console.warn(`[Calendar] ⚠️ No email found for user ${p.clerkUserId}`);
          return null;
        }
        console.log(`[Calendar] ✓ Found email for ${p.clerkUserId}: ${user.primaryEmailAddress.emailAddress}`);
        return {
          clerkUserId: p.clerkUserId,
          email: user.primaryEmailAddress.emailAddress
        };
      } catch (error) {
        console.error(`[Calendar] ❌ Error fetching user ${p.clerkUserId}:`, error);
        return null;
      }
    })
  );

  const validParticipants = participantEmails.filter((p): p is { clerkUserId: string; email: string } => p !== null);
  if (validParticipants.length === 0) {
    console.error("[Calendar] ❌ No valid participants found with email addresses");
    throw new Error("No valid participants with email addresses found");
  }
  console.log("[Calendar] Valid participants with emails:", validParticipants);

  // Create dates in the correct timezone and handle end-of-day
  const now = new Date();
  const localNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  // If it's past business hours (5 PM), start from next business day
  const timeMin = new Date(localNow);
  if (localNow.getHours() >= 17) {
    timeMin.setDate(timeMin.getDate() + 1);
  }
  timeMin.setHours(9, 0, 0, 0); // Start at 9 AM
  
  // If it's a weekend, move to next Monday
  while (!isWeekday(timeMin)) {
    timeMin.setDate(timeMin.getDate() + 1);
  }

  const timeMax = addDays(timeMin, 7); // Changed from 14 to 7 days (one week)
  
  console.log("[Calendar] Search window:", {
    startDate: timeMin.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    endDate: timeMax.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    timezone: timezone
  });
  
  console.log("[Calendar] Search period:", {
    from: timeMin.toLocaleString('en-US', { timeZone: timezone }),
    to: timeMax.toLocaleString('en-US', { timeZone: timezone })
  });

  try {
    console.log("[Calendar] Getting OAuth client...");
    const oAuthClient = await getOAuthClient();
    console.log("[Calendar] ✓ OAuth client obtained");
    
    const calendar = google.calendar('v3');
    
    // Force fresh data with no caching
    console.log("[Calendar] Querying FreeBusy API for participants:", 
      validParticipants.map(p => p.email).join(", ")
    );

    const freeBusy = await calendar.freebusy.query({
      auth: oAuthClient,
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: timezone,
        items: validParticipants.map(p => ({ id: p.email })),
        groupExpansionMax: 100,
        calendarExpansionMax: 100
      }
    });

    console.log("[Calendar] FreeBusy API Response:", JSON.stringify(freeBusy.data, null, 2));

    const calendars = freeBusy.data.calendars || {};
    const busyPeriods = Object.entries(calendars).flatMap(([email, data]) => {
      const participant = validParticipants.find(p => p.email === email);
      if (!participant || !data?.busy) {
        console.log(`[Calendar] No busy periods found for ${email}`);
        return [];
      }

      console.log(`[Calendar] Found ${data.busy.length} busy periods for ${email}`);
      return data.busy.map(period => ({
        start: new Date(period.start || '').toLocaleString('en-US', { timeZone: timezone }),
        end: new Date(period.end || '').toLocaleString('en-US', { timeZone: timezone }),
        participantId: participant.clerkUserId
      }));
    });

    if (busyPeriods.length === 0) {
      console.log("[Calendar] ⚠️ No busy periods found for any participant");
    } else {
      console.log("[Calendar] Total busy periods found:", busyPeriods.length);
    }

    // Find available slots with improved conflict detection
    const availableSlots = findAvailableSlots(busyPeriods, timeMin, timeMax, durationToMinutes(duration), timezone);
    console.log("[Calendar] ========== Final Results ==========");
    console.log("[Calendar] Found available slots:", availableSlots.length);
    availableSlots.forEach((slot, index) => {
      console.log(`[Calendar] Slot ${index + 1}:`, {
        start: slot.start,
        end: slot.end,
        participantAvailability: Object.entries(slot.participantAvailability).map(([id, status]) => ({
          participantId: id,
          available: status.available
        }))
      });
    });

    return availableSlots.slice(0, 3);
  } catch (error) {
    console.error("[Calendar] ❌ Error checking availability:", error);
    throw error;
  }
}

function findAvailableSlots(
  busyPeriods: Array<{ start: string; end: string; participantId?: string }>,
  start: Date,
  end: Date,
  duration: number,
  timezone: string
): TimeSlot[] {
  console.log("[Calendar] Finding available slots with duration:", duration, "minutes");
  console.log("[Calendar] Search period:", {
    start: start.toLocaleString('en-US', { timeZone: timezone }),
    end: end.toLocaleString('en-US', { timeZone: timezone })
  });
  
  const availableSlots: TimeSlot[] = [];
  let currentTime = new Date(start);
  const durationMs = duration * 60000;
  let datesChecked = new Set<string>();

  // Convert busy periods to the target timezone and group by participantId
  const participantBusyPeriods = new Map<string, Array<{ start: Date; end: Date }>>();
  
  busyPeriods.forEach(busy => {
    if (!busy.participantId) return;
    
    const periods = participantBusyPeriods.get(busy.participantId) || [];
    periods.push({
      start: new Date(new Date(busy.start).toLocaleString('en-US', { timeZone: timezone })),
      end: new Date(new Date(busy.end).toLocaleString('en-US', { timeZone: timezone }))
    });
    participantBusyPeriods.set(busy.participantId, periods);
  });

  // Get unique participant IDs to know how many participants we're checking
  const totalParticipants = new Set(busyPeriods.map(b => b.participantId)).size;
  console.log("[Calendar] Total unique participants:", totalParticipants);

  // Ensure we're starting at a valid business hour
  currentTime = getNextBusinessHourStart(currentTime);
  console.log("[Calendar] Starting search from:", currentTime.toLocaleString('en-US', { timeZone: timezone }));

  while (currentTime < end && availableSlots.length < 3) {
    // All times are now in the target timezone
    if (!isBusinessHour(currentTime) || !isWeekday(currentTime)) {
      currentTime = getNextBusinessHourStart(new Date(currentTime.getTime() + durationMs));
      continue;
    }

    const dateString = currentTime.toISOString().split('T')[0];
    
    if (datesChecked.has(dateString)) {
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(9, 0, 0, 0);
      continue;
    }

    const slotEnd = new Date(currentTime.getTime() + durationMs);
    
    // Track conflicts per participant
    let hasAnyConflict = false;
    const participantAvailability: { [key: string]: { available: boolean; conflicts?: Array<{ start: string; end: string }> } } = {};

    // Check conflicts for each participant
    participantBusyPeriods.forEach((periods, participantId) => {
      const conflicts: Array<{ start: string; end: string }> = [];
      
      const hasConflict = periods.some(busy => {
        const slotStartTime = currentTime.getTime();
        const slotEndTime = slotEnd.getTime();
        const busyStartTime = busy.start.getTime();
        const busyEndTime = busy.end.getTime();

        const hasOverlap = (slotStartTime < busyEndTime && slotEndTime > busyStartTime);
        
        if (hasOverlap) {
          console.log("[Calendar] Conflict detected for participant:", participantId, {
            proposed: {
              start: currentTime.toLocaleString('en-US', { timeZone: timezone }),
              end: slotEnd.toLocaleString('en-US', { timeZone: timezone })
            },
            busy: {
              start: busy.start.toLocaleString('en-US', { timeZone: timezone }),
              end: busy.end.toLocaleString('en-US', { timeZone: timezone })
            }
          });
          
          conflicts.push({
            start: busy.start.toLocaleString('en-US', { timeZone: timezone }),
            end: busy.end.toLocaleString('en-US', { timeZone: timezone })
          });
          
          hasAnyConflict = true;
        }
        
        return hasOverlap;
      });

      participantAvailability[participantId] = {
        available: !hasConflict,
        ...(hasConflict && { conflicts })
      };
    });

    // A slot is only available if NO participants have ANY conflicts
    const isSlotAvailable = !hasAnyConflict;

    if (isSlotAvailable && slotEnd.getHours() < 17) {
      // Format the slot times in the target timezone
      const slot = {
        start: currentTime.toLocaleString('en-US', { timeZone: timezone }),
        end: slotEnd.toLocaleString('en-US', { timeZone: timezone }),
        participantAvailability
      };
      
      console.log("[Calendar] Found available slot with ALL participants available:", {
        ...slot,
        participantAvailability: Object.entries(participantAvailability).map(([id, status]) => ({
          participantId: id,
          available: status.available
        }))
      });
      
      availableSlots.push(slot);
      datesChecked.add(dateString);
      
      // Move to next day
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(9, 0, 0, 0);
    } else {
      if (hasAnyConflict) {
        console.log("[Calendar] Slot rejected due to conflicts:", {
          totalParticipants,
          allParticipantsAvailable: false,
          participantAvailability: Object.entries(participantAvailability).map(([id, status]) => ({
            participantId: id,
            available: status.available,
            conflicts: status.conflicts
          }))
        });
      }
      // Move to next 15-minute slot
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }
  }

  return availableSlots;
}

export async function findCommonAvailability(eventDetails: EventDetails) {
  try {
    const availableSlots = await checkAvailability(eventDetails);
    return availableSlots;
  } catch (error) {
    console.error("Error finding common availability:", error);
    throw error;
  }
}

// Example usage (you would call this from your application code)
async function exampleUsage() {
  const eventDetails: EventDetails = {
    eventId: "your_event_id_here" as Id<"events">, // This should be a valid Convex ID for the event
    creator: { clerkUserId: 'creator_id' },
    participants: [
      { clerkUserId: 'participant1_id' },
      { clerkUserId: 'participant2_id' }
    ],
    timezone: 'America/New_York',
    duration: "1 hour"
  };

  try {
    const availableSlots = await findCommonAvailability(eventDetails);
    console.log("Available slots:", availableSlots);
  } catch (error) {
    console.error("Error:", error);
  }
}
