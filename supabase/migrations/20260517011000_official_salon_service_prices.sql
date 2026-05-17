-- Official salon service price list.
-- price_note preserves values like 800+ or 450/550/600 while price stays numeric.

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS price_note text;

CREATE OR REPLACE FUNCTION public.upsert_service(
  _name text,
  _category public.service_category,
  _price numeric,
  _price_note text,
  _duration integer DEFAULT 60
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.services
    WHERE name = _name AND category = _category
  ) THEN
    UPDATE public.services
    SET price = _price,
        price_note = _price_note,
        duration_minutes = _duration,
        active = true
    WHERE name = _name AND category = _category;
  ELSE
    INSERT INTO public.services
      (name, category, price, price_note, duration_minutes, active)
    VALUES
      (_name, _category, _price, _price_note, _duration, true);
  END IF;
END;
$$;

SELECT public.upsert_service('Men & Women Hair Cut', 'hair', 120, '120', 45);
SELECT public.upsert_service('Men + Shampoo Blower', 'hair', 170, '170', 60);
SELECT public.upsert_service('Women + Shampoo Blower', 'hair', 250, '250', 60);
SELECT public.upsert_service('Shampoo Blower', 'hair', 150, '150', 45);
SELECT public.upsert_service('Hair & Make Up', 'beauty', 700, '700', 90);

SELECT public.upsert_service('Hot Oil', 'hair', 250, '250', 60);
SELECT public.upsert_service('Hair Spa', 'hair', 350, '350', 60);
SELECT public.upsert_service('Keratin Cream', 'hair', 500, '500', 90);
SELECT public.upsert_service('Brazilian Blowout', 'hair', 800, '800+', 120);
SELECT public.upsert_service('Brazilian Botox', 'hair', 1000, '1000+', 120);

SELECT public.upsert_service('Men Basic Tone', 'hair', 500, '500', 90);
SELECT public.upsert_service('Women Basic Tone', 'hair', 800, '800', 120);
SELECT public.upsert_service('Women Regrowth 1 inch', 'hair', 400, '400+', 90);
SELECT public.upsert_service('Women Short Hair Color', 'hair', 600, '600', 90);

SELECT public.upsert_service('Highlight 1st Coat Men', 'hair', 350, '350+', 90);
SELECT public.upsert_service('Highlight 1st Coat Women', 'hair', 500, '500+', 120);
SELECT public.upsert_service('Full Bleach Women', 'hair', 800, '800+', 120);
SELECT public.upsert_service('Ombre & Color Shade', 'hair', 800, '800+', 150);
SELECT public.upsert_service('Balayage Color', 'hair', 2000, '2000+', 180);

SELECT public.upsert_service('Men Traditional Perm', 'hair', 500, '500', 90);
SELECT public.upsert_service('Women Traditional Perm', 'hair', 800, '800', 120);
SELECT public.upsert_service('Women Air Perming', 'hair', 1500, '1500', 150);

SELECT public.upsert_service('Men Hair Rebonding', 'hair', 800, '800+', 150);
SELECT public.upsert_service('Women Hair Rebonding', 'hair', 1000, '1000+', 180);
SELECT public.upsert_service('Brazilian + Blowout', 'hair', 1500, '1500+', 180);
SELECT public.upsert_service('Color Rebond', 'hair', 1500, '1500+', 180);
SELECT public.upsert_service('Brazilian + Botox', 'hair', 1800, '1800+', 180);
SELECT public.upsert_service('Color Brazilian', 'hair', 2500, '2500+', 180);
SELECT public.upsert_service('Color + Highlight + Brazilian', 'hair', 3000, '3000+', 240);

SELECT public.upsert_service('Pamper Footspa + Classic Pedi', 'nails', 300, '300', 60);
SELECT public.upsert_service('Pamper Footspa + Classic Mani/Pedi', 'nails', 360, '360', 75);
SELECT public.upsert_service('Gel Mani + Gel Pedi', 'nails', 630, '630', 90);
SELECT public.upsert_service('Gel Mani', 'nails', 320, '320', 45);
SELECT public.upsert_service('Gel Pedi', 'nails', 300, '300', 45);
SELECT public.upsert_service('Pamper Footspa + Gel Pedi', 'nails', 530, '530', 75);
SELECT public.upsert_service('Pamper Footspa + Classic Pedi + Gel Mani', 'nails', 500, '500', 90);
SELECT public.upsert_service('Pamper Footspa + Gel Mani/Pedi', 'nails', 850, '850', 105);
SELECT public.upsert_service('Classic Mani/Pedi', 'nails', 250, '250', 60);
SELECT public.upsert_service('Luxury Footspa', 'nails', 270, '270', 45);
SELECT public.upsert_service('Luxury Footspa + Pedi', 'nails', 370, '370', 60);
SELECT public.upsert_service('Luxury Footspa + Pedi + Mani', 'nails', 600, '600', 90);
SELECT public.upsert_service('Classic Mani', 'nails', 100, '100', 30);
SELECT public.upsert_service('Pedi', 'nails', 100, '100', 30);
SELECT public.upsert_service('Add-on Scrub', 'nails', 50, '50', 15);
SELECT public.upsert_service('Footspa + Pedi + Scrubbing', 'nails', 400, '400', 75);
SELECT public.upsert_service('Foot Massage', 'body', 300, '300', 45);

SELECT public.upsert_service('Eyebrow Waxing', 'waxing', 150, '150', 30);
SELECT public.upsert_service('Upper Lip Waxing', 'waxing', 150, '150', 30);
SELECT public.upsert_service('Lower Lip Waxing', 'waxing', 150, '150', 30);
SELECT public.upsert_service('Underarm Waxing', 'waxing', 200, '200', 30);
SELECT public.upsert_service('Half Leg Waxing', 'waxing', 350, '350', 45);
SELECT public.upsert_service('Whole Leg Waxing', 'waxing', 600, '600', 60);
SELECT public.upsert_service('Half Arm Waxing', 'waxing', 300, '300', 45);
SELECT public.upsert_service('Whole Arm Waxing', 'waxing', 550, '550', 60);
SELECT public.upsert_service('Chest Waxing', 'waxing', 300, '300', 45);
SELECT public.upsert_service('Back Waxing', 'waxing', 450, '450', 45);
SELECT public.upsert_service('Whole Face Waxing', 'waxing', 250, '250', 45);
SELECT public.upsert_service('Bikini Waxing', 'waxing', 250, '250', 45);
SELECT public.upsert_service('Brazilian Waxing', 'waxing', 550, '550', 60);
SELECT public.upsert_service('Unlimited Waxing', 'waxing', 1600, '1600', 120);

SELECT public.upsert_service('Human Hair Mascara', 'lashes', 450, '450/550/600', 90);
SELECT public.upsert_service('Eye Brow Tint', 'lashes', 150, '150', 30);
SELECT public.upsert_service('Eye Lash Tint', 'lashes', 150, '150', 30);
SELECT public.upsert_service('Keratin Lash Lift', 'lashes', 500, '500', 60);

SELECT public.upsert_service('Foot Massage 30m', 'body', 250, '250', 30);
SELECT public.upsert_service('Back Massage 30m', 'body', 300, '300', 30);
SELECT public.upsert_service('Legs Massage 30m', 'body', 200, '200', 30);
SELECT public.upsert_service('Whole Body Massage 1h', 'body', 400, '400', 60);

DROP FUNCTION public.upsert_service(text, public.service_category, numeric, text, integer);
