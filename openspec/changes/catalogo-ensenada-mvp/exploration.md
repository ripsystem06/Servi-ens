# Exploration: catalogo-ensenada-mvp

## Current State

The project is a greenfield Astro v7 project at `/home/rip/Documentos/catalogo`. No scaffolding exists yet (`git init` done, no `astro create`). The design phase produced three desktop-only HTML prototypes (Tailwind CDN + Google Material Symbols) that define the visual language and page structure. A comprehensive DESIGN.md establishes the Modern Coastal design system.

The MVP scope was decided in prior sessions:
- Gratuito + pago por destacado, manejo manual por admin (sin pasarela de pagos)
- SIN estrellas de calificación, reemplazado por badge "Verificado" (booleano)
- Hero rotativo automático, banners publicitarios laterales
- Stack: Astro v7, pnpm, Tailwind CSS
- Paleta: azul marino #001629, coral #E76F51, crema/arena #fcf9f2
- Tipografía: Montserrat (headlines) + Inter (body)

## Affected Areas

All areas are affected — this is a greenfield build. Key source materials:

- `catalogo_previo/baja_coastal_catalog/DESIGN.md` — Design system (colors, typography, spacing, elevation, shapes, components)
- `catalogo_previo/inicio_cat_logo_ensenada_desktop/code.html` — Home page prototype (navbar, category sidebar, hero, service grid, banner ads, footer)
- `catalogo_previo/perfil_de_negocio_desktop/code.html` — Business profile prototype (header, about, services, gallery, hours, map, sidebar ad)
- `catalogo_previo/panel_de_administraci_n_desktop/code.html` — Admin dashboard prototype (sidebar, stat cards, registration table, engagement chart, banner manager)

## Pages/Views Analysis

### Views Needed for MVP

| View | Route | Source Proto | Priority |
|------|-------|-------------|----------|
| Home (index) | `/` | inicio_cat_logo | P0 |
| Business Profile | `/negocio/[slug]` | perfil_de_negocio | P0 |
| Category Listing | `/categoria/[slug]` | *implied* (no proto) | P0 |
| Search Results | `/buscar` | *implied* (search bar exists) | P1 |
| Admin Dashboard | `/admin` | panel_admin | P1 |
| Add Listing | `/agregar` | *navbar link* (no proto) | P2 |
| Sign In | `/entrar` | *navbar link* (no proto) | P2 |
| Static Pages | `/acerca`, `/contacto`, `/privacidad`, `/terminos` | *footer links* (no proto) | P2 |

### Shared Components (Reused Across Prototypes)

| Component | Appears In | Notes |
|-----------|-----------|-------|
| **Navbar** | All 3 protos | Logo, nav links, search bar, auth buttons. Minor variations between pages. |
| **Footer** | All 3 protos | Brand description, 3-column link grid, copyright. Identical structure. |
| **ServiceCard** | Home | Image, verified badge, name, tagline, rating*, CTA buttons (Call + WhatsApp) |
| **VerifiedBadge** | Home + Profile | Sea green #2A9D8F bg, white text, check icon. 8px radius. |
| **BannerAd** | Home (sidebar + right) + Profile | Square (aspect-square) and portrait (aspect-[3/4], aspect-[4/5]) variants |
| **CategoryChip** | Home sidebar, admin table | Category labels with icons |
| **Breadcrumb** | Profile | Home > Category > Business name |
| **StatCard** | Admin | 4 cards with icon, label, value |
| **CoastalShadow** | All 3 protos | CSS class `.coastal-shadow`: `0 4px 12px rgba(0,0,0,0.05)` |
| **HoverLift** | Home, Profile | CSS class `.hover-lift`: `translateY(-4px)` on hover |

*Note: The prototypes include star ratings despite the MVP decision to skip them. See Risks section.*

## Data Model (Entities per View)

### Home Page Data
```
Category: id, name, slug, icon
FeaturedService (hero): id, name, description, image, category
Service (grid): id, name, tagline, image, is_verified, phone, whatsapp, category, rating?*
Banner: id, title, description, image_url, link_url, type(sponsored|internal), status(active|expired)
```

