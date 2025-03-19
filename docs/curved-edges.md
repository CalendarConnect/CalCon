# Dashboard Curved Edges Documentation

This document outlines where and how curved edges are implemented in the dashboard layout.

## Main Content Area Curved Edges

### Location: `app/(pages)/dashboard/_components/side-panel.tsx`
The main content area's curved edges (top-left and top-right) are implemented in the `SidePanelContainer` component:
```typescript
<div className="absolute inset-0 bg-[#eaeaec] md:rounded-tl-[24px] md:rounded-tr-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.05)] transition-all ease-in-out duration-300">
```
- `md:rounded-tl-[24px]`: Creates a 24px radius curve on the top-left corner
- `md:rounded-tr-[24px]`: Creates a 24px radius curve on the top-right corner
- Only appears on medium (`md`) screens and up

## Right Side Panel Background

### Location: `app/(pages)/dashboard/_components/dashboard-navigation.tsx`
The right side panel background that creates the visual separation is implemented in the `DashboardNavigation` component:
```typescript
<div className="absolute top-0 right-0 bottom-0 min-[1024px]:block hidden w-[400px] bg-[#f7f7f8] md:rounded-bl-[24px] md:rounded-br-[24px]" />
```
- Creates the light gray background panel on the right side
- Only visible on screens 1024px and wider (`min-[1024px]`)
- Width is set to 400px
- `md:rounded-bl-[24px]`: Creates a 24px radius curve on the bottom-left corner
- `md:rounded-br-[24px]`: Creates a 24px radius curve on the bottom-right corner
- Curved edges only appear on medium (`md`) screens and up

## Implementation Notes

1. The curved edges are part of the dashboard's layout structure and not individual pages
2. The styling is responsive and only appears on appropriate screen sizes
3. The combination of these elements creates the distinctive dashboard layout with:
   - Curved main content area (top corners)
   - Right side panel with contrasting background and curved bottom corners
   - Clean visual separation between sections 