"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Doc, Id } from "@/convex/_generated/dataModel";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Contact extends Doc<"contacts"> {
  _id: Id<"contacts">;
  userId: string;
  contactUserId?: string;
  fullName: string;
  companyName: string;
  role: string;
  email: string;
  status: "connected" | "pending" | "declined";
  createdAt: string;
  updatedAt: string;
  senderName: string;
  senderEmail: string;
}

interface DeleteContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
}

export const DeleteContactDialog = ({
  open,
  onOpenChange,
  contact,
}: DeleteContactDialogProps) => {
  const deleteContact = useMutation(api.contacts.mutations.deleteContact);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteContact({
        id: contact._id,
      });
      toast.success("Contact deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete contact");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {contact.fullName}? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
