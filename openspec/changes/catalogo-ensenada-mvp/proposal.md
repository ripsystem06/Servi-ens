# Proposal: Catálogo Ensenada MVP

## Intent

Build a statically-generated web directory for local services in Ensenada, Baja California. Businesses need discoverability; locals and tourists need a fast, trustworthy catalog. The site serves as a premium showcase with zero runtime cost beyond hosting. Target audience: tourists exploring Ensenada + Valle de Guadalupe + Sauzal + Maneadero + La Bufadora, and locals finding verified services.

## Scope

### In Scope
- Public-facing directory: Home, Category listing, Service profile, Search (Pagefind)
- Admin dashboard (login-protected): CRUD businesses, manage banners
- Banner system: rotation, impression/click tracking, expiration dates, category segmentation
- "Verificado" badge (boolean) — the only rating mechanism. No stars, no reviews.
- Dynamic hero rotativo (Preact island), navbar scroll effects, mobile menu
- Data layer: JSON files in `src/data/` consumed by `getStaticPaths()` — no CMS/DB for public content
- Admin auth: full login form, session-based, user/password DB
- Responsive: 12-col desktop, 8-col tablet, 4-col mobile per DESIGN.md

### Out of Scope
- Public business submission form — admin-only manual carga in MVP
- Star ratings, user reviews, user accounts (beyond admin login)
- Payment processing, featured listings automation (manual for MVP)
- Maps integration, geolocation, distance search
- CMS integration, API endpoints, SSR beyond admin routes

## Capabilities

### New Capabilities
- `public-catalog`: Home page, category listing, service profiles, search — all SSG
- `admin-dashboard`: Login-protected admin panel for business and banner CRUD
- `banner-system`: Rotating banners with impression/click tracking, expiration, category targeting
- `verified-badge`: Boolean verification status per business, no rating system
- `design-system`: Modern Coastal design tokens, responsive grid, component library

## Approach

**Astro v7 SSG-first architecture.** Public pages are static HTML generated at build time from local JSON data. Interactive islands: Preact for hero rotativo, vanilla JS for navbar/menu, Pagefind for client-side search. Admin routes use Astro SSR with session-based auth via a lightweight SQLite DB. Tailwind CSS with design tokens from DESIGN.md. Lucide icons (tree-shakable) replace Material Symbols (200KB font). Zero CMS dependency — content lives in `src/data/`.

**Conceptual data model**: `Business` (name, description, category, zone, contact, photos, verified, destacado), `Banner` (image, link, impressions, clicks, expiry, targetCategory), `Category` (name, slug, icon), `Zone` (name, slug, parent). Admin `User` table for auth.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/` | New | All routes: `index.astro`, `[category].astro`, `negocio/[slug].astro`, `buscar.astro`, `admin/` |
| `src/layouts/` | New | BaseLayout, AdminLayout |
| `src/components/` | New | Shared UI (ServiceCard, VerifiedBadge, Banner, Navbar, Footer, Hero) + Preact islands |
| `src/data/` | New | JSON fixtures: businesses, categories, banners, zones |
| `tailwind.config.ts` | New | Design tokens from DESIGN.md |
| `openspec/` | Existing | SDD artifacts, no code changes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Admin auth scope creep (roles, permissions requested) | Med | Hard cap: single-admin-password. Future: multi-user later. |
| Banner tracking complexity (analytics backend) | Low | Counters in SQLite, no real-time dashboard. Keep simple. |
| Pagefind search limited for Spanish text | Med | Validate Spanish stemming early. Fallback: Lunr if needed. |
| Non-responsive prototypes — design gaps on mobile | High | Build mobile-first from start. Prototypes are reference only. |
| Build time grows with business count (SSG limit) | Low | JSON static generation O(n) — fast up to ~500 businesses. |

## Rollback Plan

- Astro project is a fresh scaffold. Rollback = delete `src/` and reinitialize.
- If Pagefind doesn't meet needs, swap to Lunr (same data layer, no refactor).
- Admin auth can be stripped to `.env` password if DB auth blocks launch.

## Success Criteria

- [ ] Public catalog pages build as static HTML (`pnpm build` exits 0)
- [ ] 5 zones × 8 categories with sample data render correctly
- [ ] Verified badge renders and is filterable
- [ ] Banners rotate, track impressions/clicks, expire by date
- [ ] Admin login protects `/admin/*` routes
- [ ] Admin can create/edit/delete businesses and banners
- [ ] Clean Lighthouse scores: 90+ performance, 100 SEO, 95+ accessibility
- [ ] Responsive: no horizontal scroll on 375px–1920px viewports
- [ ] Zero runtime server dependency for public pages
