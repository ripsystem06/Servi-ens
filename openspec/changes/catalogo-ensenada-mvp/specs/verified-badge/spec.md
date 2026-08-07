# verified-badge Specification

## Purpose

Boolean verification badge for businesses. The ONLY trust signal in the MVP — no stars, no review counts, no numeric ratings. A business is either "Verified" (trusted by the platform) or not. Simplicity is the feature.

## Requirements

### Requirement: Verified Badge Visual

The system MUST render a visual badge with a specific design when a business's `verified` field is `true`.

#### Scenario: Verified badge on business profile

- GIVEN a business has `verified: true`
- WHEN `/negocio/{slug}` renders
- THEN the profile header displays a badge with Sea Green background (`#2A9D8F`), white text, and an 8px border radius
- AND the badge contains a check icon (Lucide `Check` or `CheckCircle`) and the text "Verified"
- AND the badge uses `label-sm` typography (Inter, 12px, weight 500)
- AND the badge is positioned next to the business name in the header

#### Scenario: Verified badge on service cards

- GIVEN a business has `verified: true`
- WHEN a ServiceCard for this business renders in any listing (home, category, zone, search)
- THEN the card displays the same Verified badge (same color, icon, text, typography) next to or below the business name

#### Scenario: Non-verified business shows no badge

- GIVEN a business has `verified: false` or the field is absent
- WHEN any page renders this business
- THEN NO Verified badge is displayed
- AND no placeholder, empty badge area, or "Not verified" text appears
- AND the layout does not shift (no reserved space for missing badge)

### Requirement: No Rating System

The system MUST NOT display or store any rating mechanism beyond the `verified` boolean.

#### Scenario: No star ratings on any page

- GIVEN the `Business` data model has no `rating`, `stars`, or `reviews_count` fields
- WHEN any public or admin page renders
- THEN zero star ratings appear anywhere on the page
- AND no empty star placeholders are rendered
- AND the word "estrellas", "rating", or "puntuación" does not appear in any UI text outside of the admin edit form

#### Scenario: No review counts

- GIVEN no review functionality exists in the system
- WHEN any page renders a ServiceCard or business profile
- THEN no review count or review link appears
- AND there is no "Escribir reseña" or "Ver reseñas" button or link

### Requirement: Verified Filtering

The system MUST support filtering by verified status in admin listing tables (optional for public pages in MVP).

#### Scenario: Admin filters by verified status

- GIVEN the admin is on `/admin/negocios`
- WHEN the admin applies a "Verified" filter or sorts by status column
- THEN only businesses with `verified: true` are shown in the table

#### Scenario: No public "verified only" filter in MVP

- GIVEN a public user browsing the catalog
- WHEN any public page renders
- THEN there is no "Solo verificados" filter toggle
- AND verified and non-verified businesses are shown together
- AND the verified badge is the only visual differentiator

### Requirement: Verified Badge Accessibility

The system MUST ensure the Verified badge is accessible to assistive technologies.

#### Scenario: Screen reader announces verified status

- GIVEN a business has `verified: true`
- WHEN a screen reader encounters the Verified badge
- THEN the badge or its parent element includes `aria-label="Negocio verificado"` or equivalent
- AND the badge icon has `aria-hidden="true"`

#### Scenario: Non-verified businesses are not misrepresented

- GIVEN a business has `verified: false`
- WHEN a screen reader navigates the business listing
- THEN no "verified" or "no verificado" text is announced for that business
- AND the absence of the badge is neutral — not marked as a negative attribute
