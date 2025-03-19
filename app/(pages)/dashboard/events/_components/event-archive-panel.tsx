import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";

export const EventArchivePanel = () => {
  const { user } = useUser();
  const events = useQuery(api.events.queries.getEvents, { userId: user?.id || "" });

  // Filter for archived events
  const archivedEvents = events?.filter(event => event.status === "archived") || [];

  return (
    <Card className="h-full border-none shadow-none">
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-base font-semibold">Event Archive</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="space-y-4">
            {archivedEvents.map((event) => {
              const eventDate = new Date(event.selectedDateTime || event._creationTime);
              const isInPast = eventDate < new Date();

              return (
                <div
                  key={event._id}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-medium text-sm text-gray-900 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isInPast
                      ? `${formatDistanceToNow(eventDate)} ago`
                      : formatDistanceToNow(eventDate)}
                  </p>
                </div>
              );
            })}
            {archivedEvents.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No archived events yet
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 