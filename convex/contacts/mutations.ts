import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { api } from "../_generated/api";

// Create a new contact
export const createContact = mutation({
  args: {
    userId: v.string(),
    fullName: v.string(),
    companyName: v.string(),
    role: v.string(),
    email: v.string(),
    senderName: v.string(),
    senderEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check subscription status
    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    // Get current usage
    const usage = await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // If no active subscription or not pro plan and reached limit
    if ((!subscription || subscription.status !== "active") && usage.length >= 3) {
      throw new Error("Free tier limit reached: Maximum 3 contacts. Please upgrade to add more contacts.");
    }

    // Check if contact with this email already exists
    const existingContact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingContact) {
      throw new Error("Contact with this email already exists");
    }

    const now = new Date().toISOString();

    const contactId = await ctx.db.insert("contacts", {
      userId: args.userId,
      fullName: args.fullName,
      companyName: args.companyName,
      role: args.role,
      email: args.email,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      senderName: args.senderName,
      senderEmail: args.senderEmail,
      contactUserId: args.email, // We use email temporarily until they accept
    });

    return contactId;
  },
});

// Update an existing contact
export const updateContact = mutation({
  args: {
    id: v.id("contacts"),
    fullName: v.optional(v.string()),
    companyName: v.optional(v.string()),
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(v.union(v.literal("connected"), v.literal("pending"), v.literal("declined"))),
    senderName: v.optional(v.string()),
    senderEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const updatedFields: Record<string, any> = { ...updates };
    
    // If email is being updated, check for duplicates
    if (updates.email !== undefined) {
      const email = updates.email as string;
      const existingContact = await ctx.db
        .query("contacts")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existingContact && existingContact._id !== id) {
        throw new Error("Contact with this email already exists");
      }
    }

    updatedFields.updatedAt = new Date().toISOString();

    await ctx.db.patch(id, updatedFields);
    return id;
  },
});

// Delete a contact
export const deleteContact = mutation({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Update contact status
export const updateContactStatus = mutation({
  args: {
    id: v.id("contacts"),
    status: v.union(v.literal("connected"), v.literal("pending"), v.literal("declined")),
    contactUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: new Date().toISOString(),
    };

    if (args.contactUserId) {
      updates.contactUserId = args.contactUserId;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Accept contact invitation
export const acceptInvitation = mutation({
  args: {
    invitationId: v.id("contacts"),
    userId: v.string(),
    fullName: v.string(),
    companyName: v.string(),
    role: v.string(),
    email: v.string(),
    senderName: v.optional(v.string()),
    senderEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Update the invitation status to connected
    await ctx.db.patch(args.invitationId, {
      status: "connected",
      updatedAt: new Date().toISOString(),
      contactUserId: args.userId, // Set the actual user ID when they accept
    });

    // Create a reciprocal contact for the accepting user
    const now = new Date().toISOString();
    const contactData: any = {
      userId: args.userId,
      fullName: invitation.senderName || "Unknown",
      companyName: invitation.companyName,
      role: invitation.role,
      email: invitation.senderEmail || invitation.email,
      status: "connected",
      createdAt: now,
      updatedAt: now,
      contactUserId: invitation.userId, // Set the sender's user ID
    };

    // Only add sender info if provided
    if (args.senderName) {
      contactData.senderName = args.senderName;
    }
    if (args.senderEmail) {
      contactData.senderEmail = args.senderEmail;
    }

    await ctx.db.insert("contacts", contactData);
  },
});

// Decline contact invitation
export const declineInvitation = mutation({
  args: {
    invitationId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, {
      status: "declined",
      updatedAt: new Date().toISOString(),
    });
  },
});
