"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TimeSlotSelector } from "./time-slot-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendedTimeSlot } from "@/lib/google-calendar";
import { format } from "date-fns";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    location: z.string(),
    duration: z.string(),
    participantIds: z.array(z.string()).min(1, "At least one participant is required"),
    startDate: z.string(),
    endDate: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEventFormProps {
    contacts: Array<{
        id: string;
        fullName: string;
        email: string;
    }>;
}

export function CreateEventForm({ contacts }: CreateEventFormProps) {
    const [step, setStep] = useState<"details" | "timeSlot">("details");
    const [recommendedSlots, setRecommendedSlots] = useState<RecommendedTimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<RecommendedTimeSlot>();
    const [loading, setLoading] = useState(false);

    const getRecommendedTimeSlots = useMutation(api.events.googleCalendar.getRecommendedTimeSlots);
    const selectTimeSlot = useMutation(api.events.googleCalendar.selectTimeSlot);
    const createEvent = useMutation(api.events.create);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            duration: "30",
            participantIds: [],
            startDate: format(new Date(), "yyyy-MM-dd"),
            endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true);

            // Create the event
            const eventId = await createEvent({
                ...values,
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            // Get recommended time slots
            const slots = await getRecommendedTimeSlots({
                eventId,
                startDate: values.startDate,
                endDate: values.endDate,
            });

            setRecommendedSlots(slots);
            setStep("timeSlot");
        } catch (error) {
            console.error("Failed to create event:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeSlotSelect = async (slot: RecommendedTimeSlot) => {
        setSelectedSlot(slot);
    };

    const handleConfirmTimeSlot = async () => {
        if (!selectedSlot) return;

        try {
            setLoading(true);
            await selectTimeSlot({
                eventId: form.getValues("eventId"),
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
            });
        } catch (error) {
            console.error("Failed to select time slot:", error);
        } finally {
            setLoading(false);
        }
    };

    if (step === "timeSlot") {
        return (
            <div className="space-y-6">
                <TimeSlotSelector
                    recommendedSlots={recommendedSlots}
                    onSelect={handleTimeSlotSelect}
                    selectedSlot={selectedSlot}
                />
                <div className="flex justify-end space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => setStep("details")}
                        disabled={loading}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleConfirmTimeSlot}
                        disabled={!selectedSlot || loading}
                    >
                        {loading ? "Confirming..." : "Confirm Time Slot"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Find Available Times"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
