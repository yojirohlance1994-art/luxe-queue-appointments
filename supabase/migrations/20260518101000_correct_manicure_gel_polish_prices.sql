-- Correct legacy manicure and gel polish prices that may still be active.

UPDATE public.services
SET price = 100,
    price_note = '100'
WHERE category = 'nails'
  AND name IN ('Classic Manicure', 'Classic Mani');

UPDATE public.services
SET price = 300,
    price_note = '300'
WHERE category = 'nails'
  AND name IN ('Gel Polish Manicure', 'Gel Mani', 'Gel Manicure');

UPDATE public.service_packages p
SET price = totals.price,
    duration_minutes = totals.duration_minutes
FROM (
  SELECT
    i.package_id,
    round(
      sum(s.price) *
      (
        1 - CASE
          WHEN count(*) >= 3 THEN 0.15
          WHEN count(*) = 2 THEN 0.10
          ELSE 0
        END
      ),
      0
    ) AS price,
    COALESCE(sum(s.duration_minutes), 0)::integer AS duration_minutes
  FROM public.service_package_items i
  JOIN public.services s ON s.id = i.service_id
  GROUP BY i.package_id
) totals
WHERE p.id = totals.package_id;
