'use server';

import { Id } from "@/convex/_generated/dataModel";
import { getGoogleCalendarToken } from "@/app/actions/google-calendar";

interface AvailabilityCheckResponse {
  success: boolean;
  availableSlots?: {
    start: string;
    end: string;
  }[];
  error?: string;
  debugInfo?: any; 
}

interface TimeRange {
  start: string;
  end: string;
}

interface CalendarBusyPeriod {
  start: string;
  end: string;
}

export async function checkParticipantAvailability(
  participantIds: Id<"contacts">[],
  timeRange: TimeRange
): Promise<AvailabilityCheckResponse> {
  const debugInfo: any = {
    steps: [],
    errors: []
  };
  
  try {
    debugInfo.steps.push('Getting creator token');
    const creatorTokenResponse = await getGoogleCalendarToken();
    if (!creatorTokenResponse.success || !creatorTokenResponse.token) {
      debugInfo.errors.push({ step: 'creator token', error: creatorTokenResponse.error });
      return {
        success: false,
        error: "Failed to get creator's calendar access token",
        debugInfo
      };
    }
    
    debugInfo.steps.push('Getting participant tokens');
    
    const participantTokenPromises = participantIds.map(async (participantId) => {
      try {
        // Use absolute URLs to avoid issues with relative paths
        const apiUrl = '/api/calendar/participant-token';
        debugInfo.steps.push(`Fetching token for participant ${participantId} using ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          debugInfo.errors.push({ 
            participant: participantId, 
            status: response.status, 
            statusText: response.statusText,
            errorText 
          });
          return {
            participantId,
            token: null,
            success: false,
            error: `API error: ${response.status} ${response.statusText}`
          };
        }
        
        const data = await response.json();
        return {
          participantId,
          token: data.success ? data.token : null,
          success: data.success,
          error: data.error
        };
      } catch (error) {
        debugInfo.errors.push({ participant: participantId, error: error instanceof Error ? error.message : String(error) });
        return {
          participantId,
          token: null,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    const participantTokens = await Promise.all(participantTokenPromises);
    
    debugInfo.tokenResults = participantTokens.map(p => ({
      participantId: p.participantId,
      success: p.success,
      error: p.error
    }));
    
    const failedTokens = participantTokens.filter(p => !p.success);
    if (failedTokens.length > 0) {
      const errors = failedTokens.map(p => `Participant ${p.participantId}: ${p.error}`).join(', ');
      debugInfo.errors.push({ step: 'token validation', errors });
      return {
        success: false,
        error: `Failed to retrieve tokens for some participants: ${errors}`,
        debugInfo
      };
    }
    
    debugInfo.steps.push('Querying calendars');
    
    const availabilityPromises = [
      queryCalendar(creatorTokenResponse.token, timeRange, debugInfo, 'creator'),
      ...participantTokens.map(p => queryCalendar(p.token, timeRange, debugInfo, p.participantId))
    ];
    
    const availabilityResults = await Promise.all(availabilityPromises);
    debugInfo.availabilityResultsCount = availabilityResults.length;
    
    debugInfo.steps.push('Finding common availability');
    const allBusyPeriods = availabilityResults;
    const initialAvailableSlot = [{ start: timeRange.start, end: timeRange.end }];
    const commonAvailability = findCommonAvailability(allBusyPeriods, timeRange);
    
    debugInfo.steps.push('Selecting best time slots');
    const bestTimeSlots = selectBestTimeSlots(commonAvailability, 3);
    
    if (bestTimeSlots.length === 0) {
      debugInfo.errors.push({ step: 'finding slots', error: 'No common available slots found' });
      return {
        success: false,
        error: "No common available time slots found",
        debugInfo
      };
    }
    
    return {
      success: true,
      availableSlots: bestTimeSlots,
      debugInfo
    };
  } catch (error) {
    debugInfo.errors.push({ step: 'overall process', error: error instanceof Error ? error.message : String(error) });
    console.error("Error checking availability:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      debugInfo
    };
  }
}

async function queryCalendar(token: string, timeRange: TimeRange, debugInfo: any, participantId: any): Promise<CalendarBusyPeriod[]> {
  try {
    // Use absolute URLs to avoid issues with relative paths
    const apiUrl = '/api/calendar/freebusy';
    debugInfo.steps.push(`Querying calendar for ${participantId} using ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        timeMin: timeRange.start,
        timeMax: timeRange.end,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      debugInfo.errors.push({ 
        participant: participantId, 
        status: response.status, 
        statusText: response.statusText,
        errorText 
      });
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.busyPeriods : [];
  } catch (error) {
    debugInfo.errors.push({ 
      participant: participantId, 
      step: 'calendar query', 
      error: error instanceof Error ? error.message : String(error) 
    });
    console.error('Error querying calendar:', error);
    return [];
  }
}

function findCommonAvailability(
  allBusyPeriods: Array<CalendarBusyPeriod[]>,
  timeRange: TimeRange
): CalendarBusyPeriod[] {
  let availableSlots = [{ start: timeRange.start, end: timeRange.end }];

  allBusyPeriods.forEach(personBusyPeriods => {
    availableSlots = subtractBusyPeriods(availableSlots, personBusyPeriods);
  });

  return availableSlots;
}

function subtractBusyPeriods(
  availableSlots: CalendarBusyPeriod[],
  busyPeriods: CalendarBusyPeriod[]
): CalendarBusyPeriod[] {
  let result: CalendarBusyPeriod[] = [...availableSlots];

  for (const busy of busyPeriods) {
    const busyStart = new Date(busy.start).getTime();
    const busyEnd = new Date(busy.end).getTime();
    
    const newResult: CalendarBusyPeriod[] = [];
    
    for (const slot of result) {
      const slotStart = new Date(slot.start).getTime();
      const slotEnd = new Date(slot.end).getTime();
      
      if (busyEnd <= slotStart || busyStart >= slotEnd) {
        newResult.push(slot);
        continue;
      }
      
      if (busyStart <= slotStart && busyEnd >= slotEnd) {
        continue; 
      }
      
      if (busyStart > slotStart && busyEnd < slotEnd) {
        newResult.push({ start: slot.start, end: busy.start });
        newResult.push({ start: busy.end, end: slot.end });
        continue;
      }
      
      if (busyStart <= slotStart && busyEnd < slotEnd) {
        newResult.push({ start: busy.end, end: slot.end });
        continue;
      }
      
      if (busyStart > slotStart && busyEnd >= slotEnd) {
        newResult.push({ start: slot.start, end: busy.start });
        continue;
      }
    }
    
    result = newResult;
  }

  return result;
}

function selectBestTimeSlots(
  availableSlots: CalendarBusyPeriod[],
  count: number
): CalendarBusyPeriod[] {
  const validSlots = availableSlots.filter(slot => {
    const duration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
    return duration >= 30 * 60 * 1000; 
  });

  const sortedSlots = validSlots.sort((a, b) => {
    const aDate = new Date(a.start);
    const bDate = new Date(b.start);
    
    const aWeekday = aDate.getDay() >= 1 && aDate.getDay() <= 5;
    const bWeekday = bDate.getDay() >= 1 && bDate.getDay() <= 5;
    if (aWeekday !== bWeekday) return aWeekday ? -1 : 1;
    
    const aHour = aDate.getHours();
    const bHour = bDate.getHours();
    const aWorkHours = aHour >= 9 && aHour < 17;
    const bWorkHours = bHour >= 9 && bHour < 17;
    if (aWorkHours !== bWorkHours) return aWorkHours ? -1 : 1;
    
    return aDate.getTime() - bDate.getTime();
  });

  return sortedSlots.slice(0, count);
}
