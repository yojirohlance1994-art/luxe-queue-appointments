-- Ensure approved customer reviews are visible on the public reviews page.

UPDATE public.customer_reviews
SET public_visible = true
WHERE review_type = 'review'
  AND status = 'reviewed'
  AND public_visible = false;
