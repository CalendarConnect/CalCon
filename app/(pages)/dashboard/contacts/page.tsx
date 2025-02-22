"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AddContactDialog } from "./_components/add-contact-dialog";
import { EditContactDialog } from "./_components/edit-contact-dialog";
import { DeleteContactDialog } from "./_components/delete-contact-dialog";
import { Doc, Id } from "@/convex/_generated/dataModel";

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
  senderName?: string;
  senderEmail?: string;
}

export default function ContactsPage() {
  const { user } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const contacts = useQuery(api.contacts.queries.getContacts, {
    userId: user?.id || "",
  }) as Contact[] | undefined;

  const incomingInvitations = useQuery(api.contacts.queries.getIncomingInvitationsV2, {
    userEmail: user?.emailAddresses[0]?.emailAddress || "",
  }) as Contact[] | undefined;

  const acceptInvitation = useMutation(api.contacts.mutations.acceptInvitation);
  const declineInvitation = useMutation(api.contacts.mutations.declineInvitation);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-blue-600 text-white hover:bg-blue-600";
      case "pending":
        return "bg-yellow-500 text-white";
      case "declined":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleAcceptInvitation = async (invitation: Contact) => {
    try {
      await acceptInvitation({
        invitationId: invitation._id,
        userId: user?.id || "",
        fullName: user?.fullName || "",
        companyName: "",
        role: "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        senderName: user?.fullName || "",
        senderEmail: user?.emailAddresses[0]?.emailAddress || "",
      });
      toast.success("Invitation accepted");
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (invitation: Contact) => {
    try {
      await declineInvitation({
        invitationId: invitation._id,
      });
      toast.success("Invitation declined");
    } catch (error) {
      toast.error("Failed to decline invitation");
    }
  };

  const handleEdit = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  }, []);

  if (!contacts) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {incomingInvitations && incomingInvitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Incoming Invitations</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingInvitations.map((invitation) => (
                  <TableRow key={invitation._id}>
                    <TableCell>{invitation.senderName}</TableCell>
                    <TableCell>{invitation.companyName}</TableCell>
                    <TableCell>{invitation.role}</TableCell>
                    <TableCell>{invitation.senderEmail}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(invitation.status)}>
                        {invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {invitation.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptInvitation(invitation)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeclineInvitation(invitation)}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact._id}>
                <TableCell>{contact.fullName}</TableCell>
                <TableCell>{contact.companyName}</TableCell>
                <TableCell>{contact.role}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(contact.status)}>
                    {contact.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contact)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddContactDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      
      {selectedContact && (
        <>
          <EditContactDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            contact={selectedContact}
          />
          <DeleteContactDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            contact={selectedContact}
          />
        </>
      )}
    </div>
  );
}