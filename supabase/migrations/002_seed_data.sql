-- ─── Exit Right — Seed Data ───────────────────────────────────
-- Populates exit_gates, transport_modes, cab_providers, crowd_patterns, travel_paths
-- with realistic Chennai Metro data.

-- ── Helper: get station ID by name ────────────────────────────
-- We use subqueries to reference stations by name.

-- ── Update station zones ──────────────────────────────────────
update public.stations set zone = 'South'   where name in ('Guindy', 'Alandur', 'Little Mount', 'St. Thomas Mount', 'Chennai Airport');
update public.stations set zone = 'Central' where name in ('Egmore', 'Vadapalani', 'CMBT');
update public.stations set zone = 'North'   where name in ('Wimco Nagar', 'Washermenpet');

-- ══════════════════════════════════════════════════════════════
-- EXIT GATES — 4 gates per station (40 total)
-- ══════════════════════════════════════════════════════════════

-- Guindy (detailed — prototype focus station)
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Guindy'), 1, 'Gate 1 — Mount Rd Side',     12.9770, 80.2200, true,  true,  8, 'escalator'),
  ((select id from public.stations where name='Guindy'), 2, 'Gate 2 — Velachery Rd Side',  12.9763, 80.2212, true,  true,  9, 'escalator'),
  ((select id from public.stations where name='Guindy'), 3, 'Gate 3 — CSIR Rd Side',       12.9760, 80.2198, false, true,  6, 'stairs'),
  ((select id from public.stations where name='Guindy'), 4, 'Gate 4 — Kathipara Side',     12.9772, 80.2190, false, false, 4, 'stairs');

-- Alandur
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Alandur'), 1, 'Gate 1 — GST Rd Side',        13.0007, 80.2005, true,  true,  8, 'escalator'),
  ((select id from public.stations where name='Alandur'), 2, 'Gate 2 — Inner Ring Rd Side',  13.0000, 80.2018, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='Alandur'), 3, 'Gate 3 — Residential Side',    12.9997, 80.2000, false, false, 5, 'stairs'),
  ((select id from public.stations where name='Alandur'), 4, 'Gate 4 — Bus Stop Side',       13.0010, 80.2015, true,  true,  7, 'stairs');

-- Vadapalani
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Vadapalani'), 1, 'Gate 1 — Arcot Rd Side',       13.0538, 80.2115, true,  true,  8, 'escalator'),
  ((select id from public.stations where name='Vadapalani'), 2, 'Gate 2 — Temple Side',          13.0530, 80.2128, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='Vadapalani'), 3, 'Gate 3 — Residential Side',     13.0528, 80.2112, false, false, 5, 'stairs'),
  ((select id from public.stations where name='Vadapalani'), 4, 'Gate 4 — Signal Side',          13.0540, 80.2125, false, true,  6, 'stairs');

-- Egmore
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Egmore'), 1, 'Gate 1 — EVR Periyar Rd Side',  13.0790, 80.2615, true,  true,  9, 'lift'),
  ((select id from public.stations where name='Egmore'), 2, 'Gate 2 — Railway Station Side',  13.0782, 80.2625, true,  true,  8, 'escalator'),
  ((select id from public.stations where name='Egmore'), 3, 'Gate 3 — Museum Side',           13.0778, 80.2610, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='Egmore'), 4, 'Gate 4 — Pantheon Rd Side',      13.0788, 80.2630, false, false, 5, 'stairs');

-- CMBT
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='CMBT'), 1, 'Gate 1 — Bus Terminus Side',    13.0698, 80.1992, true,  true,  8, 'escalator'),
  ((select id from public.stations where name='CMBT'), 2, 'Gate 2 — Koyambedu Market Side', 13.0690, 80.2005, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='CMBT'), 3, 'Gate 3 — Jawaharlal Nehru Rd',   13.0688, 80.1990, false, true,  6, 'stairs'),
  ((select id from public.stations where name='CMBT'), 4, 'Gate 4 — Residential Side',      13.0700, 80.2002, false, false, 4, 'stairs');

-- Little Mount
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Little Mount'), 1, 'Gate 1 — Mount Rd Side',    13.0106, 80.2198, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='Little Mount'), 2, 'Gate 2 — Anna Salai Side',   13.0098, 80.2210, true,  true,  8, 'escalator'),
  ((select id from public.stations where name='Little Mount'), 3, 'Gate 3 — Residential Side',  13.0096, 80.2195, false, false, 5, 'stairs'),
  ((select id from public.stations where name='Little Mount'), 4, 'Gate 4 — Service Rd Side',   13.0108, 80.2205, false, true,  6, 'stairs');

