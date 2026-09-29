---
name: Premium B2B Enterprise
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464555'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
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
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  container-max: 1440px
---

## Brand & Style

The visual identity of this design system is rooted in **Corporate Modernism**, prioritizing clarity, data density, and professional authority. It is engineered for high-stakes B2B environments where cognitive load must be minimized to facilitate complex decision-making. 

The aesthetic is characterized by a "High-Utility Minimalism"—utilizing expansive white space not just for beauty, but as a functional tool to separate dense data sets. The emotional response is one of "Quiet Confidence": the UI recedes into the background to let the user's work take center stage, using the Indigo accent only to signal intent and primary actions.

## Colors

The palette is anchored by a crisp, off-white background (#F8FAFC) which provides a softer canvas than pure white, reducing eye strain during prolonged use. Pure white (#FFFFFF) is reserved strictly for interactive surfaces and containers to create a clear "layering" effect.

Primary actions utilize **Indigo (#4F46E5)**, a color that balances the technical feel of blue with the modern energy of violet. Semantic colors—Emerald, Amber, and Rose—are calibrated for high legibility against white backgrounds, ensuring that status indicators and error states are immediately perceivable without being jarring. Use Slate Gray for all secondary metadata to maintain a clear visual hierarchy against the Deep Slate primary text.

## Typography

This design system exclusively employs **Inter**, a typeface designed specifically for computer screens and high-density interfaces. The typographic scale is optimized for SaaS applications where information hierarchy is critical.

- **Headlines:** Use Semi-bold (600) for H1-H3 to provide strong structural anchors. For large dashboard numbers or display text, use Bold (700) with a slight negative letter spacing to maintain a premium, compact feel.
- **Body Text:** Standard body copy should utilize the 14px (Small) or 16px (Medium) sizes. The 14px size is the workhorse of the system, providing the necessary density for data-heavy views.
- **Labels:** Use Medium (500) or Semi-bold (600) weights for buttons and form labels to distinguish them from standard body prose.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. While the overall container has a maximum width of 1440px to ensure readability on ultrawide monitors, internal dashboards utilize a 12-column fluid grid.

A strict **8px spacing system** governs all spatial relationships. All margins and paddings must be multiples of 8px (e.g., 8, 16, 24, 32, 48). This mathematical consistency ensures that even the most complex layouts feel balanced and intentional. Standard page margins are set to 24px (lg) on desktop, with 24px gutters between grid columns to provide sufficient "breathability" for data-heavy components.

## Elevation & Depth

This design system uses **Tonal Layering** supplemented by **Low-Contrast Outlines**. Because the background is an off-white (#F8FAFC), pure white surfaces (#FFFFFF) naturally "lift" off the page without the need for aggressive shadows.

1.  **Level 0 (Background):** The base canvas (#F8FAFC).
2.  **Level 1 (Cards/Surfaces):** Pure white with a 1px border (#E2E8F0).
3.  **Level 2 (Overlays/Dropdowns):** Pure white with a subtle ambient shadow (Color: #0F172A, Opacity: 5%, Blur: 12px, Offset-Y: 4px).

Avoid using heavy, dark shadows. The goal is a flat, architectural feel where depth is suggested by borders and subtle shifts in surface color rather than physical simulation.

## Shapes

The shape language is defined by a consistent **8px (0.5rem)** corner radius applied to all primary containers, including cards, input fields, and buttons. 

Smaller elements, such as tags or checkboxes, should adhere to a **4px (0.25rem)** radius to maintain visual proportion. This "Soft-Rounded" approach strikes a balance between the rigid feel of square corners and the overly casual appearance of fully rounded pill shapes, reinforcing the professional yet approachable nature of the platform.

## Components

### Buttons
- **Primary:** Solid Indigo (#4F46E5) with White text. 8px radius. 
- **Secondary:** White background with #E2E8F0 border and Deep Slate text.
- **Tertiary/Ghost:** Transparent background with Indigo or Slate Gray text. Used for low-emphasis actions.

### Input Fields
Inputs must have a height of 40px (Standard) or 32px (Compact). Use #FFFFFF background, #E2E8F0 borders, and an 8px radius. On focus, the border transitions to Indigo with a 2px soft outer glow.

### Cards
Cards are the primary container for all content. They feature a #FFFFFF background and a #E2E8F0 border. For dashboard widgets, use a padding of 24px (lg) to prevent the UI from feeling cramped.

### Data Tables
Tables should be borderless on the sides, using only subtle horizontal dividers (#E2E8F0). The header row uses the Off-White background (#F8FAFC) and Label-Sm typography to clearly separate metadata from cell values.

### Chips & Tags
Tags use a subtle tint of the semantic color (e.g., 10% opacity Emerald for success) with a more saturated 100% opacity text color for maximum readability and a premium "glass" aesthetic.