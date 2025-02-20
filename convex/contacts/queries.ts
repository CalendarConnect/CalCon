import { v } from "convex/values";
import { query } from "../_generated/server";

// Get all contacts for the current user
export const getContacts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return contacts;
  },
});

// Get a contact by email
export const getContactByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return contact;
  },
});

// Get incoming contact invitations for the current user
export const getIncomingInvitationsV2 = query({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("contacts")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return invitations;
  },
});
