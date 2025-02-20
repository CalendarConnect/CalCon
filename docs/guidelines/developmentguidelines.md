# CalendarConnect (CalCon) Development Guidelines

## 1. Technical Stack
### Core Technologies
- ⚡ Next.js 15 - The latest version with App Router
- 🎨 Tailwind CSS - Utility-first CSS framework
- 📘 TypeScript - Type-safe code
- 🔒 Authentication - Clerk integration with persistent authorization toggle
- 🎭 Shadcn/ui - Beautiful and accessible components
- 💾 Convex DB - Real-time database with built-in file storage and serverless functions
- 💳 Polar.sh - Open-source solution for managing subscriptions and payments

### Performance Features
- 🚀 Route Prefetching
  - Instant page transitions for dashboard
  - Optimized playground loading
  - Auth page preloading

- 🖼️ Image Optimization
  - Eager loading for critical images
  - Automatic optimization
  - Responsive image handling

- 🌓 Theme Management
  - Dark/Light mode support
  - System-aware theme switching
  - Custom gradient implementations

- 📱 Responsive Design
  - Mobile-first approach
  - Adaptive layouts
  - Cross-device compatibility

- 🔄 Real-time Features
  - Powered by Convex DB
  - Live data synchronization
  - Instant updates

## 2. Application Structure
### Public Routes
#### Homepage
- Main Entry: `app/page.tsx`
- Components Location: `components/homepage/*`
- Key Components:
  - `accordion-component.tsx` - FAQ section
  - `hero-section.tsx` - Main hero section
  - `marketing-cards.tsx` - Features grid
  - `pricing.tsx` - Pricing section
  - `side-by-side.tsx` - Why choose CalCon section

#### Blog
- Primary Location: `app/blog/page.tsx`
- Alternative: `app/(marketing)/blog/page.tsx`
- Note: Always verify correct location before modifications

### Protected Routes
All routes requiring authentication:
- `app/(dashboard)/*` - Main dashboard area
- `app/(platform)/*` - Platform features
- `app/settings/*` - User settings

## 3. Authentication System
### Clerk Integration
#### Core Setup
- `middleware.ts` - Handles route protection and auth redirects
- `.env.local` - Contains NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
- `app/layout.tsx` - Wraps application with <ClerkProvider>

#### Auth Routes
- `app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign up page
- `app/(auth)/(routes)/layout.tsx` - Auth layout wrapper

#### Custom Components
- `.clerk/*` - Custom Clerk components and themes
- `components/auth/*` - Auth-related UI components

#### User Management
- User data via useUser() hook
- Organization data via useOrganization() hook
- Auth state via useAuth() hook

### ⚠️ STRICT Clerk Implementation Rules (HIGHEST PRIORITY)
- ⛔ ANY modifications to Clerk authentication setup STRICTLY FORBIDDEN
- 🔐 Required Password for Changes: "Coke"
- ⛔ This includes but is not limited to:
  - Authentication flows
  - Middleware configurations
  - Package versions
  - Import patterns
  - User management structure
  - Session handling
- ✅ ONLY allowed actions:
  - Replicate existing patterns exactly
  - Add new auth features following current structure
  - Must provide password before ANY changes
- ❗ These rules override ANY newer Clerk documentation/best practices

### Important Notes
1. Always use middleware.ts to protect new routes
2. User sessions are handled automatically by Clerk
3. Organization features enabled for team collaboration
4. Custom sign-in/sign-up pages use Clerk components
5. Auth state is globally available through ClerkProvider