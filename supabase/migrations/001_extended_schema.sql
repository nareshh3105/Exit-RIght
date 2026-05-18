-- ─── Exit Right — Extended Schema Migration ──────────────────
-- Adds 10 new tables to the existing 5-table schema.
-- Run after the base schema (schema.sql) has been applied.

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
create index exit_gates_station_idx on public.exit_gates(station_id);

-- ── Transport Modes (per gate) ────────────────────────────────
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

-- ── Travel Paths (precomputed gate→destination) ───────────────
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
create index travel_paths_gate_idx on public.travel_paths(gate_id);

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
create index rec_history_user_idx on public.recommendation_history(user_id);
create index rec_history_created_idx on public.recommendation_history(created_at desc);

-- ── User Preferences (learned) ────────────────────────────────
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

-- ── Cab Providers (registry) ──────────────────────────────────
create table public.cab_providers (
  id                uuid primary key default uuid_generate_v4(),
  brand             text not null unique,
  types             text[] not null default '{"Go"}',
  monogram          text not null,
  brand_color       text not null default '#000000',
  deep_link_template text not null,
  web_fallback_url  text not null,
  is_active         boolean not null default true,
  commission_info   text
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
create index cab_cache_expires_idx on public.cab_price_cache(expires_at);

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
create index weather_cache_station_idx on public.weather_cache(station_id);
create index weather_cache_expires_idx on public.weather_cache(expires_at);

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
create index crowd_patterns_lookup_idx on public.crowd_patterns(station_id, gate_number, day_of_week, hour);

-- ── Nearest Station RPC (using earth_distance) ───────────────
create extension if not exists cube;
create extension if not exists earthdistance;

create or replace function nearest_station(user_lat double precision, user_lng double precision)
returns setof public.stations
language sql stable
as $$
  select *
  from public.stations
  order by (point(lng, lat) <@> point(user_lng, user_lat))
  limit 1;
$$;

-- ── Add zone column to stations ───────────────────────────────
alter table public.stations add column if not exists gate_count integer not null default 4;
alter table public.stations add column if not exists zone text;