### Business Profile Data
```
Business: id, slug, name, tagline, description(about), category, is_verified, phone, whatsapp, 
          address, neighborhood, city, zip, lat, lng
Service: id, name, business_id (FK)
GalleryImage: id, url, alt, business_id (FK)
OperatingHours: id, business_id, day_of_week(0-6), open_time, close_time, is_closed
```

### Admin Dashboard Data
```
Stats: total_businesses, pending_verifications, active_banners, monthly_growth
RecentRegistration: business_name, category, email, status(verified|pending)
EngagementPoint: date, views
```

## Static vs Dynamic Analysis

### Static (SSG — Astro `.astro` files, zero JS)
- Home page layout, category sidebar links
- All business profile pages (pre-rendered from data)
- Category listing pages (pre-rendered from data)
- Footer, About, Contact, Privacy, Terms
- Banner displays (static placement)
- Admin dashboard (static snapshot for MVP)

### Dynamic (Needs JS — Astro Islands)
- **Hero rotativo**: auto-rotation timer + dot navigation + crossfade transition → needs JS island
- **Search bar**: real-time or submit-based search → needs client-side JS (Pagefind recommended for SSG)
- **Navbar scroll shrink**: vanilla JS, tiny (~20 lines)
- **Mobile hamburger menu**: toggle menu → vanilla JS or CSS-only `<details>/<summary>`
- **Gallery hover effects** (profile page): could be pure CSS `:hover` + `transform`
- **Admin stats/charts**: for MVP with static data, no JS needed. Real-time comes later.
- **Card hover-lift**: already pure CSS in prototypes — CSS only

### Concrete JS Requirements
| Feature | JS Needed? | Approach |
|---------|-----------|----------|
| Hero rotativo | Yes | Preact island or vanilla Web Component |
| Search | Yes | Pagefind (SSG-compatible, zero-config) |
| Navbar scroll | Yes | Vanilla JS `<script>` in BaseLayout |
| Mobile menu | Yes | Vanilla JS or CSS-only |
| Gallery hover | No | Pure CSS `:hover` |
| Card hover-lift | No | Pure CSS `transition` |
| Dashboard charts | No (MVP) | Static bars (CSS) |

## Astro Architecture Mapping

```
src/
├── pages/
│   ├── index.astro                    # Home — SSG
│   ├── categoria/[slug].astro         # Category listing — SSG (getStaticPaths)
│   ├── negocio/[slug].astro           # Business profile — SSG (getStaticPaths)
│   ├── buscar.astro                   # Search results — SSG + Pagefind island
│   ├── admin/index.astro              # Admin dashboard — SSG
│   ├── acerca.astro                   # Static page
│   ├── contacto.astro                 # Static page
│   └── privacidad.astro               # Static page
├── components/
│   ├── layout/
│   │   ├── BaseLayout.astro           # HTML shell: fonts, meta, global CSS
│   │   ├── Navbar.astro               # Shared navbar (with scroll JS)
│   │   └── Footer.astro               # Shared footer
│   ├── home/
│   │   ├── HeroRotativo.astro         # Island — auto-rotating hero
│   │   ├── ServiceCard.astro          # Reusable card
│   │   ├── CategorySidebar.astro      # Category nav with icons
│   │   └── BannerAd.astro             # Square/vertical variants via props
│   ├── negocio/
│   │   ├── BusinessHeader.astro       # Name, verified, phone CTA
│   │   ├── ServiceList.astro          # Checkmark list
│   │   ├── Gallery.astro              # Image grid
│   │   ├── HoursTable.astro           # Day/time rows
│   │   └── MapEmbed.astro             # Static map placeholder
│   ├── admin/
│   │   ├── AdminLayout.astro          # Sidebar + main layout
│   │   ├── StatCard.astro             # Icon + label + value
│   │   ├── BusinessTable.astro        # Recent registrations table
│   │   └── BannerManager.astro        # Banner CRUD placeholder
│   └── ui/
│       ├── Breadcrumb.astro           # Reusable breadcrumb
│       ├── SearchBar.astro            # Search input (island)
│       └── VerifiedBadge.astro        # Green verified chip
├── data/
│   ├── categories.json                # Category list
│   ├── businesses.json                # All business records
│   ├── banners.json                   # Active banners
│   └── site.json                      # Site config (name, tagline)
├── styles/
│   └── global.css                     # Tailwind directives + custom utilities
└── assets/
    └── images/                        # Optimized via Astro Image
```

