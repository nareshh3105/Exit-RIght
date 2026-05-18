-- ─── Exit Right — Supabase PostgreSQL Schema ───────────────────
-- Run this in your Supabase SQL editor to bootstrap the database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  full_name         text not null,
  home_station      text not null default 'Guindy',
  avatar_initials   text not null default 'ME',
  preferred_mode    text not null default 'cab' check (preferred_mode in ('cab','auto','bus','walk')),
  budget_cap        integer not null default 200,
  theme             text not null default 'auto' check (theme in ('auto','light','dark')),
  created_at        timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ── Stations ──────────────────────────────────────────────────
create table public.stations (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique,
  line  text not null check (line in ('Blue','Green','Blue/Green')),
  lat   double precision,
  lng   double precision
);
-- Seed Chennai Metro stations
insert into public.stations (name, line, lat, lng) values
  ('Guindy',           'Blue',       12.9766, 80.2207),
  ('Alandur',          'Blue/Green', 13.0003, 80.2011),
  ('Vadapalani',       'Green',      13.0534, 80.2121),
  ('Egmore',           'Blue',       13.0785, 80.2620),
  ('CMBT',             'Green',      13.0694, 80.1998),
  ('Little Mount',     'Blue',       13.0102, 80.2203),
  ('St. Thomas Mount', 'Blue',       12.9881, 80.1970),
  ('Chennai Airport',  'Blue',       12.9941, 80.1809),
  ('Wimco Nagar',      'Blue',       13.1335, 80.2858),
  ('Washermenpet',     'Blue',       13.1165, 80.2898);

-- ── Saved routes ──────────────────────────────────────────────
create table public.saved_routes (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  address          text not null,
  icon             text not null default 'pin',
  color            text not null default '#10B981',
  destination_lat  double precision,
  destination_lng  double precision,
  preferred_gate   integer not null default 1,
  preferred_mode   text not null default 'cab' check (preferred_mode in ('cab','auto','bus','walk')),
  estimated_eta    text not null default '—',
  estimated_cost   text not null default '—',
  created_at       timestamptz not null default now()
);
alter table public.saved_routes enable row level security;
create policy "Users manage own saved routes" on public.saved_routes
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Trip history ──────────────────────────────────────────────
create table public.trip_history (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  from_station         text not null,
  to_destination       text not null,
  to_address           text,
  departed_at          timestamptz not null default now(),
  arrived_at           timestamptz,
  gate_used            integer not null,
  mode_used            text not null check (mode_used in ('cab','auto','bus','walk')),
  actual_cost          integer not null default 0,
  safety_mode_active   boolean not null default false,
  tag                  text,
  tag_tone             text check (tag_tone in ('good','safety'))
);
create index trip_history_user_id_idx on public.trip_history(user_id);
create index trip_history_departed_at_idx on public.trip_history(departed_at desc);
alter table public.trip_history enable row level security;
create policy "Users manage own trip history" on public.trip_history
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Safety contacts ───────────────────────────────────────────
create table public.safety_contacts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  phone      text not null,
  created_at timestamptz not null default now()
);
alter table public.safety_contacts enable row level security;
create policy "Users manage own safety contacts" on public.safety_contacts
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Exit Gates ────────────────────────────────────────────────
create table public.exit_gates (
  id              uuid primary key default uuid_generate_v4(),
  station_id      uuid not null references public.stations(id) on delete cascade,
  gate_number     integer not null,
  label           text not null,
  lat             double precision not null,
  lng             double precision not null,
  has_cover       boolean not null default false,
  has_cctv        boolean not null default false,
  lighting_score  integer not null default 5 check (lighting_score between 1 and 10),
  accessibility   text not null default 'stairs' check (accessibility in ('stairs','escalator','lift')),
  created_at      timestamptz not null default now(),
  unique(station_id, gate_number)
);
alter table public.exit_gates enable row level security;
create policy "Public read exit gates" on public.exit_gates for select using (true);

-- ── Transport Modes ───────────────────────────────────────────
create table public.transport_modes (
  id               uuid primary key default uuid_generate_v4(),
  gate_id          uuid not null references public.exit_gates(id) on delete cascade,
  mode             text not null check (mode in ('cab','auto','bus','walk')),
  available        boolean not null default true,
  avg_wait_minutes integer not null default 5,
  notes            text,
  unique(gate_id, mode)
);
alter table public.transport_modes enable row level security;
create policy "Public read transport modes" on public.transport_modes for select using (true);

-- ── Travel Paths ──────────────────────────────────────────────
create table public.travel_paths (
  id                uuid primary key default uuid_generate_v4(),
  gate_id           uuid not null references public.exit_gates(id) on delete cascade,
  destination_name  text not null,
  destination_lat   double precision not null,
  destination_lng   double precision not null,
  distance_km       double precision not null,
  walk_minutes      integer not null,
  has_sidewalk      boolean not null default true,
  lighting_quality  text not null default 'moderate' check (lighting_quality in ('good','moderate','poor')),
  crowd_typical     integer not null default 1 check (crowd_typical between 0 and 3)
);
alter table public.travel_paths enable row level security;
create policy "Public read travel paths" on public.travel_paths for select using (true);

