# design-system Specification

## Purpose

Implementation of the Modern Coastal design system from `catalogo_previo/baja_coastal_catalog/DESIGN.md`. Includes Tailwind token mappings, typography configuration, base components, layout grid, and utility classes. All visual consistency in the project flows from this spec.

## Requirements

### Requirement: Color Token Mapping

The system MUST map all DESIGN.md color tokens to Tailwind CSS custom theme values, preserving semantic intent.

#### Scenario: Primary and surface colors available as Tailwind classes

- GIVEN `tailwind.config.ts` is configured with custom theme extensions
- WHEN a developer uses `bg-primary`, `text-primary`, `bg-surface`, or `text-on-surface`
- THEN the rendered colors match DESIGN.md:
  - `primary`: `#001629` (deep navy)
  - `on-primary`: `#ffffff`
  - `surface` / `background`: `#fcf9f2` (sand/cream)
  - `on-surface` / `on-background`: `#1c1c18`

#### Scenario: Accent and semantic colors available

- GIVEN the Tailwind config is loaded
- WHEN `bg-accent`, `text-accent`, `bg-success`, or `text-success` are used
- THEN colors match: accent/coral `#E76F51`, success/teal `#2A9D8F`
- AND error red `#ba1a1a` is available for validation states

#### Scenario: Color contrast meets accessibility

- GIVEN the design system is applied to all components
- WHEN Lighthouse accessibility audit runs
- THEN color contrast ratio is ≥ 4.5:1 for normal text and ≥ 3:1 for large text
- AND the site scores ≥ 95 on Lighthouse accessibility

### Requirement: Typography Configuration

The system MUST configure Montserrat (headlines) and Inter (body) with DESIGN.md scale values in Tailwind.

#### Scenario: Headline classes render Montserrat at correct sizes

- GIVEN Tailwind `fontFamily.sans` is set to Inter and `fontFamily.headline` to Montserrat
- WHEN `font-headline text-headline-xl`, `text-headline-lg`, `text-headline-md` are used
- THEN each renders Montserrat at correct size/weight/line-height per DESIGN.md:
  - `headline-xl`: 48px, 700, 56px, -0.02em
  - `headline-lg`: 32px, 700, 40px, -0.01em
  - `headline-md`: 24px, 600, 32px

#### Scenario: Body and label classes render Inter

- GIVEN Tailwind is configured
- WHEN `text-body-lg`, `text-body-md`, `text-label-md`, `text-label-sm` are used
- THEN each renders Inter at correct specs per DESIGN.md:
  - `body-lg`: 18px, 400, 28px
  - `body-md`: 16px, 400, 24px
  - `label-md`: 14px, 600, 20px, 0.01em
  - `label-sm`: 12px, 500, 16px

#### Scenario: Mobile headline sizes adapt at breakpoints

- GIVEN the viewport is ≤ 767px
- WHEN `text-headline-lg` is used
- THEN a mobile-first responsive variant renders at `text-headline-lg-mobile`: 28px, 700, 36px
- AND at ≥ 768px it renders at full `headline-lg`: 32px, 700, 40px

### Requirement: Base Components

The system MUST provide at least the following composable UI primitives: Button, Card, Chip/Badge, and Input.

#### Scenario: Button variants render correctly

- GIVEN a `<Button>` or equivalent styled element is rendered
- WHEN `variant="primary"` is applied
- THEN the button has Coral background (`#E76F51`), white text, 8px border radius, bold Inter font
- WHEN `variant="secondary"` is applied
- THEN the button has an outline stroke of Deep Navy (`#002B49`), transparent background, 1.5px border
- WHEN `variant="ghost"` is applied
- THEN the button has no background, no border, Deep Navy text

#### Scenario: ServiceCard component renders

- GIVEN a business data object
- WHEN `<ServiceCard>` or equivalent renders
- THEN the card has White surface (`#ffffff`), 12px border radius, and soft shadow (`0 4px 12px rgba(0,0,0,0.05)`)
- AND if the business has images, the top image has 12px top border radius
- AND the card includes: business name, category chip, zone, verified badge (if applicable), and a truncated description

#### Scenario: Chips and badges render

- GIVEN a category chip is rendered
- WHEN `<Chip>` or equivalent is used
- THEN it renders with navy color at 10% opacity background and navy text, 8px border radius, `label-sm` typography
- AND the Verified badge renders with teal background (`#2A9D8F`), white text, as separate component

#### Scenario: Input field renders with focus state

- GIVEN an input field is rendered
- WHEN the field has default state
- THEN it uses white background, 1px border in `#D1CDC2`, and 8px border radius
- WHEN the field receives focus
- THEN the border transitions to Deep Navy (`#002B49`)
- AND a subtle glow/shadow appears around the input

### Requirement: Layout Grid System

The system MUST implement the fluid grid from DESIGN.md: container max-width 1280px, 12/8/4 column responsive breakpoints, and 8px base spacing unit.

#### Scenario: Container constrains content width

- GIVEN any page's main content
- WHEN the viewport is ≥ 1280px
- THEN a container wrapper limits content to max-width 1280px
- AND the container is centered horizontally

#### Scenario: Section and gutter spacing consistent

- GIVEN the layout is rendered
- WHEN section padding is applied
- THEN sections use consistent 24px or 48px padding
- AND grid gutters are 24px (desktop/tablet) and 16px (mobile)
- AND all spacing values (padding, margin, gap) are multiples of 8px base unit

#### Scenario: Breakpoint grid changes

- GIVEN Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- WHEN `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` is applied to a service card grid
- THEN mobile (≤ 767px) shows 1 card per row, tablet shows 2, desktop shows 3
- AND this maps to DESIGN.md's 4-column, 8-column, and 12-column grid philosophy

### Requirement: Utility Classes

The system MUST provide CSS utility classes for the design system's characteristic effects: coastal shadow, hover lift, glass effect, and hero gradient.

#### Scenario: coastal-shadow applies soft elevation

- GIVEN an element with class `coastal-shadow`
- WHEN it renders
- THEN the box-shadow is `0 4px 12px rgba(0,0,0,0.05)` (as specified in DESIGN.md elevation)
- AND the shadow is consistent across all viewport sizes

#### Scenario: hover-lift animates on hover

- GIVEN a ServiceCard with class `hover-lift`
- WHEN the user hovers over it
- THEN the card translates upward slightly (`transform: translateY(-4px)`)
- AND the shadow intensifies
- AND the transition is smooth (200–300ms ease)

#### Scenario: glass-effect creates translucent overlay

- GIVEN an element with class `glass-effect`
- WHEN it renders over a background
- THEN it has a semi-transparent background with backdrop-blur
- AND it is used for navbar scroll effect or overlay elements

#### Scenario: hero-gradient creates coastal overlay

- GIVEN the hero carousel with class `hero-gradient`
- WHEN it renders
- THEN an overlay gradient transitions from navy/transparent to navy/solid toward the bottom
- AND text overlays on hero slides remain readable against any image