-- St. Thomas Mount
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='St. Thomas Mount'), 1, 'Gate 1 — GST Rd Side',      12.9885, 80.1965, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='St. Thomas Mount'), 2, 'Gate 2 — Cantonment Side',   12.9877, 80.1975, true,  true,  6, 'stairs'),
  ((select id from public.stations where name='St. Thomas Mount'), 3, 'Gate 3 — Pallavaram Rd',     12.9875, 80.1960, false, false, 4, 'stairs'),
  ((select id from public.stations where name='St. Thomas Mount'), 4, 'Gate 4 — Hill Side',         12.9888, 80.1972, false, false, 3, 'stairs');

-- Chennai Airport
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Chennai Airport'), 1, 'Gate 1 — Domestic Terminal',   12.9945, 80.1805, true,  true,  10, 'lift'),
  ((select id from public.stations where name='Chennai Airport'), 2, 'Gate 2 — International Side',  12.9937, 80.1815, true,  true,  10, 'lift'),
  ((select id from public.stations where name='Chennai Airport'), 3, 'Gate 3 — Parking Side',        12.9935, 80.1800, true,  true,  8,  'escalator'),
  ((select id from public.stations where name='Chennai Airport'), 4, 'Gate 4 — Cargo Rd Side',       12.9948, 80.1812, false, true,  6,  'stairs');

-- Wimco Nagar
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Wimco Nagar'), 1, 'Gate 1 — TH Rd Side',         13.1339, 80.2852, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='Wimco Nagar'), 2, 'Gate 2 — Depot Side',          13.1331, 80.2862, true,  false, 5, 'stairs'),
  ((select id from public.stations where name='Wimco Nagar'), 3, 'Gate 3 — Residential Side',    13.1329, 80.2850, false, false, 4, 'stairs'),
  ((select id from public.stations where name='Wimco Nagar'), 4, 'Gate 4 — Industrial Side',     13.1342, 80.2858, false, false, 3, 'stairs');

-- Washermenpet
insert into public.exit_gates (station_id, gate_number, label, lat, lng, has_cover, has_cctv, lighting_score, accessibility) values
  ((select id from public.stations where name='Washermenpet'), 1, 'Gate 1 — TH Rd Side',         13.1169, 80.2892, true,  true,  7, 'escalator'),
  ((select id from public.stations where name='Washermenpet'), 2, 'Gate 2 — Market Side',         13.1161, 80.2905, true,  true,  6, 'stairs'),
  ((select id from public.stations where name='Washermenpet'), 3, 'Gate 3 — Residential Side',    13.1159, 80.2890, false, false, 5, 'stairs'),
  ((select id from public.stations where name='Washermenpet'), 4, 'Gate 4 — Canal Rd Side',       13.1172, 80.2900, false, false, 4, 'stairs');

-- ══════════════════════════════════════════════════════════════
-- TRANSPORT MODES — 4 modes per gate (160 total)
-- ══════════════════════════════════════════════════════════════

-- For each gate, insert all 4 transport modes with varying availability/wait times
-- We'll use a DO block for efficiency

do $$
declare
  g record;
begin
  for g in select eg.id as gate_id, eg.gate_number, s.name as station_name
           from public.exit_gates eg
           join public.stations s on s.id = eg.station_id
  loop
    -- Walk is always available with 0 wait
    insert into public.transport_modes (gate_id, mode, available, avg_wait_minutes, notes)
    values (g.gate_id, 'walk', true, 0, null);

    -- Cab available at most gates, 3-8 min wait
    insert into public.transport_modes (gate_id, mode, available, avg_wait_minutes, notes)
    values (g.gate_id, 'cab', true,
            case when g.gate_number <= 2 then 3 else 6 end,
            case when g.gate_number <= 2 then 'Pickup point nearby' else null end);

    -- Auto available at gates 1-3 typically
    insert into public.transport_modes (gate_id, mode, available, avg_wait_minutes, notes)
    values (g.gate_id, 'auto',
            g.gate_number <= 3,
            case when g.gate_number = 1 then 2 when g.gate_number = 2 then 3 else 5 end,
            case when g.gate_number <= 2 then 'Auto stand nearby' else null end);

    -- Bus available at gates near main roads (gate 1, 2, 4 typically)
    insert into public.transport_modes (gate_id, mode, available, avg_wait_minutes, notes)
    values (g.gate_id, 'bus',
            g.gate_number in (1, 2, 4),
            case when g.gate_number <= 2 then 8 else 12 end,
            case when g.gate_number <= 2 then 'Bus stop 50m' else 'Bus stop 200m+' end);
  end loop;
end $$;

-- ══════════════════════════════════════════════════════════════
-- CAB PROVIDERS
-- ══════════════════════════════════════════════════════════════

