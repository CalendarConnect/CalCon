/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as contacts_mutations from "../contacts/mutations.js";
import type * as contacts_queries from "../contacts/queries.js";
import type * as contacts from "../contacts.js";
import type * as events_mutations from "../events/mutations.js";
import type * as events_queries from "../events/queries.js";
import type * as http from "../http.js";
import type * as plans from "../plans.js";
import type * as subscriptions from "../subscriptions.js";
import type * as usage_queries from "../usage/queries.js";
import type * as users_queries from "../users/queries.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "contacts/mutations": typeof contacts_mutations;
  "contacts/queries": typeof contacts_queries;
  contacts: typeof contacts;
  "events/mutations": typeof events_mutations;
  "events/queries": typeof events_queries;
  http: typeof http;
  plans: typeof plans;
  subscriptions: typeof subscriptions;
  "usage/queries": typeof usage_queries;
  "users/queries": typeof users_queries;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
