"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateEventForm } from "./create-event-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CreateEventDialog() {
    const contacts = useQuery(api.contacts.list) || [];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                        Create a new event and find the best time for all participants.
                    </DialogDescription>
                </DialogHeader>
                <CreateEventForm
                    contacts={contacts.map(contact => ({
                        id: contact._id,
                        fullName: contact.fullName,
                        email: contact.email,
                    }))}
                />
            </DialogContent>
        </Dialog>
    );
}
