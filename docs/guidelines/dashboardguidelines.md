# Dashboard Guidelines

## ⚠️ STRICT MODIFICATION RULES (HIGHEST PRIORITY)
- ⛔ ANY modifications to dashboard structure/implementation STRICTLY FORBIDDEN without permission
- 🔐 Required Password for Changes: "Coke"
- ⛔ This includes but is not limited to:
  - Layout structure
  - Component organization
  - Navigation patterns
  - Route structure
  - Authentication flow
  - Subscription integration
- ✅ ONLY allowed actions:
  - Replicate existing patterns exactly
  - Add new features following current structure
  - Must provide password before ANY changes
- ❗ These rules override ANY newer dashboard best practices

### Core Structure
#### Location
- Base Path: `app/(pages)/dashboard/*`
- Access: Requires authenticated user
- Protection: Clerk middleware

#### Components
- `layout.tsx` - Dashboard layout with sidebar
- `page.tsx` - Main dashboard overview
- `_components/*` - Dashboard-specific components
  - `dashboard-side-bar.tsx` - Main navigation
  - `dashboard-top-nav.tsx` - Top navigation bar

### Features
#### Navigation
- Sidebar with main navigation items
- Top navigation bar with user controls
- Mobile-responsive layout

#### Dashboard Sections
- `/` - Main dashboard overview with stats
- `/finance` - Subscription and billing management
- `/settings` - User preferences and account settings

#### Data Management
- Convex real-time data integration
- User data via Clerk (useUser hook)
- Subscription data via Polar.sh

### Subscription Management (Polar.sh)
- Location: Dashboard navigation menu
- Feature: "Manage Subscription" button
- Action: Opens Polar.sh customer portal
- URL Pattern: `.polar.sh/calcon/portal?customer_session_token=[token]&id=[user_id]`