import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
    action,
    httpAction,
    internalQuery,
    mutation,
    query
} from "./_generated/server";
import schema from "./schema";

// Free plan configuration
export const FREE_PLAN = {
    key: "free",
    name: "Free Plan",
    description: "The Free Tier",
    polarProductId: "953a008a-c4ef-4dac-9ede-6be6de6978b0", // This should be your free plan product ID from Polar
    prices: {
        month: {
            usd: {
                amount: 0,
                polarId: "free" // Not used for free plan
            }
        },
        year: {
            usd: {
                amount: 0,
                polarId: "free" // Not used for free plan
            }
        }
    }
} as const;

const createCheckout = async ({
    customerEmail,
    productPriceId,
    successUrl,
    metadata
}: {
    customerEmail: string;
    productPriceId: string;
    successUrl: string;
    metadata?: Record<string, string>;
}) => {

    if (!process.env.POLAR_ACCESS_TOKEN) {
        throw new Error("POLAR_ACCESS_TOKEN is not configured");
    }

    const polar = new Polar({
        server: "sandbox",
        accessToken: process.env.POLAR_ACCESS_TOKEN,
    });

    console.log("Initialized Polar SDK with token:", process.env.POLAR_ACCESS_TOKEN?.substring(0, 8) + "...");

    const result = await polar.checkouts.custom.create({
        productPriceId,
        successUrl,
        customerEmail,
        metadata
    });

    return result;
};

export const getPlanByKey = internalQuery({
    args: {
        key: schema.tables.plans.validator.fields.key,
    },
    handler: async (ctx, args) => {
        return ctx.db
            .query("plans")
            .withIndex("key", (q) => q.eq("key", args.key))
            .unique();
    },
});

export const getOnboardingCheckoutUrl = action({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.runQuery(api.users.getUserByToken, {
            tokenIdentifier: identity.subject
        });

        if (!user) {
            throw new Error("User not found");
        }

        const product = await ctx.runQuery(internal.subscriptions.getPlanByKey, {
            key: "free",
        });

        if (!product) {
            throw new Error("Free plan product not found");
        }

        if (!user.email) {
            throw new Error("User email not found");
        }

        // Use Polar's checkout flow for free plans
        const polar = new Polar({
            server: "sandbox",
            accessToken: process.env.POLAR_ACCESS_TOKEN,
        });

        console.log("Creating free plan checkout with:", {
            productId: product.polarProductId,
            email: user.email,
            metadata: {
                userId: user.tokenIdentifier,
                userEmail: user.email,
                tokenIdentifier: identity.subject,
                plan: "free"
            }
        });

        // Create a checkout session with the product ID for free plan
        const result = await polar.checkouts.custom.create({
            productId: product.polarProductId,
            successUrl: `${process.env.FRONTEND_URL}/dashboard/events`,
            customerEmail: user.email,
            metadata: {
                userId: user.tokenIdentifier,
                userEmail: user.email,
                tokenIdentifier: identity.subject,
                plan: "free"
            }
        });

        console.log("Created free plan checkout:", result);

        return result.url;
    },
});

export const getProOnboardingCheckoutUrl = action({
    args: {
        interval: schema.tables.subscriptions.validator.fields.interval,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.runQuery(api.users.getUserByToken, {
            tokenIdentifier: identity.subject
        });

        if (!user) {
            throw new Error("User not found");
        }

        const product = await ctx.runQuery(internal.subscriptions.getPlanByKey, {
            key: "pro",
        });

        const price =
            args.interval === "month"
                ? product?.prices.month?.usd
                : product?.prices.year?.usd;

        console.log("Selected price:", JSON.stringify(price, null, 2));

        if (!price) {
            throw new Error("Price not found");
        }
        if (!user.email) {
            throw new Error("User email not found");
        }

        const metadata: Record<string, string> = {
            userId: user.tokenIdentifier,
            userEmail: user.email,
            tokenIdentifier: identity.subject,
            plan: "pro"
        };

        if (args.interval) {
            metadata.interval = args.interval;
        }

        const checkout = await createCheckout({
            customerEmail: user.email,
            productPriceId: price.polarId,
            successUrl: `${process.env.FRONTEND_URL}/success`,
            metadata
        });

        console.log("Checkout:", checkout);

        return checkout.url;
    },
});

