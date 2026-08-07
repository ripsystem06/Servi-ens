# public-catalog Specification

## Purpose

Static public-facing pages for the Ensenada service directory. All content is generated at build time from local JSON data (`src/data/`). Interactive islands use Preact (hero carousel) and vanilla JS (navbar, mobile menu). Search is client-side via Pagefind.

## ROUTES

| Route | Page | Method |
|-------|------|--------|
| `/` | Home | SSG |
| `/buscar` | Search Results | SSG |
| `/{category}` | Category Listing | SSG |
| `/zona/{zone}` | Zone Listing | SSG |
| `/negocio/{slug}` | Business Profile | SSG |

## Requirements

### Requirement: Home Page

The system MUST render a complete home page at `/` with all sections: navbar, hero carousel, category sidebar, popular services grid, side banners, and footer.

#### Scenario: Full home page renders

- GIVEN the `src/data/` directory contains businesses, categories, banners, and zones
- WHEN the site is built (`pnpm build`) and `/` is requested
- THEN the page renders a full HTML document with all semantic sections
- AND all section placeholders are populated from data files
- AND the HTML output passes Lighthouse SEO 100 and a11y ≥ 95

#### Scenario: Home page with empty data

- GIVEN `src/data/businesses.json` is an empty array and `src/data/banners.json` is an empty array
- WHEN `/` is rendered at build time
- THEN the page renders without crashing
- AND the hero carousel section is hidden (no featured services)
- AND the "Servicios populares" grid shows a "Próximamente" empty state message
- AND banner sidebars are hidden

#### Scenario: Hero carousel behavior

- GIVEN at least one business has `destacado: true`
- WHEN `/` is rendered
- THEN the hero section shows a Preact-powered carousel with those featured businesses
- AND the carousel auto-rotates every 5 seconds
- AND manual navigation (dots/arrows) pauses auto-rotation for 10 seconds
- AND each slide displays the business name, category, zone, and a CTA link to its profile

#### Scenario: Category sidebar renders all categories

- GIVEN `src/data/categories.json` contains 8 categories with names, slugs, and icons
- WHEN `/` is rendered
- THEN a sidebar lists all 8 categories in order
- AND each category links to `/{slug}` using its Lucide icon
- AND the currently active category (if any) is visually highlighted

### Requirement: Category Listing Page

The system MUST render a filtered listing page at `/{category-slug}` showing only businesses of that category.

#### Scenario: Valid category page renders

- GIVEN the category "electricistas" exists with slug `electricistas`
- AND 5 businesses have `category: "electricistas"`
- WHEN `/electricistas` is requested
- THEN the page heading displays "Electricistas {N} servicios"
- AND a grid of 5 ServiceCards renders
- AND the category sidebar highlights "electricistas" as active

#### Scenario: Valid category with no businesses

- GIVEN the category "jardineros" exists but no businesses match it
- WHEN `/jardineros` is requested
- THEN the page heading displays "Jardineros 0 servicios"
- AND an empty state message "No hay servicios en esta categoría todavía" renders

#### Scenario: Invalid category slug

- GIVEN no category has slug `inexistente`
- WHEN `/inexistente` is requested
- THEN the system MUST return a 404 page with a "Categoría no encontrada" message
- AND a link back to the home page

### Requirement: Zone Listing Page

The system MUST render a listing page at `/zona/{zone-slug}` filtering businesses by geographic zone.

#### Scenario: Valid zone page renders

- GIVEN the zone "ensenada" exists and 10 businesses have `zone: "ensenada"`
- WHEN `/zona/ensenada` is requested
- THEN the page heading displays "Ensenada — {N} servicios"
- AND businesses from that zone render as ServiceCards
- AND the page title includes the zone name for SEO

#### Scenario: Valid zone with no businesses

- GIVEN the zone "la-bufadora" exists but no businesses match it
- WHEN `/zona/la-bufadora` is requested
- THEN an empty state message renders: "No hay servicios en esta zona todavía"

### Requirement: Business Profile Page

The system MUST render a detailed business profile at `/negocio/{slug}`.

#### Scenario: Full business profile renders

- GIVEN a business with slug `hotel-pacifico` exists with all fields populated
- WHEN `/negocio/hotel-pacifico` is requested
- THEN the page renders a breadcrumb: Home > {category} > {business name}
- AND a header with the business name, category chip, and verified badge (if applicable)
- AND a "Sobre nosotros" section with the description
- AND a services list with checkmark icons
- AND a gallery section with the business's photos
- AND a schedule section with business hours
- AND a location section showing the zone name
- AND contact information: phone number (clickable `tel:`) and WhatsApp link
- AND the page `<title>` is `{business name} — Catálogo Ensenada`

#### Scenario: Business with minimal data (no photos, no schedule)

- GIVEN business has slug `minimal-service` with name, description, and phone but no `photos` array and no `schedule`
- WHEN `/negocio/minimal-service` is requested
- THEN the profile renders all available sections
- AND the gallery section is hidden
- AND the schedule section is hidden
- AND the page does NOT crash due to missing optional fields

#### Scenario: Invalid business slug

- GIVEN no business exists with slug `inexistente`
- WHEN `/negocio/inexistente` is requested
- THEN the system MUST return a 404 page with "Negocio no encontrado"
- AND a link to return home

### Requirement: Search Functionality

The system MUST provide a search bar in the navbar that navigates to `/buscar` with a query parameter, powered by Pagefind (client-side full-text search).

#### Scenario: Search with results

- GIVEN the user types "electricista" in the navbar search bar
- WHEN the form is submitted or Enter is pressed
- THEN the browser navigates to `/buscar?q=electricista`
- AND the page displays the search term in the heading: "Resultados para: electricista"
- AND a counter: "{N} servicios encontrados"
- AND matching businesses render as ServiceCards

#### Scenario: Search with no results

- GIVEN a search for "fontanero" returns zero matches
- WHEN `/buscar?q=fontanero` is rendered
- THEN the page shows "No se encontraron resultados para: fontanero"
- AND suggests browsing categories as an alternative

#### Scenario: Empty search query

- GIVEN the user navigates to `/buscar` without a query parameter
- WHEN the page renders
- THEN the heading shows "Buscar servicios"
- AND a search input is prominently displayed (no results yet)

### Requirement: Responsive Layout

The system MUST render layout-appropriate grids per viewport: 4-column (mobile ≤ 767px), 8-column (tablet 768px–1023px), 12-column (desktop ≥ 1024px).

#### Scenario: Mobile viewport renders 4-column grid

- GIVEN the viewport is 375px wide
- WHEN any catalog page is rendered
- THEN the service card grid uses 1 card per row (4-column grid)
- AND the category sidebar collapses into a horizontal scroll or dropdown
- AND the navbar shows a hamburger menu for navigation

#### Scenario: Tablet viewport renders 8-column grid

- GIVEN the viewport is 820px wide
- WHEN any catalog page is rendered
- THEN the service card grid uses 2 cards per row (8-column grid)

#### Scenario: Desktop viewport renders 12-column grid

- GIVEN the viewport is 1280px wide
- WHEN any catalog page is rendered
- THEN the service card grid uses 3 cards per row (12-column grid)
- AND the category sidebar is visible as a vertical sidebar
- AND the container max-width is 1280px, centered

#### Scenario: No horizontal scroll on any viewport

- GIVEN the viewport is any width from 375px to 1920px
- WHEN any page is rendered
- THEN the document MUST NOT have horizontal overflow
- AND all content fits within the viewport width