insert into public.cab_providers (brand, types, monogram, brand_color, deep_link_template, web_fallback_url, is_active, commission_info) values
  ('Uber',
   '{"Go","XL","Auto","Moto"}',
   'U',
   '#000000',
   'uber://?action=setPickup&pickup[latitude]={{pickup_lat}}&pickup[longitude]={{pickup_lng}}&dropoff[latitude]={{drop_lat}}&dropoff[longitude]={{drop_lng}}',
   'https://m.uber.com/ul/?action=setPickup&pickup[latitude]={{pickup_lat}}&pickup[longitude]={{pickup_lng}}&dropoff[latitude]={{drop_lat}}&dropoff[longitude]={{drop_lng}}',
   true,
   '20-25% commission'),

  ('Ola',
   '{"Mini","Prime","Auto"}',
   'O',
   '#4CAF50',
   'olacabs://app/launch?lat={{pickup_lat}}&lng={{pickup_lng}}&drop_lat={{drop_lat}}&drop_lng={{drop_lng}}',
   'https://book.olacabs.com/?lat={{pickup_lat}}&lng={{pickup_lng}}&drop_lat={{drop_lat}}&drop_lng={{drop_lng}}',
   true,
   '20-25% commission'),

  ('Rapido',
   '{"Cab","Auto","Bike"}',
   'R',
   '#FFCA28',
   'rapido://book?src_lat={{pickup_lat}}&src_lng={{pickup_lng}}&dst_lat={{drop_lat}}&dst_lng={{drop_lng}}',
   'https://www.rapido.bike/book?src_lat={{pickup_lat}}&src_lng={{pickup_lng}}&dst_lat={{drop_lat}}&dst_lng={{drop_lng}}',
   true,
   '15-20% commission'),

  ('Namma Yatri',
   '{"Auto","Cab"}',
   'N',
   '#2196F3',
   'nammayatri://book?pickup_lat={{pickup_lat}}&pickup_lng={{pickup_lng}}&drop_lat={{drop_lat}}&drop_lng={{drop_lng}}',
   'https://nammayatri.in/book?pickup_lat={{pickup_lat}}&pickup_lng={{pickup_lng}}&drop_lat={{drop_lat}}&drop_lng={{drop_lng}}',
   true,
   'Zero commission — driver keeps 100%');

-- ══════════════════════════════════════════════════════════════
-- CROWD PATTERNS — Hourly patterns for key stations
-- ══════════════════════════════════════════════════════════════

-- Generate crowd patterns for Guindy (all 4 gates, all 7 days, all 24 hours)
-- Weekday pattern: low at night, peak at 8-10AM and 5-7PM
-- Weekend pattern: generally lower, mild midday peak

do $$
declare
  s_id uuid;
  g integer;
  d integer;
  h integer;
  crowd double precision;
begin
  select id into s_id from public.stations where name = 'Guindy';

  for g in 1..4 loop
    for d in 0..6 loop
      for h in 0..23 loop
        -- Base crowd level varies by gate (gates 1-2 are busier)
        crowd := case when g <= 2 then 0.3 else 0.1 end;

        if d between 1 and 5 then
          -- Weekday pattern
          crowd := crowd + case
            when h between 0 and 5 then 0.0
            when h between 6 and 7 then 0.5
            when h between 8 and 9 then 2.2  -- morning rush
            when h between 10 and 11 then 1.2
            when h between 12 and 13 then 1.5 -- lunch
            when h between 14 and 16 then 1.0
            when h between 17 and 18 then 2.0 -- evening rush
            when h between 19 and 20 then 1.3
            when h between 21 and 23 then 0.4
            else 0.2
          end;
        else
          -- Weekend pattern
          crowd := crowd + case
            when h between 0 and 7 then 0.1
            when h between 8 and 9 then 0.5
            when h between 10 and 13 then 1.0
            when h between 14 and 17 then 1.2
            when h between 18 and 20 then 0.8
            when h between 21 and 23 then 0.3
            else 0.1
          end;
        end if;

        -- Clamp to 0-3 range
        crowd := least(3.0, greatest(0.0, crowd));

        insert into public.crowd_patterns (station_id, gate_number, day_of_week, hour, avg_crowd_level, sample_count)
        values (s_id, g, d, h, round(crowd::numeric, 1), 50 + floor(random() * 100)::int);
      end loop;
    end loop;
  end loop;
end $$;

-- Simplified crowd patterns for other key stations (gates 1 & 2 only, weekday peak hours)
do $$
declare
  s record;
  g integer;
  d integer;
  h integer;
  crowd double precision;
  base_busy double precision;
