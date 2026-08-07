# admin-dashboard Specification

## Purpose

Login-protected administration panel for managing businesses and banners. Admin routes use Astro SSR with session-based auth backed by SQLite user storage. Access to `/admin/*` is forbidden without valid session.

## Requirements

### Requirement: Admin Authentication

The system MUST protect all `/admin/*` routes behind a login form with email + password credentials verified against a database.

#### Scenario: Unauthenticated user redirected to login

- GIVEN a user has no active session
- WHEN they navigate to `/admin` or any `/admin/*` route
- THEN the server responds with a 302 redirect to `/admin/login`
- AND the login page renders a form with email and password fields

#### Scenario: Successful login

- GIVEN a user exists in the database with email `admin@example.com` and a known password
- WHEN the user submits the login form with correct credentials
- THEN the system creates a session and sets a session cookie
- AND redirects to `/admin` (the dashboard)
- AND the dashboard renders the admin layout with navigation

#### Scenario: Failed login

- GIVEN a login form is submitted with incorrect email or password
- WHEN the credentials don't match any user
- THEN the system returns the login page with error message "Credenciales inválidas"
- AND the email field retains the submitted value
- AND no session cookie is set
- AND the response status is 401

#### Scenario: Login form validation

- GIVEN the login form is submitted with an empty email field
- WHEN the form reaches the server
- THEN the system MUST return the login page with a validation error "El email es obligatorio"
- AND no database query is executed

#### Scenario: Session persistence and logout

- GIVEN a user has a valid session
- WHEN they navigate between `/admin` pages
- THEN each page renders the admin layout (no redirect)
- AND a logout button is visible in the admin navigation
- AND clicking logout destroys the session and redirects to `/admin/login`
- AND the session cookie is cleared

### Requirement: Admin Dashboard Overview

The system MUST render a dashboard at `/admin` with summary statistics and an engagement chart.

#### Scenario: Dashboard renders with stats

- GIVEN the database contains: 42 businesses (15 verified, 27 pending), 3 active banners, and data for growth calculation
- WHEN `/admin` is rendered
- THEN 4 stat cards display: "Total negocios" (42), "Pendientes verificación" (27), "Banners activos" (3), and a growth metric
- AND a chart visualizes engagement data (banner impressions/clicks over time)

#### Scenario: Dashboard with zero data

- GIVEN the database has zero businesses and zero banners
- WHEN `/admin` is rendered
- THEN all stat cards show "0"
- AND the engagement chart renders an empty state: "Sin datos de engagement"
- AND the page does not crash

### Requirement: Business CRUD — List

The system MUST display a paginated table of all businesses at `/admin/negocios`.

#### Scenario: Business table renders

- GIVEN the database has 30 businesses
- WHEN `/admin/negocios` is rendered
- THEN a table displays: name, category, email, status (Verified/Pending chip), and action buttons (Edit, Delete)
- AND the table is paginated (e.g., 20 per page)

#### Scenario: Empty business table

- GIVEN no businesses exist in the database
- WHEN `/admin/negocios` is rendered
- THEN the table area shows "No hay negocios registrados"
- AND a "Crear primer negocio" CTA button links to the create form

### Requirement: Business CRUD — Create

The system MUST provide a form at `/admin/negocios/nuevo` to create a new business.

#### Scenario: Create form renders

- WHEN `/admin/negocios/nuevo` is rendered
- THEN the form MUST include fields for: name, slug, description, category (select), zone (select), phone, email, website, address, photos (array), schedule, services (array), destacado (checkbox), verified (checkbox)
- AND all fields are initially empty

#### Scenario: Successful business creation

- GIVEN a valid form submission with `name: "Hotel Pacífico"` and all required fields
- WHEN the form is POSTed to the server
- THEN the business is saved to the data store
- AND the user is redirected to `/admin/negocios` with a success flash message
- AND the new business appears in the table

#### Scenario: Creation form validation errors

- GIVEN the create form is submitted with an empty `name` field
- WHEN the form is POSTed
- THEN the form re-renders with the validation error "El nombre es obligatorio" next to the name field
- AND all other filled fields retain their values
- AND no redirect occurs

#### Scenario: Duplicate slug on creation

- GIVEN a business with slug `hotel-pacifico` already exists
- WHEN a new business is submitted with the same slug
- THEN the form re-renders with error "Este slug ya existe"
- AND the slug field retains the value

### Requirement: Business CRUD — Edit

The system MUST provide a form at `/admin/negocios/{id}/editar` pre-filled with existing data.

#### Scenario: Edit form renders with data

- GIVEN business ID 42 exists with all fields populated
- WHEN `/admin/negocios/42/editar` is rendered
- THEN the same form as the create form renders
- AND all fields are pre-filled with the business's current values
- AND the submit button text is "Guardar cambios"

#### Scenario: Successful edit

- GIVEN the edit form for business ID 42 is submitted with a new `phone` value
- WHEN the form is POSTed
- THEN the business record is updated
- AND the user is redirected to `/admin/negocios` with success message "Negocio actualizado"

#### Scenario: Editing non-existent business

- GIVEN no business exists with ID 999
- WHEN `/admin/negocios/999/editar` is requested
- THEN the system returns a 404 page within the admin layout

### Requirement: Business CRUD — Delete

The system MUST support deleting a business with confirmation.

#### Scenario: Delete with confirmation

- GIVEN business ID 42 exists
- WHEN the admin clicks "Eliminar" from the table
- THEN a confirmation dialog or interstitial page is shown: "¿Estás seguro de eliminar {name}?"
- AND upon confirming, the business is deleted
- AND the user is redirected to `/admin/negocios` with success message "Negocio eliminado"

#### Scenario: Delete cancelled

- GIVEN the delete confirmation is shown
- WHEN the admin clicks "Cancelar"
- THEN the business is NOT deleted
- AND the user returns to the business table

### Requirement: Verification Management

The system MUST allow toggling the `verified` flag on any business from the admin.

#### Scenario: Mark business as verified

- GIVEN a business has `verified: false`
- WHEN the admin clicks a "Verificar" action (checkbox or toggle) in the table or edit form
- AND submits the change
- THEN the business's `verified` flag is set to `true`
- AND the table status column updates to "Verified" (green chip)

#### Scenario: Remove verification

- GIVEN a business has `verified: true`
- WHEN the admin unchecks the verified toggle
- AND submits the change
- THEN the business's `verified` flag is set to `false`
- AND the table status column updates to "Pending" (neutral chip)

### Requirement: Admin Layout and Navigation

The system MUST render a consistent admin layout with sidebar or top navigation for all `/admin/*` routes (except `/admin/login`).

#### Scenario: Admin layout renders navigation

- GIVEN a session is active
- WHEN any `/admin/*` page (except login) is rendered
- THEN the admin layout includes a sidebar or top nav with links: Dashboard, Negocios, Banners
- AND the current page is visually indicated in the navigation
- AND the user's email is displayed
- AND a "Cerrar sesión" logout button is present

#### Scenario: Admin responsive behavior

- GIVEN the viewport is 375px wide
- WHEN an admin page is rendered
- THEN the admin navigation collapses into a hamburger menu or bottom tab bar
- AND the layout remains usable on mobile
