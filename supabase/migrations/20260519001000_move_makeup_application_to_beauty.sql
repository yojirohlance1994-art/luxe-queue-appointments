-- Move legacy demo makeup service out of Body & Massage.

UPDATE public.services
SET category = 'beauty'
WHERE name = 'Makeup Application'
  AND category = 'body';

UPDATE public.services
SET category = 'lashes'
WHERE name IN ('Brow Lamination & Tint', 'Lash Extensions')
  AND category = 'body';
