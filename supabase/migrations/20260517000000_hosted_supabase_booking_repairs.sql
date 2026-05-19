-- Repairs commonly needed after moving this app to a hosted Supabase project.

-- Admin-facing RLS policies call has_role(); authenticated users need EXECUTE
-- permission or admin reads/updates can fail with "permission denied for function has_role".
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Booking/admin UI statuses used by the app.
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'in_service';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'declined';

-- Queue/detail screens select this column.
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS concern text;

-- Public booking inserts create a client first, then an appointment.
DROP POLICY IF EXISTS "anyone can create client" ON public.clients;
CREATE POLICY "anyone can create client"
ON public.clients
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anyone can book" ON public.appointments;
CREATE POLICY "anyone can book"
ON public.appointments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
