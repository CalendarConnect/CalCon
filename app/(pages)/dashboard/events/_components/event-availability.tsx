import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, Bug } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { checkParticipantAvailability } from "@/app/services/availability-checker";

interface EventAvailabilityProps {
  eventId: Id<"events">;
}

interface AvailabilitySlot {
  start: string;
  end: string;
}

export function EventAvailability({ eventId }: EventAvailabilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkId, setCheckId] = useState<Id<"tokenChecks"> | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState<{
    success: boolean;
    availableSlots?: AvailabilitySlot[];
    error?: string;
    debugInfo?: any;
  } | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { user } = useUser();

  // Get event details including participants
  const event = useQuery(api.events.queries.getEventById, { eventId: eventId });
  const tokenCheck = useQuery(
    api.events.availability.getTokenCheckResults,
    checkId ? { checkId } : "skip"
  );

  const checkAvailability = useMutation(api.events.availability.checkAvailability);
  const updateTokenResult = useMutation(api.events.availability.updateTokenCheckResult);

  // Effect to check tokens when checkId is set
  useEffect(() => {
    if (!checkId || !tokenCheck || tokenCheck.status === "completed" || !user) return;

    const checkParticipantToken = async (participantId: Id<"contacts">) => {
      try {
        const response = await fetch("/api/calendar/participant-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId }),
        });
        const data = await response.json();

        await updateTokenResult({
          checkId,
          participantId,
          success: data.success,
          error: data.error,
        });
      } catch (error) {
        await updateTokenResult({
          checkId,
          participantId,
          success: false,
          error: "Failed to check token",
        });
      }
    };

    // Check tokens for all participants
    tokenCheck.participantIds.forEach(participantId => {
      checkParticipantToken(participantId);
    });
  }, [checkId, tokenCheck, updateTokenResult, user]);

  // Effect to fetch availability after tokens are all validated
  useEffect(() => {
    if (!tokenCheck || tokenCheck.status !== "completed" || 
        !tokenCheck.results?.every(r => r.success) || 
        isLoadingAvailability || 
        availabilityResults) {
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        // Get all successful participant IDs
        const participantIds = tokenCheck.results
          .filter(r => r.success)
          .map(r => r.participantId);

        // Check availability for the next 30 days
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const result = await checkParticipantAvailability(
          participantIds,
          {
            start: now.toISOString(),
            end: thirtyDaysLater.toISOString(),
          }
        );

        setAvailabilityResults(result);
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailabilityResults({
          success: false,
          error: "Failed to check availability"
        });
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [tokenCheck, availabilityResults, isLoadingAvailability]);

  const handleCheckAvailability = async () => {
    if (!event) return;
    
    // Reset state for new check
    setIsChecking(true);
    setAvailabilityResults(null);
    
    try {
      const result = await checkAvailability({
        eventId,
        timeRange: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      });

      if (result.success) {
        setCheckId(result.checkId);
        setIsOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check participant tokens",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSelectTime = (slot: AvailabilitySlot) => {
    // Here you would implement the logic to select this time slot
    // and notify all participants
    toast({
      title: "Time Selected",
      description: `Selected time: ${new Date(slot.start).toLocaleString()}`,
    });
    setIsOpen(false);
  };

  const formatTimeSlot = (slot: AvailabilitySlot) => {
    const startDate = new Date(slot.start);
    const endDate = new Date(slot.end);
    
    return {
      date: startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
      time: `${startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
             ${endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleCheckAvailability}
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Tokens...
            </>
          ) : (
            "Check Availability"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Participant Token Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add current user first */}
          {user && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {user.fullName || user.primaryEmailAddress?.emailAddress || "You"}
                  {" (You)"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <Badge
                variant="default"
              >
                Token Valid
              </Badge>
            </div>
          )}
          {/* Show other participants */}
          {tokenCheck?.results?.map((result) => {
            const participant = tokenCheck.participants?.find(
              p => p.participantId === result.participantId
            );
            return (
              <div key={result.participantId} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {participant?.contact?.fullName || participant?.contact?.email || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {participant?.contact?.email}
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-500">{result.error}</p>
                  )}
                </div>
                <Badge
                  variant={result.success ? "default" : "destructive"}
                >
                  {result.success ? "Token Valid" : "Token Invalid"}
                </Badge>
              </div>
            );
          })}
          {tokenCheck?.status === "pending" && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Checking tokens...</span>
            </div>
          )}

          {/* Show availability results when token check is completed */}
          {tokenCheck?.status === "completed" && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <h3 className="font-medium text-lg">Available Times</h3>
              {/* Show loading state while fetching availability */}
              {isLoadingAvailability && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Finding available times...</span>
                </div>
              )}
              
              {/* Show availability results */}
              {availabilityResults?.success && availabilityResults.availableSlots?.length ? (
                <div className="space-y-2">
                  {availabilityResults.availableSlots.map((slot, index) => {
                    const { date, time } = formatTimeSlot(slot);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-start gap-3">
                          <div className="pt-1">
                            <Calendar className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{date}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectTime(slot)}
                        >
                          Select
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                availabilityResults?.success && (
                  <div className="text-center py-4">
                    <p>No common available times found.</p>
                    <p className="text-sm text-muted-foreground">Try selecting a different date range.</p>
                  </div>
                )
              )}
              
              {/* Show error message if availability check failed */}
              {availabilityResults?.error && (
                <div className="text-center py-4">
                  <p className="text-red-500">Failed to find available times.</p>
                  <p className="text-sm text-muted-foreground">{availabilityResults.error}</p>
                </div>
              )}
              {/* Show debug information */}
              {availabilityResults?.debugInfo && (
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                  </Button>
                  {showDebug && (
                    <div className="mt-4">
                      <pre>
                        <code>
                          {JSON.stringify(availabilityResults.debugInfo, null, 2)}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
