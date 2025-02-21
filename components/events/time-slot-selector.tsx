"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendedTimeSlot } from "@/lib/google-calendar";
import { cn } from "@/lib/utils";

interface TimeSlotSelectorProps {
    recommendedSlots: RecommendedTimeSlot[];
    onSelect: (slot: RecommendedTimeSlot) => void;
    selectedSlot?: RecommendedTimeSlot;
}

export function TimeSlotSelector({
    recommendedSlots,
    onSelect,
    selectedSlot
}: TimeSlotSelectorProps) {
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recommended Time Slots</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedSlots.map((slot, index) => {
                    const isSelected = selectedSlot?.start === slot.start && 
                                     selectedSlot?.end === slot.end;
                    const availableCount = slot.participantAvailability.filter(
                        p => p.available
                    ).length;
                    const totalParticipants = slot.participantAvailability.length;

                    return (
                        <Card 
                            key={index}
                            className={cn(
                                "cursor-pointer transition-colors",
                                isSelected ? "border-primary" : "hover:border-primary/50"
                            )}
                            onClick={() => onSelect(slot)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {formatDate(slot.start)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        {formatTime(slot.start)} - {formatTime(slot.end)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {availableCount}/{totalParticipants} participants available
                                    </div>
                                    {isSelected && (
                                        <Button 
                                            size="sm" 
                                            className="w-full mt-2"
                                            variant="secondary"
                                        >
                                            Selected
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