export const getUserSubscriptionStatus = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            console.log("[Subscription Check] No identity found");
            return { hasActiveSubscription: false };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.subject)
            )
            .unique();

        if (!user) {
            console.log("[Subscription Check] No user found for token:", identity.subject);
            return { hasActiveSubscription: false };
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
            .first();

        console.log("[Subscription Check] Found subscription:", subscription ? {
            userId: subscription.userId,
            status: subscription.status,
            polarId: subscription.polarId
        } : "No subscription");

        const hasActiveSubscription = subscription?.status === "active";
        console.log("[Subscription Check] Active subscription:", hasActiveSubscription);
        
        return { hasActiveSubscription };
    }
});

export const getUserSubscription = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.subject)
            )
            .unique();

        if (!user) {
            return null;
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
            .first();

        return subscription;
    }
});

export const subscriptionStoreWebhook = mutation({
    args: {
        body: v.any(),
    },
    handler: async (ctx, args) => {

        // Extract event type from webhook payload
        const eventType = args.body.type;

        console.log("Received webhook event:", {
            type: eventType,
            data: args.body.data,
            metadata: args.body.data.metadata,
            userId: args.body.data.metadata?.userId,
            plan: args.body.data.metadata?.plan
        });

        // Validate required metadata
        if (!args.body.data.metadata?.userId) {
            console.error("Missing userId in webhook metadata:", args.body.data.metadata);
            throw new Error("Missing userId in webhook metadata");
        }

        // Store webhook event
        await ctx.db.insert("webhookEvents", {
            type: eventType,
            polarEventId: args.body.data.id,
            createdAt: args.body.data.created_at,
            modifiedAt: args.body.data.modified_at || args.body.data.created_at,
            data: args.body.data,
        });

        switch (eventType) {
            case 'subscription.created':
                // Handle both paid and free subscriptions
                const subscriptionData = {
                    polarId: args.body.data.id,
                    polarPriceId: args.body.data.price_id || args.body.data.product_id, // Use product_id as fallback for free plans
                    currency: args.body.data.currency || "usd", // Default to USD for free plans
                    interval: args.body.data.recurring_interval || "month", // Default to monthly for free plans
                    userId: args.body.data.metadata.userId,
                    status: args.body.data.status,
                    currentPeriodStart: new Date(args.body.data.current_period_start).getTime(),
                    currentPeriodEnd: new Date(args.body.data.current_period_end).getTime(),
                    cancelAtPeriodEnd: args.body.data.cancel_at_period_end,
                    amount: args.body.data.amount || 0, // Default to 0 for free plans
                    startedAt: new Date(args.body.data.started_at).getTime(),
                    endedAt: args.body.data.ended_at
                        ? new Date(args.body.data.ended_at).getTime()
                        : undefined,
                    canceledAt: args.body.data.canceled_at
                        ? new Date(args.body.data.canceled_at).getTime()
                        : undefined,
                    customerCancellationReason: args.body.data.customer_cancellation_reason || undefined,
                    customerCancellationComment: args.body.data.customer_cancellation_comment || undefined,
                    metadata: args.body.data.metadata || {},
                    customFieldData: args.body.data.custom_field_data || {},
                    customerId: args.body.data.customer_id
                };

                await ctx.db.insert("subscriptions", subscriptionData);
                break;

            case 'subscription.updated':
                // Find existing subscription
                const existingSub = await ctx.db
                    .query("subscriptions")
                    .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
                    .first();

                if (existingSub) {
                    await ctx.db.patch(existingSub._id, {
                        amount: args.body.data.amount,
                        status: args.body.data.status,
                        currentPeriodStart: new Date(args.body.data.current_period_start).getTime(),
                        currentPeriodEnd: new Date(args.body.data.current_period_end).getTime(),
                        cancelAtPeriodEnd: args.body.data.cancel_at_period_end,
                        metadata: args.body.data.metadata || {},
                        customFieldData: args.body.data.custom_field_data || {},
                    });
                }
                break;

            case 'subscription.active':
                // Find and update subscription
                const activeSub = await ctx.db
                    .query("subscriptions")
                    .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
                    .first();

                if (activeSub) {
                    await ctx.db.patch(activeSub._id, {
                        status: args.body.data.status,
                        startedAt: new Date(args.body.data.started_at).getTime(),
                    });
                }
                break;

            case 'subscription.canceled':
                // Find and update subscription
                const canceledSub = await ctx.db
                    .query("subscriptions")
                    .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
                    .first();

                if (canceledSub) {
                    await ctx.db.patch(canceledSub._id, {
                        status: args.body.data.status,
                        canceledAt: args.body.data.canceled_at
                            ? new Date(args.body.data.canceled_at).getTime()
                            : undefined,
                        customerCancellationReason: args.body.data.customer_cancellation_reason || undefined,
                        customerCancellationComment: args.body.data.customer_cancellation_comment || undefined,
                    });
                }
                break;

            case 'subscription.uncanceled':
                // Find and update subscription
                const uncanceledSub = await ctx.db
                    .query("subscriptions")
                    .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
                    .first();

                if (uncanceledSub) {
                    await ctx.db.patch(uncanceledSub._id, {
                        status: args.body.data.status,
                        cancelAtPeriodEnd: false,
                        canceledAt: undefined,
                        customerCancellationReason: undefined,
                        customerCancellationComment: undefined,
                    });
                }
                break;

            case 'subscription.revoked':
                // Find and update subscription
                const revokedSub = await ctx.db
                    .query("subscriptions")
                    .withIndex("polarId", (q) => q.eq("polarId", args.body.data.id))
                    .first();

                if (revokedSub) {
                    await ctx.db.patch(revokedSub._id, {
                        status: 'revoked',
                        endedAt: args.body.data.ended_at
                            ? new Date(args.body.data.ended_at).getTime()
                            : undefined,
                    });
                }
                break;

            case 'order.created':
                console.log("order.created:", args.body);
                // Orders are handled through the subscription events
                break;

            default:
                console.log(`Unhandled event type: ${eventType}`);
                break;
        }
    },
});