-- ── Recommendation History ────────────────────────────────────
create table public.recommendation_history (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  station_id        uuid not null references public.stations(id) on delete cascade,
  destination       text not null,
  destination_lat   double precision,
  destination_lng   double precision,
  recommended_gate  integer not null,
  recommended_mode  text not null check (recommended_mode in ('cab','auto','bus','walk')),
  weather_condition text,
  crowd_level       integer check (crowd_level between 0 and 3),
  time_of_day       timestamptz not null default now(),
  weights_used      jsonb not null default '{}',
  score_breakdown   jsonb not null default '{}',
  created_at        timestamptz not null default now()
);
alter table public.recommendation_history enable row level security;
create policy "Users manage own recommendation history" on public.recommendation_history
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── User Preferences ──────────────────────────────────────────
create table public.user_preferences (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references public.profiles(id) on delete cascade unique,
  time_sensitivity     double precision not null default 0.5 check (time_sensitivity between 0 and 1),
  cost_sensitivity     double precision not null default 0.5 check (cost_sensitivity between 0 and 1),
  safety_sensitivity   double precision not null default 0.5 check (safety_sensitivity between 0 and 1),
  comfort_sensitivity  double precision not null default 0.5 check (comfort_sensitivity between 0 and 1),
  avoided_modes        text[] not null default '{}',
  preferred_gates      jsonb not null default '{}',
  updated_at           timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
create policy "Users manage own preferences" on public.user_preferences
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Feedback Logs ─────────────────────────────────────────────
create table public.feedback_logs (
  id                uuid primary key default uuid_generate_v4(),
  recommendation_id uuid not null references public.recommendation_history(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  rating            integer not null check (rating between 1 and 5),
  feedback_type     text not null default 'helpful' check (feedback_type in ('helpful','wrong_gate','wrong_mode','too_expensive','unsafe','other')),
  comment           text,
  created_at        timestamptz not null default now()
);
alter table public.feedback_logs enable row level security;
create policy "Users manage own feedback" on public.feedback_logs
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Cab Providers ─────────────────────────────────────────────
create table public.cab_providers (
  id                 uuid primary key default uuid_generate_v4(),
  brand              text not null unique,
  types              text[] not null default '{"Go"}',
  monogram           text not null,
  brand_color        text not null default '#000000',
  deep_link_template text not null,
  web_fallback_url   text not null,
  is_active          boolean not null default true,
  commission_info    text
);
alter table public.cab_providers enable row level security;
create policy "Public read cab providers" on public.cab_providers for select using (true);

-- ── Cab Price Cache ───────────────────────────────────────────
create table public.cab_price_cache (
  id                uuid primary key default uuid_generate_v4(),
  provider_id       uuid not null references public.cab_providers(id) on delete cascade,
  pickup_lat        double precision not null,
  pickup_lng        double precision not null,
  drop_lat          double precision not null,
  drop_lng          double precision not null,
  vehicle_type      text not null default 'Go',
  estimated_price   integer not null,
  eta_minutes       integer not null,
  surge_multiplier  double precision not null default 1.0,
  fetched_at        timestamptz not null default now(),
  expires_at        timestamptz not null default (now() + interval '5 minutes')
);
alter table public.cab_price_cache enable row level security;
create policy "Public read cab price cache" on public.cab_price_cache for select using (true);

-- ── Weather Cache ─────────────────────────────────────────────
create table public.weather_cache (
  id                  uuid primary key default uuid_generate_v4(),
  station_id          uuid not null references public.stations(id) on delete cascade,
  condition           text not null default 'clear',
  temp_celsius        double precision not null default 30.0,
  humidity            integer not null default 60,
  wind_kph            double precision not null default 10.0,
  rain_probability    integer not null default 0 check (rain_probability between 0 and 100),
  rain_mm_next_hour   double precision not null default 0.0,
  fetched_at          timestamptz not null default now(),
  expires_at          timestamptz not null default (now() + interval '15 minutes')
);
alter table public.weather_cache enable row level security;
create policy "Public read weather cache" on public.weather_cache for select using (true);

-- ── Crowd Patterns ────────────────────────────────────────────
create table public.crowd_patterns (
  id               uuid primary key default uuid_generate_v4(),
  station_id       uuid not null references public.stations(id) on delete cascade,
  gate_number      integer not null,
  day_of_week      integer not null check (day_of_week between 0 and 6),
  hour             integer not null check (hour between 0 and 23),
  avg_crowd_level  double precision not null default 1.0 check (avg_crowd_level between 0 and 3),
  sample_count     integer not null default 10,
  updated_at       timestamptz not null default now(),
  unique(station_id, gate_number, day_of_week, hour)
);
alter table public.crowd_patterns enable row level security;
create policy "Public read crowd patterns" on public.crowd_patterns for select using (true);

-- ── Nearest Station RPC ───────────────────────────────────────
create extension if not exists cube;
create extension if not exists earthdistance;

create or replace function nearest_station(user_lat double precision, user_lng double precision)
returns setof public.stations
language sql stable
as $$
  select * from public.stations
  order by (point(lng, lat) <@> point(user_lng, user_lat))
  limit 1;
$$;
