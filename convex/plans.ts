import { mutation, query } from "./_generated/server";

export const getPlans = query({
    handler: async (ctx) => {
        const plans = await ctx.db
            .query("plans").collect()

        return plans;
    },
});

export const insertFreePlan = mutation({
    handler: async (ctx) => {
        // Check if free plan already exists
        const existingFreePlan = await ctx.db
            .query("plans")
            .withIndex("key", (q) => q.eq("key", "free"))
            .unique();

        if (existingFreePlan) {
            return existingFreePlan;
        }

        // Insert the free plan
        const freePlan = await ctx.db.insert("plans", {
            key: "free",
            name: "Free Plan",
            description: "Perfect for individuals and small teams getting started.",
            polarProductId: process.env.POLAR_FREE_PRODUCT_ID!, // Make sure this env var exists
            prices: {
                month: {
                    usd: {
                        amount: 0,
                        polarId: process.env.POLAR_FREE_PRICE_ID!, // Make sure this env var exists
                    }
                }
            }
        });

        return freePlan;
    },
});
