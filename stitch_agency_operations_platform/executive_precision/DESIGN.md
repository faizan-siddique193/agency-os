---
name: Executive Precision
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1b1b24'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#fcf8ff'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
typography:
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 40px
---

## Brand & Style
This design system is engineered for high-performance digital agencies that demand a balance of creative authority and operational rigor. The brand personality is **composed, elite, and architectural**. It avoids decorative excess in favor of structural clarity and typographic excellence.

The chosen style is **Minimalist-Corporate**. It leverages heavy whitespace and a restricted color palette to ensure that the user's content—agency projects, data visualizations, and client communications—remains the focal point. The interface feels "high-fidelity" through precise alignment, subtle tonal shifts, and a rigorous adherence to a 4px soft grid.

## Colors
The palette is anchored by a deep Indigo primary, signaling intelligence and stability. The foundational canvas uses a cool Slate background to reduce eye strain during long-form operational tasks, while pure white surfaces indicate interactive or high-priority content areas.

Status colors (Success and Error) are saturated but used sparingly—primarily for validation states and critical indicators—to maintain the professional atmosphere. Neutral grays are strictly cool-toned to ensure a cohesive, modern appearance across all UI states.

## Typography
Inter is utilized for its exceptional legibility and systematic weight distribution. For a premium agency feel, the hierarchy relies on tight line-heights for headings and generous tracking for utility labels. 

Headings should use the "Text Base" color (#0F172A) with slight negative letter-spacing to create a "locked-in" editorial look. Body text utilizes a slightly softer gray for readability, while small labels use uppercase styling to differentiate metadata from actionable content.

## Layout & Spacing
The system employs a **Fixed Grid** philosophy for primary dashboards to maintain a sense of order, transitioning to a responsive 12-column fluid system for content-heavy views. 

Spacing is governed by a 4px baseline, with 16px (md) being the standard padding for most containers. For premium layouts, increase vertical spacing to 32px (xl) between sections to allow the design to "breathe." Gutters are locked at 24px to ensure distinct separation between data cards and sidebar navigation.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and extremely soft **Ambient Shadows**. 

1.  **Level 0 (Background):** Slate (#F8FAFC) - The base canvas.
2.  **Level 1 (Surface):** White (#FFFFFF) - The primary container color. Use a 1px border (#E2E8F0) instead of a shadow for standard cards.
3.  **Level 2 (Active/Raised):** Applied to modals or dropdowns. Use a diffuse shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08)`. 

Avoid heavy blurs or vibrant glassmorphism. Depth should feel physical and architectural, not digital or glowing.

## Shapes
The shape language is **Structured and Geometric**. We use a strict "Soft" roundedness level. Smaller components like buttons, inputs, and checkboxes are set to a **6px radius**. Larger structural elements like cards, modals, and panels use an **8px radius**. 

Pill-shaped buttons are strictly forbidden to maintain the professional, B2B aesthetic. Shapes should feel intentional and precise, aligning with the "Executive Precision" brand narrative.

## Components

### Buttons
- **Primary:** Solid Indigo (#4F46E5) with white text. 6px radius. No gradient.
- **Secondary:** White background with a 1px Slate-200 border. Text in Slate-900.
- **States:** Hover state for Primary is Indigo-700 (#4338CA). Active state includes a subtle 2px outer ring in Indigo-100.

### Input Fields
- **Default:** 6px radius, White surface, 1px border (#E2E8F0). 
- **Focus:** 1px border in Indigo-500 with a soft 3px Indigo-50 shadow ring.
- **Label:** Small, Slate-600, positioned 8px above the field.

### Cards
- **Structure:** 8px radius, White background, 1px border (#E2E8F0). 
- **Padding:** 24px (lg) internal padding for content; 16px (md) for headers and footers.

### Chips & Tags
- **Style:** Rectangular with a 4px or 6px radius. 
- **Palette:** Light gray backgrounds with Slate-700 text for neutral tags; subtle tinted backgrounds for status tags (e.g., Light Emerald background for Success).

### Navigation
- **Sidebar:** Use a slightly darker neutral or the background Slate for the rail, with active states indicated by a 2px vertical Indigo line on the left edge of the menu item.