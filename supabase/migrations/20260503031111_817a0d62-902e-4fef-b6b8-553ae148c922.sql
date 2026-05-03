
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service category enum
CREATE TYPE public.service_category AS ENUM ('hair', 'nails', 'body');

-- Services (3NF: independent entity)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category service_category NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services are public" ON public.services FOR SELECT TO anon, authenticated
  USING (active = true);
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clients (3NF: customer info stored once)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can create client" ON public.clients FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read clients" ON public.clients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Appointment status (queue states)
CREATE TYPE public.appointment_status AS ENUM ('queued', 'in_progress', 'completed', 'cancelled');

-- Appointments (3NF: links client + service via FKs)
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  preferred_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'queued',
  notes TEXT,
  -- Queue ordering: monotonically increasing on insert (FIFO tail)
  queue_seq BIGSERIAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE INDEX appointments_queue_idx ON public.appointments (status, queue_seq);

CREATE POLICY "anyone can book" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read appointments" ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER appointments_touch BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed services
INSERT INTO public.services (name, category, description, duration_minutes, price) VALUES
  ('Precision Haircut', 'hair', 'Tailored cut for men & women with consultation.', 60, 45),
  ('Hair Color & Highlights', 'hair', 'Custom color, balayage, or highlights.', 120, 120),
  ('Keratin Treatment', 'hair', 'Smoothing keratin treatment for shine and frizz control.', 150, 180),
  ('Classic Manicure', 'nails', 'Shape, cuticle care, and polish.', 45, 25),
  ('Gel Polish Manicure', 'nails', 'Long-lasting gel polish with detailed finish.', 60, 40),
  ('Nail Art Design', 'nails', 'Custom nail art and embellishments.', 75, 55),
  ('Lash Extensions', 'body', 'Volume or classic lash applications.', 90, 90),
  ('Brow Lamination & Tint', 'body', 'Sculpted, fluffy brows with tint.', 45, 50),
  ('Makeup Application', 'body', 'Event-ready professional makeup.', 60, 75);
