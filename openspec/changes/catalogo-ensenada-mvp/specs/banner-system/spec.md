# banner-system Specification

## Purpose

Advertising banner system with admin CRUD, impression/click tracking, expiration dates, category targeting, and frontend rendering by slot position. Banners are the only monetization mechanism in the MVP.

## Requirements

### Requirement: Banner Data Model

The system MUST store banners with the following fields: id, image (URL or path), title, description, link (URL), startDate, endDate, targetCategory (slug, optional), slot (sidebar-left, sidebar-right, profile), impressions (counter), clicks (counter), and active status derived from date range.

### Requirement: Admin Banner CRUD — List

The system MUST display a table of all banners at `/admin/banners`.

#### Scenario: Banner table renders

- GIVEN there are 10 banners in the database
- WHEN `/admin/banners` is rendered
- THEN a table displays: title, slot, target category (or "Todas"), active/inactive status (derived from dates), impressions, clicks, and action buttons (Edit, Delete)
- AND banners are sorted by creation date descending

#### Scenario: Empty banner table

- GIVEN no banners exist
- WHEN `/admin/banners` is rendered
- THEN the table area shows "No hay banners registrados"
- AND a "Crear primer banner" CTA button links to the create form

### Requirement: Admin Banner CRUD — Create

The system MUST provide a form at `/admin/banners/nuevo` with all banner fields.

#### Scenario: Banner create form renders

- WHEN `/admin/banners/nuevo` is rendered
- THEN the form includes fields for: image (file upload or URL input), title, description, link (URL), startDate, endDate, targetCategory (optional select, default "Todas las categorías"), slot (radio or select: sidebar-left, sidebar-right, profile)
- AND impressions and clicks fields are NOT visible (auto-initialized to 0)

#### Scenario: Successful banner creation

- GIVEN a valid banner submission with `slot: sidebar-left`, dates spanning next month, and `targetCategory: restaurantes`
- WHEN the form is POSTed
- THEN the banner is saved with `impressions: 0` and `clicks: 0`
- AND the user is redirected to `/admin/banners` with success message

#### Scenario: Banner date validation

- GIVEN a banner form with `endDate` before `startDate`
- WHEN the form is POSTed
- THEN the form re-renders with error "La fecha de fin debe ser posterior a la de inicio"

### Requirement: Admin Banner CRUD — Edit and Delete

The system MUST support editing and deleting banners, mirroring the business CRUD patterns.

#### Scenario: Edit banner with pre-filled form

- GIVEN banner ID 7 exists with all fields
- WHEN `/admin/banners/7/editar` is rendered
- THEN the same form as create renders, pre-filled
- AND impression and click counters are displayed as read-only values

#### Scenario: Delete banner with confirmation

- GIVEN banner ID 7 exists
- WHEN the admin clicks "Eliminar" and confirms
- THEN the banner is deleted from the data store
- AND the user is redirected to `/admin/banners` with success message

### Requirement: Banner Impression Tracking

The system MUST increment a banner's `impressions` counter each time it is rendered on a public page.

#### Scenario: Impression counted on render

- GIVEN banner ID 7 is active (current date within startDate–endDate) and has `slot: sidebar-left`
- WHEN the home page renders and includes banner 7 in the left sidebar
- THEN the banner's `impressions` counter increments by 1
- AND the increment happens server-side (not client-side JS)

#### Scenario: Inactive banner not counted

- GIVEN banner ID 7 has `endDate` in the past (expired)
- WHEN any public page renders
- THEN banner 7 is NOT rendered (active banners only)
- AND its `impressions` counter does NOT increment

### Requirement: Banner Click Tracking

The system MUST provide a click-tracking endpoint and increment the `clicks` counter when a banner link is clicked.

#### Scenario: Click tracked via redirect endpoint

- GIVEN banner ID 7 has `link: "https://example.com/promo"`
- WHEN a user clicks on banner 7
- THEN the browser navigates to an internal tracking URL (e.g., `/api/banner/7/click`)
- AND the endpoint increments banner 7's `clicks` counter by 1
- AND the endpoint responds with a 302 redirect to `https://example.com/promo`

#### Scenario: Banner click with no tracking JS

- GIVEN JavaScript is disabled in the browser
- WHEN a user clicks on banner 7
- THEN the `<a>` tag still links directly to `https://example.com/promo` (href fallback)
- AND the click counter MAY not increment (graceful degradation)

### Requirement: Banner Frontend Rendering

The system MUST render active banners in their assigned slots on public pages, respecting category targeting.

#### Scenario: Banner renders in correct slot

- GIVEN banner 7 is active, `slot: sidebar-left`, and `targetCategory: null` (all categories)
- WHEN the home page renders
- THEN banner 7 renders in the left sidebar position
- AND the banner displays: image, title, description, and a "SPONSORED" or "Promovido" badge

#### Scenario: Category-targeted banner shown on matching page

- GIVEN banner 7 is active, `targetCategory: "restaurantes"`, `slot: sidebar-right`
- WHEN `/restaurantes` is rendered
- THEN banner 7 renders in the right sidebar position
- AND impressions increment

#### Scenario: Category-targeted banner hidden on non-matching page

- GIVEN banner 7 has `targetCategory: "restaurantes"`
- WHEN `/electricistas` is rendered
- THEN banner 7 MUST NOT render in any slot
- AND its impression counter does NOT increment

#### Scenario: Banner expired — not shown

- GIVEN banner 7 has `endDate` before today
- WHEN any public page renders
- THEN banner 7 MUST NOT render

#### Scenario: Banner not yet started — not shown

- GIVEN banner 7 has `startDate` after today
- WHEN any public page renders
- THEN banner 7 MUST NOT render

#### Scenario: Multiple banners in same slot — rotation

- GIVEN 3 active banners all have `slot: sidebar-right` and `targetCategory: null`
- WHEN a public page renders
- THEN one banner is selected per render (deterministic rotation, e.g., round-robin or random)
- AND only ONE banner renders in the sidebar-right slot at a time
- AND different page visits MAY show different banners

#### Scenario: Banner in profile slot

- GIVEN banner 7 is active with `slot: profile`
- WHEN `/negocio/hotel-pacifico` renders
- THEN banner 7 renders within the profile page (not in sidebars)
- AND the "SPONSORED" badge is displayed

### Requirement: Banner Visual Design

The system MUST render banners with a "Promovido" or "SPONSORED" badge following the DESIGN.md visual language.

#### Scenario: Banner with sponsored badge

- GIVEN any active banner
- WHEN it renders on a public page
- THEN the banner includes a prominent "SPONSORED" or "Promovido" badge in label-sm typography
- AND the badge uses a muted/translucent style distinct from content
- AND the overall banner uses the design system's card styling (white surface, soft shadow, 12px radius)
