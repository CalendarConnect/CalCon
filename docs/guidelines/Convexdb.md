# Convex DB Documentation

## Overview
Convex DB is employed in this codebase to provide a robust, real-time data storage and retrieval solution. It enables type-safe operations, real-time data synchronization, and efficient server-side queries and mutations.

## Integration in the Codebase
- **Client Initialization:** The Convex client is initialized in a dedicated module (e.g., `lib/convexClient.ts`), ensuring a single point of configuration.
- **Server-Side Usage:** Convex DB is integrated with the Next.js server components and API routes to enable server-side rendering with live data.
- **Real-Time Data Sync:** The system leverages Convex’s subscription model to automatically update the user interface when data changes occur on the server.

## Setup & Configuration
- **Environment Variables:** Secure connection details for Convex DB are stored in environment variables.
- **Configuration Files:** Convex configuration is part of the backend setup, ensuring proper linking with Convex services.
- **Type Safety:** The integration utilizes generated types from Convex to ensure consistency and prevent runtime errors.

## Querying Data
- **Predefined Queries:** The codebase defines multiple Convex queries that are used to fetch data in a type-safe manner.
- **Usage in Components:** These queries are invoked within server-side components and API routes to render data dynamically.

## Mutations
- **Data Updates:** Mutations are implemented to handle create, update, and delete operations in the database.
- **Optimistic UI:** The system incorporates optimistic updates and error handling to provide a smooth user experience.

## Real-time Data Synchronization
- **Subscriptions:** Convex’s subscription mechanism ensures that any data change on the server triggers immediate updates on the client side, maintaining real-time synchronization.

## Database Schema
Our Convex database consists of the following tables:

### Users Table
Stores user information and authentication details:
- `createdAt`: Timestamp of user creation
- `email`: User's email address
- `name`: Optional user's display name
- `image`: Optional user's profile image URL
- `userId`: Unique user identifier
- `subscription`: Optional subscription status
- `credits`: Optional user credits
- `tokenIdentifier`: Authentication token identifier
- **Indexes**: 
  - `by_token`: Indexed by tokenIdentifier for efficient user lookups

### Plans Table
Stores subscription plan configurations:
- `key`: Unique plan identifier
- `name`: Plan name
- `description`: Plan description
- `polarProductId`: Associated Polar.sh product ID
- `prices`: Object containing pricing information
  - `month`: Optional monthly pricing (USD)
  - `year`: Optional yearly pricing (USD)
- **Indexes**:
  - `key`: Indexed by plan key
  - `polarProductId`: Indexed by Polar product ID

### Subscriptions Table
Manages user subscription details:
- `userId`: Associated user ID
- `polarId`: Polar.sh subscription ID
- `polarPriceId`: Polar.sh price ID
- `currency`: Subscription currency
- `interval`: Billing interval (month/year)
- `status`: Subscription status
- `currentPeriodStart`: Start timestamp of current period
- `currentPeriodEnd`: End timestamp of current period
- `cancelAtPeriodEnd`: Whether subscription will cancel at period end
- `amount`: Subscription amount
- `startedAt`: Subscription start timestamp
- `endsAt`: Scheduled end timestamp
- `endedAt`: Actual end timestamp
- `canceledAt`: Cancellation timestamp
- `customerCancellationReason`: Reason for cancellation
- `customerCancellationComment`: Additional cancellation comments
- `metadata`: Optional metadata
- `customFieldData`: Optional custom fields
- `customerId`: Customer identifier
- **Indexes**:
  - `userId`: Indexed by user ID
  - `polarId`: Indexed by Polar subscription ID

### Webhook Events Table
Tracks incoming webhook events:
- `type`: Event type
- `polarEventId`: Polar.sh event ID
- `createdAt`: Event creation timestamp
- `modifiedAt`: Event modification timestamp
- `data`: Event payload data
- **Indexes**:
  - `type`: Indexed by event type
  - `polarEventId`: Indexed by Polar event ID

## Codebase References
- **Initialization:** Check `lib/convexClient.ts` for the Convex client initialization.
- **Server Operations:** Review the API routes and server-side components in the `/server` directory for examples of query and mutation usage.

## Best Practices
- Always use the generated Convex types for query and mutation operations.
- Handle network errors and edge cases gracefully.
- Follow the established patterns when extending or modifying Convex functionalities, ensuring consistency across the codebase.

## Additional Resources
- [Convex Documentation](https://docs.convex.dev/home)
- [Convex GitHub Repository](https://github.com/convex-dev/convex)