export const updateFreePlan = mutation({
    handler: async (ctx) => {
        // Check if free plan already exists
        const existingFreePlan = await ctx.db
            .query("plans")
            .withIndex("key", (q) => q.eq("key", FREE_PLAN.key))
            .unique();

        if (existingFreePlan) {
            return existingFreePlan;
        }

        // Insert the free plan
        const freePlan = await ctx.db.insert("plans", FREE_PLAN);

        return freePlan;
    },
});

export const paymentWebhook = httpAction(async (ctx, request) => {

    console.log("Webhook received!", {
        method: request.method,
        url: request.url,
        headers: request.headers
    });

    try {
        const body = await request.json();

        // track events and based on events store data
        await ctx.runMutation(api.subscriptions.subscriptionStoreWebhook, {
            body
        });

        console.log("Webhook body:", body);
        return new Response(JSON.stringify({ message: "Webhook received!" }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });

    } catch (error) {
        console.log("No JSON body or parsing failed");
        return new Response(JSON.stringify({ error: "Invalid request body" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

});

export const getUserDashboardUrl = action({
    handler: async (ctx, args: { customerId: string }) => {
        const polar = new Polar({
            server: "sandbox",
            accessToken: process.env.POLAR_ACCESS_TOKEN,
        });

        try {
            const result = await polar.customerSessions.create({
                customerId: args.customerId,
            });

            // Only return the URL to avoid Convex type issues
            return { url: result.customerPortalUrl };
        } catch (error) {
            console.error("Error creating customer session:", error);
            throw new Error("Failed to create customer session");
        }
    }
});