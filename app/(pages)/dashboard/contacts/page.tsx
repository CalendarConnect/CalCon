"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useState, useEffect } from "react";
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
import { 
  Plus, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  UserCircle, 
  PencilLine, 
  Trash2, 
  Users, 
  Building,
  Mail,
  MessageCircle,
  Filter,
  ChevronDown,
  Clock,
  Calendar 
} from "lucide-react";
import { toast } from "sonner";
import { AddContactDialog } from "./_components/add-contact-dialog";
import { EditContactDialog } from "./_components/edit-contact-dialog";
import { DeleteContactDialog } from "./_components/delete-contact-dialog";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const contacts = useQuery(api.contacts.queries.getContacts, {
    userId: user?.id || "",
  }) as Contact[] | undefined;

  const incomingInvitations = useQuery(api.contacts.queries.getIncomingInvitationsV2, {
    userEmail: user?.emailAddresses[0]?.emailAddress || "",
  }) as Contact[] | undefined;

  const acceptInvitation = useMutation(api.contacts.mutations.acceptInvitation);
  const declineInvitation = useMutation(api.contacts.mutations.declineInvitation);

  // Filter contacts based on search query and status filter
  const filteredContacts = contacts?.filter((contact) => {
    const matchesSearch = 
      searchQuery === "" || 
      contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === null || contact.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-600 border border-emerald-200/50";
      case "pending":
        return "bg-gradient-to-r from-amber-50 to-orange-50 text-orange-600 border border-orange-200/50";
      case "declined":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-rose-600 border border-rose-200/50";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200/50";
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
      toast.success("Invitation accepted successfully", {
        style: { 
          borderRadius: "16px", 
          background: "linear-gradient(to right, #f7fee7, #ecfccb)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(163, 230, 53, 0.2)"
        }
      });
    } catch (error) {
      toast.error("Failed to accept invitation", {
        style: { 
          borderRadius: "16px", 
          background: "linear-gradient(to right, #fff0f0, #fff5f5)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(252, 165, 165, 0.2)"
        }
      });
    }
  };

  const handleDeclineInvitation = async (invitation: Contact) => {
    try {
      await declineInvitation({
        invitationId: invitation._id,
      });
      toast.success("Invitation declined", {
        style: { 
          borderRadius: "16px", 
          background: "linear-gradient(to right, #f7fee7, #ecfccb)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(163, 230, 53, 0.2)"
        }
      });
    } catch (error) {
      toast.error("Failed to decline invitation", {
        style: { 
          borderRadius: "16px", 
          background: "linear-gradient(to right, #fff0f0, #fff5f5)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(252, 165, 165, 0.2)"
        }
      });
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
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Contacts</h1>
            <p className="text-base text-gray-500">
              Loading your contacts and invitations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 max-w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Contacts</h1>
          <p className="text-base text-gray-500">
            Manage your connections and invitations to schedule meetings together.
          </p>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-gray-200 rounded-xl focus:border-orange-500 focus:ring-0"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Button
                variant="outline"
                className={cn(
                  "h-11 px-4 rounded-xl border-gray-200 flex items-center gap-2",
                  activeFilter ? "bg-orange-50 text-orange-600 border-orange-200" : "text-gray-700"
                )}
                onClick={() => setActiveFilter(activeFilter ? null : "connected")}
              >
                <Filter className="h-4 w-4" />
                {activeFilter || "All contacts"}
                <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
              </Button>
              {activeFilter && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-orange-500 border-orange-500 text-white"
                  onClick={() => setActiveFilter(null)}
                >
                  {filteredContacts?.length}
                </Badge>
              )}
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Contact</span>
            </Button>
          </div>
        </div>

        {/* Incoming Invitations */}
        {incomingInvitations && incomingInvitations.length > 0 && (
          <Card className="mb-6 border-0 rounded-2xl overflow-hidden shadow-md">
            <CardHeader className="px-6 py-5 bg-gradient-to-r from-orange-500/5 to-orange-600/5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                  <span>Incoming Invitations</span>
                  <Badge className="ml-2 bg-orange-100 text-orange-600 border-orange-200 border h-5 px-1.5 text-[10px]">
                    {incomingInvitations.length}
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[320px]">
                <div className="space-y-0 divide-y divide-gray-100">
                  {incomingInvitations.map((invitation, index) => (
                    <motion.div 
                      key={invitation._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="p-5 hover:bg-orange-50/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-gray-100">
                          <AvatarFallback className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600">
                            {(invitation.senderName || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{invitation.senderName}</h3>
                              <div className="mt-1 flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Building className="h-3 w-3" />
                                  <span>{invitation.companyName || "Unknown company"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <UserCircle className="h-3 w-3" />
                                  <span>{invitation.role || "Unknown role"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  <span>{invitation.senderEmail}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(invitation.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`px-2 py-1 text-xs ${getStatusBadgeStyle(invitation.status)}`}>
                                {invitation.status}
                              </Badge>
                              {invitation.status === "pending" && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAcceptInvitation(invitation)}
                                    className="h-8 w-8 p-0 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeclineInvitation(invitation)}
                                    className="h-8 w-8 p-0 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Contact List */}
        <Card className="border-0 rounded-2xl overflow-hidden shadow-md">
          <CardHeader className="px-6 py-5 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span>All Contacts</span>
                <Badge className="ml-2 bg-gray-100 text-gray-600 border-gray-200 border h-5 px-1.5 text-[10px]">
                  {filteredContacts?.length}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredContacts && filteredContacts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContacts.map((contact, index) => (
                      <motion.tr 
                        key={contact._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-gray-100">
                              <AvatarFallback className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600">
                                {contact.fullName[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-800">{contact.fullName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{contact.companyName}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{contact.role}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{contact.email}</td>
                        <td className="py-4 px-6">
                          <Badge className={`px-2 py-1 text-xs ${getStatusBadgeStyle(contact.status)}`}>
                            {contact.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(contact)}
                              className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(contact)}
                              className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {contact.status === "connected" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  {searchQuery ? 
                    "No contacts match your search criteria. Try a different search term." : 
                    "You haven't added any contacts yet. Add your first contact to get started."
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-10 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
    </div>
  );
}