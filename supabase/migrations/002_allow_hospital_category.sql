-- The 'hospital' category was added to the app (map filter + Add-a-place),
-- but the original CHECK constraint only allowed toilet/pharmacy/restaurant.
-- Without this, any community-submitted hospital marker fails the insert.
ALTER TABLE markers
  DROP CONSTRAINT markers_category_check;

ALTER TABLE markers
  ADD CONSTRAINT markers_category_check
  CHECK (category IN ('toilet', 'pharmacy', 'restaurant', 'hospital'));
