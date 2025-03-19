# CalCon Design System Documentation

## Table of Contents
1. [Design Principles](#design-principles)
2. [Typography](#typography)
3. [Color System](#color-system)
4. [Components](#components)
5. [Layout System](#layout-system)
6. [Navigation](#navigation)
7. [Animations & Transitions](#animations--transitions)
8. [Icons & Assets](#icons--assets)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)

## Design Principles

### Minimalism
- Clean, uncluttered interfaces
- Focused content presentation
- Strategic use of white space
- Clear visual hierarchy

### Consistency
- Unified component styling
- Predictable interaction patterns
- Standardized spacing system
- Coherent visual language

### Responsiveness
- Fluid layouts
- Adaptive components
- Mobile-first approach
- Breakpoint optimization

## Typography

### Font Family
```css
/* Inter font for all text */
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

### Font Sizes
```css
/* Base Sizes */
text-[0.6875rem]  /* 11px - Smallest text */
text-[0.625rem]   /* Badge text */
text-xs          /* 12px - Regular small text */
text-[0.8125rem] /* 13px - Card titles */
text-sm          /* 14px - Regular text */
text-base        /* 16px - Body text */
```

### Font Weights
```css
font-normal     /* 400 - Regular text */
font-medium     /* 500 - Semi-bold text */
font-semibold   /* 600 - Bold text */
```

## Color System

### Primary Colors
```css
/* Blue Scale */
text-blue-500    /* #3B82F6 - Primary blue */
text-blue-600    /* #2563EB - Darker blue */
bg-blue-50      /* #EFF6FF - Light blue background */
```

### Neutral Colors
```css
/* Gray Scale */
text-gray-900    /* #111827 - Darkest text */
text-gray-600    /* #4B5563 - Regular text */
text-gray-500    /* #6B7280 - Muted text */
bg-gray-50      /* #F9FAFB - Light background */
bg-gray-100     /* #F3F4F6 - Slightly darker background */
```

### Status Colors
```css
/* Status Indicators */
bg-blue-50 text-blue-600   /* Accepted state */
bg-red-50 text-red-600     /* Declined state */
bg-gray-100 text-gray-600  /* Pending state */
```

## Components

### Card Component
Base card structure used throughout the application.

```css
/* Base Card */
.card {
  max-width: 308px;
  border-radius: 0.75rem;
  background: linear-gradient(to bottom right, white, #f4f4f5);
  border: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05);
  transition: all 300ms;
}

/* Card Hover */
.card:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.08);
}
```

#### Card Sections
1. **Header**
   ```css
   padding: 1rem;
   padding-bottom: 0.5rem;
   ```

2. **Content**
   ```css
   padding: 1rem;
   padding-top: 0;
   ```

3. **Footer**
   ```css
   padding: 1rem;
   padding-top: 0;
   display: flex;
   justify-content: flex-end;
   gap: 0.375rem;
   ```

### Button Component
Various button styles used in the application.

```css
/* Base Button */
.button {
  height: 1.75rem;  /* h-7 */
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 200ms;
}

/* Primary Button */
.button-primary {
  background-color: #3B82F6;
  color: white;
}
.button-primary:hover {
  background-color: #2563EB;
}

/* Ghost Button */
.button-ghost {
  background: transparent;
  color: #4B5563;
}
.button-ghost:hover {
  background-color: #F9FAFB;
}
```

### Dialog Component
Modal dialogs for various interactions.

```css
/* Base Dialog */
.dialog {
  max-width: 425px;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
}

/* Dialog Header */
.dialog-header {
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0.75rem;
}

/* Dialog Content */
.dialog-content {
  padding: 1rem;
}
```

### Badge Component
Status indicators and labels.

```css
/* Base Badge */
.badge {
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
```

## Layout System

### Grid System
```css
/* Responsive Grid */
grid-cols-1                /* Mobile: Single column */
sm:grid-cols-2            /* Tablet: Two columns */
lg:grid-cols-4            /* Desktop: Four columns */
gap-3                     /* 0.75rem gap between items */
```

### Spacing Scale
```css
/* Padding */
p-4          /* 1rem - Standard padding */
px-2         /* 0.5rem - Horizontal padding */
py-0.5       /* 0.125rem - Vertical padding */

/* Margins */
mb-4         /* 1rem - Bottom margin */
mt-1         /* 0.25rem - Top margin */

/* Gaps */
gap-1.5      /* 0.375rem - Small gap */
gap-2        /* 0.5rem - Medium gap */
gap-3        /* 0.75rem - Large gap */
```

### Container Widths
```css
max-w-[308px]    /* Card width */
sm:max-w-[425px] /* Dialog width */
```

## Navigation

### Dashboard Navigation
```css
/* Navigation Container */
.nav-container {
  background: white;
  border-right: 1px solid #E5E7EB;
  width: 240px;
}

/* Navigation Item */
.nav-item {
  padding: 0.5rem 1rem;
  color: #4B5563;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Active Navigation Item */
.nav-item-active {
  background-color: #F3F4F6;
  color: #2563EB;
}
```

## Animations & Transitions

### Duration Scale
```css
duration-200    /* Quick transitions */
duration-300    /* Standard transitions */
```

### Transition Properties
```css
transition-all  /* Smooth transitions for all properties */
```

### Hover Effects
```css
/* Card Hover */
hover:shadow-[0_6px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.08)]

/* Button Hover */
hover:bg-gray-100
hover:bg-blue-600
```

## Icons & Assets

### Icon Sizes
```css
/* Standard Sizes */
h-3 w-3        /* Small icons */
h-3.5 w-3.5    /* Medium icons */
h-4 w-4        /* Large icons */
```

### Icon Colors
```css
text-gray-500   /* Default icon color */
text-blue-500   /* Primary icon color */
```

## Responsive Design

### Breakpoints
```css
sm: 640px      /* Small devices */
md: 768px      /* Medium devices */
lg: 1024px     /* Large devices */
xl: 1280px     /* Extra large devices */
```

### Responsive Patterns
```css
/* Card Grid */
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4

/* Dialog Width */
w-full
sm:max-w-[425px]
```

## Accessibility

### Focus States
```css
focus:ring-2
focus:ring-blue-500
focus:outline-none
```

### ARIA Labels
- All interactive elements have appropriate ARIA labels
- Dialog components use proper ARIA roles
- Status messages are announced appropriately

### Color Contrast
- All text meets WCAG 2.1 contrast requirements
- Interactive elements have distinct focus states
- Status colors have appropriate contrast ratios 