**Data Strategy for MVP**: JSON files in `src/data/`. For SSG, Astro's `getStaticPaths()` generates one page per business/category from these files. No CMS or database needed for launch.

**Icon Strategy**: Replace Google Material Symbols (~200KB icon font) with a lighter tree-shakable set like Lucide or Phosphor. Material Symbols is downloaded twice in the prototypes (duplicate link tags).

## Responsive Gaps

The 3 prototypes are **desktop-only** (1280px max-width, 12-column grid). Key responsive gaps:

| Gap | Location | Severity |
|-----|----------|----------|
| No mobile hamburger menu | Navbar — nav links are `hidden lg:flex` | Critical |
| Sidebars don't collapse | Home page sidebar (categories + ads) stays at `lg:col-span-2`/`lg:col-span-3` | Critical |
| Hero fixed height 400px | Home hero — no scaling for mobile | High |
| Business profile sidebar collapse | `lg:col-span-8` + `lg:col-span-4` layout, sidebar below on mobile | High |
| Admin sidebar hidden on mobile | `hidden md:flex` — no toggle to show | High |
| Service card image height | Fixed `h-48` (192px) — may need adjustment on small screens | Medium |
| Gallery 2x2 grid | Profile page — stays 2x2, could become 3-4 columns on mobile | Low |
| Table horizontal scroll | Already has `overflow-x-auto` — handled | Low |
| Footer stacking | Already has `flex-col md:flex-row` — handled | Low |

DESIGN.md does define responsive breakpoints (desktop 12-col, tablet 8-col, mobile 4-col with 16px gutters), so the design system is responsive-ready — the prototypes just didn't implement it.

## Issues Found

1. **Star ratings in prototypes contradict MVP decision**: The service cards show star ratings (4.9, 4.8, 4.7, 5.0) and the business profile shows 5-star visual + "(124 Reviews)". The MVP decision was verified-only (boolean). This needs to be reconciled in the spec phase.

2. **Duplicate Material Symbols link tags**: All three prototypes load the icon font stylesheet twice (`<link>` repeated). The real implementation should load it once.

3. **Tailwind CDN in prototypes**: The prototypes use `cdn.tailwindcss.com` (runtime compiler). Production must use the Tailwind v4 plugin for Astro with `@tailwindcss/vite`.

4. **Admin authentication not designed**: The admin button is just a `<button>` with no auth flow. Need to decide: simple password protection, environment-based, or full auth.

5. **No search results page design**: Search bar exists in navbar but there's no prototype for the results page.

6. **"Add Listing" page not designed**: Navbar link exists but no form prototype.

## Recommendation

The MVP is well-scoped and the design direction is clear. The phase should proceed to **sdd-propose**. Key decisions to resolve during propose/spec:

1. Adopt Pagefind for search (SSG-compatible, no backend needed)
2. Choose icon library (Lucide recommended — tree-shakable, 1/10th the weight of Material Symbols)
3. Resolve star-rating discrepancy: either remove from design or re-scope MVP
4. Data format: JSON files in `src/data/` with Astro `getStaticPaths()` for SSG
5. Island framework: Preact recommended (lightweight, Astro-official integration)
6. Admin auth: simple environment-based password for MVP (no user DB)

## Risks

- **Design-data mismatch**: Prototypes show star ratings but MVP decided verified-only. Must reconcile in spec phase or the implementer will be confused.
- **No mobile designs exist**: The responsive grid from DESIGN.md provides guidance, but mobile layouts require interpretation. Risk of design drift from the desktop vision.
- **Material Symbols weight**: ~200KB icon font loaded in all prototypes. Switching to Lucide/Phosphor is a scoping decision for sdd-design.
- **Image strategy undefined**: All prototypes use placeholder SVGs. Real images need Astro Image optimization, responsive srcsets, and lazy loading — a design-phase concern.
- **Admin security**: No auth flow designed. Even a simple password gate needs design consideration (HTTP basic auth? Session cookie? Environment variable?).
- **Search complexity**: Pagefind works for SSG but requires build-time indexing. If the catalog grows to thousands of entries, this may need rethinking.

## Ready for Proposal

Yes — proceed to `sdd-propose`.