begin
  for s in select id, name from public.stations where name != 'Guindy'
  loop
    -- Different stations have different baseline busyness
    base_busy := case
      when s.name in ('CMBT', 'Egmore', 'Chennai Airport') then 0.4
      when s.name in ('Alandur', 'Vadapalani') then 0.3
      else 0.2
    end;

    for g in 1..4 loop
      for d in 0..6 loop
        for h in 0..23 loop
          crowd := base_busy + case when g <= 2 then 0.2 else 0.0 end;

          if d between 1 and 5 then
            crowd := crowd + case
              when h between 0 and 5 then 0.0
              when h between 6 and 7 then 0.4
              when h between 8 and 9 then 1.8
              when h between 10 and 16 then 0.8
              when h between 17 and 18 then 1.6
              when h between 19 and 20 then 0.9
              else 0.2
            end;
          else
            crowd := crowd + case
              when h between 10 and 17 then 0.8
              else 0.2
            end;
          end if;

          crowd := least(3.0, greatest(0.0, crowd));

          insert into public.crowd_patterns (station_id, gate_number, day_of_week, hour, avg_crowd_level, sample_count)
          values (s.id, g, d, h, round(crowd::numeric, 1), 20 + floor(random() * 50)::int);
        end loop;
      end loop;
    end loop;
  end loop;
end $$;

-- ══════════════════════════════════════════════════════════════
-- TRAVEL PATHS — Common destinations from Guindy gates
-- ══════════════════════════════════════════════════════════════

-- Phoenix Marketcity (from each Guindy gate)
insert into public.travel_paths (gate_id, destination_name, destination_lat, destination_lng, distance_km, walk_minutes, has_sidewalk, lighting_quality, crowd_typical) values
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 1),
   'Phoenix Marketcity', 12.9916, 80.2146, 2.1, 26, true, 'good', 2),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 2),
   'Phoenix Marketcity', 12.9916, 80.2146, 1.8, 22, true, 'good', 2),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 3),
   'Phoenix Marketcity', 12.9916, 80.2146, 2.3, 29, true, 'moderate', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 4),
   'Phoenix Marketcity', 12.9916, 80.2146, 2.6, 33, false, 'poor', 0);

-- Tidel Park
insert into public.travel_paths (gate_id, destination_name, destination_lat, destination_lng, distance_km, walk_minutes, has_sidewalk, lighting_quality, crowd_typical) values
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 1),
   'Tidel Park', 12.9880, 80.2270, 1.5, 19, true, 'good', 2),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 2),
   'Tidel Park', 12.9880, 80.2270, 1.2, 15, true, 'good', 2),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 3),
   'Tidel Park', 12.9880, 80.2270, 1.8, 23, true, 'moderate', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 4),
   'Tidel Park', 12.9880, 80.2270, 2.2, 28, false, 'poor', 0);

-- IIT Madras
insert into public.travel_paths (gate_id, destination_name, destination_lat, destination_lng, distance_km, walk_minutes, has_sidewalk, lighting_quality, crowd_typical) values
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 1),
   'IIT Madras', 12.9915, 80.2336, 2.0, 25, true, 'good', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 2),
   'IIT Madras', 12.9915, 80.2336, 1.7, 21, true, 'good', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 3),
   'IIT Madras', 12.9915, 80.2336, 2.3, 29, true, 'moderate', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 4),
   'IIT Madras', 12.9915, 80.2336, 2.8, 35, false, 'poor', 0);

-- Guindy National Park
insert into public.travel_paths (gate_id, destination_name, destination_lat, destination_lng, distance_km, walk_minutes, has_sidewalk, lighting_quality, crowd_typical) values
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 1),
   'Guindy National Park', 12.9720, 80.2240, 0.8, 10, true, 'moderate', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 2),
   'Guindy National Park', 12.9720, 80.2240, 1.0, 13, true, 'moderate', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 3),
   'Guindy National Park', 12.9720, 80.2240, 0.6, 8, true, 'good', 1),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Guindy') and gate_number = 4),
   'Guindy National Park', 12.9720, 80.2240, 0.9, 11, false, 'poor', 0);

-- Express Avenue (from Alandur gates)
insert into public.travel_paths (gate_id, destination_name, destination_lat, destination_lng, distance_km, walk_minutes, has_sidewalk, lighting_quality, crowd_typical) values
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Alandur') and gate_number = 1),
   'Express Avenue Mall', 13.0590, 80.2640, 7.5, 94, true, 'good', 2),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Alandur') and gate_number = 2),
   'Express Avenue Mall', 13.0590, 80.2640, 7.8, 98, true, 'good', 2);

-- T. Nagar (from Vadapalani gates)
insert into public.travel_paths (gate_id, destination_name, destination_lat, destination_lng, distance_km, walk_minutes, has_sidewalk, lighting_quality, crowd_typical) values
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Vadapalani') and gate_number = 1),
   'T. Nagar Ranganathan St', 13.0418, 80.2341, 2.8, 35, true, 'good', 3),
  ((select id from public.exit_gates where station_id = (select id from public.stations where name='Vadapalani') and gate_number = 2),
   'T. Nagar Ranganathan St', 13.0418, 80.2341, 3.0, 38, true, 'good', 3);
