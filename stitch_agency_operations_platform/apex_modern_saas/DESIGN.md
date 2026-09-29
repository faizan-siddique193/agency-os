---
name: Apex Modern SaaS
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e7'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f1ff'
  surface-container: '#f0ecfb'
  surface-container-high: '#ebe6f5'
  surface-container-highest: '#e5e0ef'
  on-surface: '#1c1a25'
  on-surface-variant: '#474556'
  inverse-surface: '#312f3a'
  inverse-on-surface: '#f3eefe'
  outline: '#787588'
  outline-variant: '#c8c4d9'
  surface-tint: '#5534f9'
  primary: '#410ee8'
  on-primary: '#ffffff'
  primary-container: '#5b3dff'
  on-primary-container: '#e3deff'
  inverse-primary: '#c6bfff'
  secondary: '#5b52ab'
  on-secondary: '#ffffff'
  secondary-container: '#a9a0ff'
  on-secondary-container: '#3c318a'
  tertiary: '#882f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b03f00'
  on-tertiary-container: '#ffdacd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6bfff'
  on-primary-fixed: '#160066'
  on-primary-fixed-variant: '#3c00de'
  secondary-fixed: '#e4dfff'
  secondary-fixed-dim: '#c6bfff'
  on-secondary-fixed: '#160066'
  on-secondary-fixed-variant: '#433992'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#fcf8ff'
  on-background: '#1c1a25'
  surface-variant: '#e5e0ef'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for high-performance B2B SaaS environments, prioritizing clarity, efficiency, and a "premium utility" aesthetic. It draws inspiration from the precision of developer tools and the elegance of modern fintech interfaces.

The personality is **authoritative yet approachable**, evoking a sense of calm reliability. The visual style follows a **Modern Minimalist** approach:
- **Spaciousness:** Generous white space to reduce cognitive load and emphasize critical data.
- **Precision:** Tight alignment and a strict 4px/8px grid system to convey technical excellence.
- **Subtle Luxury:** High-quality typography and layered shadows create a sophisticated, "investor-ready" interface that feels expensive but functional.

## Colors

The color palette is built on a foundation of neutral slates to allow the primary brand color to act as a high-intent signal.

- **Primary:** A vibrant, high-energy violet used for main actions and brand presence.
- **Neutrals:** We utilize a "Slate" scale for backgrounds and text to provide a cooler, more professional tone than pure greyscale.
- **Surface Strategy:** Layers are defined by color shifts. The base application background is `#F8FAFC`, while interactive or content-heavy containers use pure `#FFFFFF` to "pop" from the canvas.
- **Feedback:** Success and error states should be used sparingly, maintaining a high-contrast ratio against the light background for accessibility.

## Typography

This design system uses **Geist** for its technical precision and modern geometric construction. 

- **Headlines:** Use a tighter letter-spacing (`-0.01em` to `-0.02em`) for headlines to create a compact, high-end editorial look.
- **Hierarchy:** High contrast between Display and Body sizes is encouraged to create a clear "scannable" path for the user.
- **Labels:** Small labels and UI metadata should use Medium (500) weight to maintain legibility at smaller scales.

## Layout & Spacing

The layout is built on a **Fluid Grid** with fixed-width constraints for readability in heavy data views.

- **The 8px Rhythm:** All padding, margins, and component heights must be multiples of 8px (with 4px used for micro-adjustments).
- **Desktop:** 12-column grid with 24px gutters. Content should typically be capped at a `max-width` of 1440px to ensure line lengths remain readable.
- **Sidebars:** Use a fixed width of 240px or 280px for navigation, while the main content area remains fluid.
- **Mobile:** Transition to a 4-column grid with 16px margins. Stack vertical elements and use full-width buttons for primary actions.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**, avoiding heavy borders where possible to maintain a lightweight feel.

- **Level 0 (Background):** `#F8FAFC`. Used for the main canvas.
- **Level 1 (Surface/Cards):** Pure white `#FFFFFF`. These elements use a subtle 1px border (`#E2E8F0`) and a soft, multi-layered shadow (e.g., `0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.02)`).
- **Level 2 (Dropdowns/Modals):** These sit higher on the Z-axis. Use a more pronounced shadow with a larger blur radius to create distinct separation from the surface.
- **Shadow Tinting:** Shadows should be slightly tinted with the text color (Slate) rather than pure black to keep the UI feeling cohesive and "airy."

## Shapes

The shape language is sophisticated and approachable, utilizing a **Rounded** aesthetic with specific emphasis on larger radii for containers.

- **Components:** Buttons, inputs, and small widgets use a standard `8px` (0.5rem) radius.
- **Containers:** Large cards and sections use a prominent `24px` (1.5rem) radius to create a soft, modern "frame" around content.
- **Consistency:** Maintain a nested radius logic where inner elements have a smaller radius than their parent containers to ensure visual harmony.

## Components

### Buttons
- **Primary:** Background `#5B3DFF`, Text `#FFFFFF`, 8px radius. Use a subtle inner-glow/top-border for a tactile feel.
- **Secondary:** Background `#FFFFFF`, Border `#E2E8F0`, Text `#0F172A`. On hover, shift background to `#F8FAFC`.
- **States:** Focus states must use a 2px offset ring in the Primary color.

### Input Fields
- **Design:** 8px radius, `#FFFFFF` background, 1px border `#E2E8F0`. 
- **Active State:** Border shifts to Primary color with a soft 3px Primary-colored glow (low opacity).
- **Labels:** Use `label-sm` in `Text Secondary` color, positioned 4px above the input.

### Cards
- **Style:** 24px radius, White surface, Level 1 shadow. 
- **Padding:** Use `lg` (24px) spacing for internal padding to ensure a luxurious, un-cramped appearance.

### Chips & Badges
- **Design:** 4px radius (soft) or pill-shaped.
- **Coloring:** Use a low-opacity version of the status color for the background (e.g., Success background at 10% opacity) with the full-strength color for text.

### Navigation
- **Sidebar Items:** 8px radius for hover states. Active items should use a subtle left-accent bar or a light background tint to indicate the current location.
- **Command Palette:** A central UI component (inspired by Linear) using a modal-style Level 2 elevation for quick actions.