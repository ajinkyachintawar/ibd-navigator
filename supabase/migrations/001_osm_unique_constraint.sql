-- Unique constraint so OSM places can be upserted by (lat, lon, category, source)
-- Needed for the rating flow: when a user rates an OSM place, we create a shadow
-- record and this constraint prevents duplicates on re-ratings.
ALTER TABLE markers
  ADD CONSTRAINT markers_osm_unique UNIQUE (lat, lon, category, source);
