---
name: Baja Coastal Catalog
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f1eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#42474d'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0e9'
  outline: '#73777e'
  outline-variant: '#c3c7ce'
  surface-tint: '#406182'
  primary: '#001629'
  on-primary: '#ffffff'
  primary-container: '#002b49'
  on-primary-container: '#7293b6'
  inverse-primary: '#a8caef'
  secondary: '#a33d23'
  on-secondary: '#ffffff'
  secondary-container: '#ff8162'
  on-secondary-container: '#731a04'
  tertiary: '#001815'
  on-tertiary: '#ffffff'
  tertiary-container: '#002f2a'
  on-tertiary-container: '#2fa092'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#a8caef'
  on-primary-fixed: '#001d34'
  on-primary-fixed-variant: '#274969'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a2'
  on-secondary-fixed: '#3c0700'
  on-secondary-fixed-variant: '#83260e'
  tertiary-fixed: '#8cf5e4'
  tertiary-fixed-dim: '#6fd8c8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2db'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 16px
  section: 24px
  gutter: 24px
  container-max: 1280px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built to evoke the unique atmosphere of Ensenada—where the rugged Pacific coastline meets a sophisticated culinary and craft culture. The aesthetic is **Modern Coastal**, blending the reliability of a professional service directory with the warmth of a sun-drenched community.

The visual style leans into **Minimalism with Tactile accents**, utilizing expansive white space (the "ocean breeze") and warm, earthy tones (the "coastal cliffs"). The goal is to feel authentic to Baja California: approachable, premium, and trustworthy. We avoid sterile corporate tropes in favor of soft shadows, natural textures, and a color palette that feels organic rather than synthetic.

## Colors

The palette is inspired by the Ensenada landscape:
- **Deep Navy Blue (Primary):** Represents the deep Pacific. Used for global navigation, footers, and primary headings to establish authority and depth.
- **Coral/Terracotta (Accent):** Inspired by Baja sunsets and clay pottery. This is our high-action color, reserved strictly for primary CTAs and critical highlights.
- **Sand/Cream (Background):** A soft, warm neutral that replaces harsh whites to reduce eye strain and provide a "sunny" foundation for the content.
- **White (Surface):** Used for foreground elements like cards and input fields to create a crisp "clean-cut" contrast against the sand background.
- **Teal/Sea Green (Success):** Used for "Verified" status markers, echoing the shallow waters of the bay and signaling growth and safety.

## Typography

This design system utilizes a dual-font approach to balance character with utility. 

**Montserrat** is used for headlines to provide a bold, geometric confidence that feels modern and architectural. **Inter** is used for all body copy, metadata, and labels to ensure maximum legibility for service descriptions and contact information. 

Large headings should use tighter letter-spacing to appear more cohesive, while labels and small captions should have slightly increased tracking to maintain readability against colored backgrounds.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy with a maximum container width of 1280px. 
- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 24px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing follows an 8px base unit. Section padding is consistently set to 24px or 48px to ensure the layout feels airy and uncrowded. Vertical stacks within cards use 16px (base gap), while related metadata like icons and labels use 8px.

## Elevation & Depth

To maintain the "Coastal Modern" feel, depth is achieved through **Tonal Layering** and **Soft Ambient Shadows**. 

We avoid heavy, dark shadows. Instead, we use a very soft elevation (`0 4px 12px rgba(0, 0, 0, 0.05)`) on white surface cards to make them "float" gently above the sand-colored background. 

Secondary depth is created through 1px borders in a slightly darker shade of the background color (`#EBE7DE`) rather than shadows, keeping the interface clean and systematic. For interactive elements like buttons, a slightly more pronounced shadow is applied on hover to simulate the element being "pressed" or "lifted."

## Shapes

The shape language is "Softly Geometric." 
- **Cards & Containers:** 12px radius. This larger radius creates a friendly, contemporary feel that softens the high-contrast typography.
- **Buttons, Inputs, & Badges:** 8px radius. These elements are slightly sharper than the cards they sit within, providing a sense of precision and "clickability."

Circular shapes are reserved exclusively for avatars and icon backgrounds to provide a distinct visual break from the rectangular grid.

## Components

### Buttons
- **Primary:** Solid Coral (#E76F51) with White text. 8px radius. Bold Inter font.
- **Secondary:** Outline Deep Navy (#002B49) with a 1.5px stroke. 
- **Ghost:** Deep Navy text with no background, used for low-priority actions like "Cancel."

### Cards
Service cards use the White (#FFFFFF) surface with 12px corner radius and the soft elevation shadow. Images within cards should have their top corners rounded to 12px to match the container.

### Chips & Badges
- **Verified Badge:** Sea Green (#2A9D8F) background with White text, 8px radius, using the `label-sm` typography style.
- **Category Chips:** Light Navy (Primary at 10% opacity) with Primary colored text.

### Input Fields
Background is White (#FFFFFF) with a 1px border of `#D1CDC2`. On focus, the border transitions to Deep Navy (#002B49) with a subtle glow.

### Lists
Lists for service features use the Sea Green color for checkmarks. Spacing between list items is 12px to ensure clear vertical rhythm.