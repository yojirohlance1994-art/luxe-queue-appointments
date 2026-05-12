
# Glammee Premium Redesign & Admin Dashboard

A large, multi-area refresh. Below is the scope I'll ship, broken into phases so we can check in if you want to adjust before I build everything.

## 1. Design system uplift (foundation for everything else)

Update `src/styles.css` with:
- Layered surface tokens (`--surface-1`, `--surface-2`, `--surface-glass`)
- Premium shadows (`--shadow-soft`, `--shadow-elevated`, `--shadow-glow`)
- Refined gradients (hero, card, accent shimmer)
- Typography scale tokens for display / h1–h4 / body / caption
- Motion tokens (durations + easings)
- Glass utility (`.glass`, `.glass-strong`)
- Subtle noise/grain optional utility

No color identity change — same warm charcoal + burgundy, just richer.

## 2. Booking visibility fix

Audit `BookingDialog`, admin queue, and any card showing booking details. Root cause is almost certainly `text-card-foreground` vs dark backgrounds, or input/textarea using `--input` light tone on dark surface. Fix by:
- Standardizing booking detail cards to a single themed surface
- Ensuring inputs render with proper foreground contrast in both themes
- Removing any `overflow-hidden`/low-opacity wrappers cropping content

Cards will clearly show: customer name, service, date, time, queue status.

## 3. Admin separation

- New route group `src/routes/_admin/` with its own layout (sidebar + topbar) using shadcn `Sidebar`.
- Routes:
  - `/admin` → overview (widgets: today's queue, pending count, completed today, revenue placeholder, recent activity)
  - `/admin/queue` → queue board (kanban-style columns: Pending → Accepted → In Service → Completed, plus Cancelled drawer)
  - `/admin/staff` → staff management
  - `/admin/records` → appointment records with category tabs
- Admins auto-redirect to `/admin` after login (update `login.tsx`).
- Header keeps a small "Dashboard" link for admins but main admin UX lives inside the dedicated layout.
- Existing `/admin` route is removed/redirected.

## 4. Queue system redesign

Status flow: `pending → accepted → in_service → completed`, plus `cancelled`.
- Migration: extend `appointment_status` enum with `accepted`, `in_service`, `cancelled` (keep existing `queued` mapped → `pending` for legacy rows; I'll add a data update).
- Add nullable `concern text` to `appointments` for the "customer concern" field shown in detail modal.
- Kanban board with drag-free action buttons (Accept / Decline / Start / Complete / Cancel).
- Click a card → detail modal with concern, notes, service, requested datetime, queue position.
- Live counters per column.

## 5. Staff management

New tables:
- `staff` (full_name, role, seniority, bio, category, image_url, active)
- Storage bucket `staff-photos` (public read, admin write)

UI: staff dropdown selector + grid of staff cards with hover expansion, edit modal with image upload preview, category chips.

## 6. Appointment records

`/admin/records` with tabs: Hair / Nails / Beauty / Body (filter by `services.category`).
- Premium table with expandable rows
- Search + filter
- "View Proof" button → lightbox modal (multi-image)
- New tables: `appointment_photos` (appointment_id, url, caption) + storage bucket `appointment-proofs`
- Each row shows customer DB id (short), name, service, date, time, assigned staff, status

## 7. Public site additions

- `/team` — Our Team: categorized staff showcase (reads `staff` table where `active=true`), hover reveal cards with photo, role, seniority, bio.
- `/work` — Our Work: categorized portfolio gallery with masonry grid + lightbox.
  - New table `portfolio_items` (title, description, category, image_url, sort_order, active) + storage bucket `portfolio`
- Header nav adds "Our Team" and "Our Work" alongside existing items.

## 8. UX polish pass

- Tighten spacing scale, stronger headings (Playfair display sizes up)
- Subtle fade-in on section enter, hover-lift on cards
- Glass header on scroll
- Better empty states

## Technical notes

- Routing: TanStack Start file-based, admin routes under `_admin/` pathless layout with `beforeLoad` admin guard.
- DB changes via single migration: enum extension + appointments.concern + staff table + appointment_photos + portfolio_items + RLS (admins manage; public read for staff/portfolio active rows) + storage buckets/policies.
- Reuse existing `has_role` security definer.
- Image uploads via Supabase Storage with signed-URL or public bucket reads.
- Keep current `useAuth` hook; extend admin redirect logic in `/login`.

## What I will NOT do unless you say so

- Replace branding, fonts, or color hues
- Add payments
- Add real-time subscriptions (can be a follow-up)
- Add staff scheduling / shifts beyond profile data

---

This is large (~15–20 files + 1 migration + storage). I'll execute it in the order above. Approve and I'll start with the design tokens + migration, then ship the rest.
