-- IBD Navigator — Supabase schema
-- Run this in the Supabase SQL editor after creating your project

-- Community-submitted markers
create table if not exists markers (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('toilet', 'pharmacy', 'restaurant')),
  lat           double precision not null,
  lon           double precision not null,
  name          text,
  details       text,
  opening_hours text,
  wheelchair    boolean default false,
  fee           boolean default false,
  -- 'osm' = imported from OpenStreetMap, 'community' = user-submitted
  source        text not null default 'community' check (source in ('osm', 'community')),
  user_id       uuid references auth.users(id) on delete set null,
  verified      boolean default false,
  created_at    timestamptz default now()
);

-- Ratings per marker per user (one rating per user per place)
create table if not exists ratings (
  id            uuid primary key default gen_random_uuid(),
  marker_id     uuid not null references markers(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  cleanliness   int check (cleanliness between 1 and 5),
  accessibility int check (accessibility between 1 and 5),
  privacy       int check (privacy between 1 and 5),
  ibd_friendly  boolean default false,
  created_at    timestamptz default now(),
  unique (marker_id, user_id)
);

-- Bookmarks per user
create table if not exists bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  marker_id  uuid references markers(id) on delete cascade,
  -- also allow bookmarking OSM places not in our DB (by lat/lon)
  lat        double precision,
  lon        double precision,
  name       text,
  created_at timestamptz default now(),
  unique (user_id, marker_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table markers   enable row level security;
alter table ratings   enable row level security;
alter table bookmarks enable row level security;

-- markers: anyone can read, only auth users can insert their own
create policy "markers_public_read"   on markers for select using (true);
create policy "markers_auth_insert"   on markers for insert with check (auth.uid() = user_id);
create policy "markers_own_update"    on markers for update using (auth.uid() = user_id);
create policy "markers_own_delete"    on markers for delete using (auth.uid() = user_id);

-- ratings: users manage only their own
create policy "ratings_public_read"   on ratings for select using (true);
create policy "ratings_auth_insert"   on ratings for insert with check (auth.uid() = user_id);
create policy "ratings_own_update"    on ratings for update using (auth.uid() = user_id);
create policy "ratings_own_delete"    on ratings for delete using (auth.uid() = user_id);

-- bookmarks: users see and manage only their own
create policy "bookmarks_own_read"    on bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_own_insert"  on bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_own_delete"  on bookmarks for delete using (auth.uid() = user_id);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
-- Fast geo-bounding-box queries (used alongside Overpass API data)
create index if not exists markers_category_idx on markers (category);
create index if not exists markers_latlon_idx   on markers (lat, lon);
