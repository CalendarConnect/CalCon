import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const { email } = args;
    
    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (existing) {
      return existing._id;
    }

    // Add new email to waitlist
    const id = await ctx.db.insert("waitlist", {
      email,
      createdAt: new Date().toISOString(),
    });

    return id;
  },
}); 