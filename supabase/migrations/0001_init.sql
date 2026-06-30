-- ── Tabellen ─────────────────────────────────────────────────────────────────

create table verein (
  id       serial primary key,
  ext_id   text unique not null,
  name     text not null
);

create table spielklasse (
  id     serial primary key,
  ext_id text unique not null,
  name   text not null
);

create table spieler (
  id        serial primary key,
  ext_id    text unique not null,
  name      text not null,
  verein_id int references verein(id) on delete set null
);

create type konkurrenz_typ as enum ('einzel', 'doppel');

create table konkurrenz (
  id             serial primary key,
  ext_id         text unique not null,
  spielklasse_id int references spielklasse(id) on delete cascade,
  typ            konkurrenz_typ not null,
  name           text not null
);

create type phase_art    as enum ('gruppe', 'ko');
create type phase_status as enum ('offen', 'aktiv', 'beendet');

create table phase (
  id             serial primary key,
  ext_id         text unique not null,
  konkurrenz_id  int references konkurrenz(id) on delete cascade,
  art            phase_art    not null,
  status         phase_status not null default 'offen',
  reihenfolge    smallint     not null default 1
);

create table gruppe (
  id       serial primary key,
  ext_id   text unique not null,
  phase_id int references phase(id) on delete cascade,
  name     text not null
);

create table team (
  id            serial primary key,
  ext_id        text unique not null,
  konkurrenz_id int references konkurrenz(id) on delete cascade,
  spieler_ids   int[] not null
);

create type spiel_status as enum ('offen', 'aktiv', 'beendet');

create table spiel (
  id          serial primary key,
  ext_id      text unique not null,
  phase_id    int references phase(id) on delete cascade,
  gruppe_id   int references gruppe(id) on delete set null,
  team_a_id   int references team(id),
  team_b_id   int references team(id),
  status      spiel_status not null default 'offen',
  -- {"saetze": [[11,8],[9,11],[11,7]]}
  ergebnis    jsonb,
  tisch       smallint,
  zeit        timestamptz,
  bracket_pos smallint
);

create table dashboard (
  id                       serial primary key,
  name                     text not null,
  -- [{"typ": "live"}, {"typ": "konkurrenz", "konkurrenz_id": 3}]
  views                    jsonb not null default '[]',
  rotations_intervall_sek  smallint not null default 15
);

-- ── Indizes ───────────────────────────────────────────────────────────────────

create index on spiel(phase_id);
create index on spiel(status);
create index on spiel(gruppe_id);
create index on phase(konkurrenz_id);
create index on team(konkurrenz_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table verein      enable row level security;
alter table spielklasse enable row level security;
alter table spieler     enable row level security;
alter table konkurrenz  enable row level security;
alter table phase       enable row level security;
alter table gruppe      enable row level security;
alter table team        enable row level security;
alter table spiel       enable row level security;
alter table dashboard   enable row level security;

-- Anonyme Leserechte für alle Anzeigedaten
create policy "public read" on verein      for select using (true);
create policy "public read" on spielklasse for select using (true);
create policy "public read" on spieler     for select using (true);
create policy "public read" on konkurrenz  for select using (true);
create policy "public read" on phase       for select using (true);
create policy "public read" on gruppe      for select using (true);
create policy "public read" on team        for select using (true);
create policy "public read" on spiel       for select using (true);
create policy "public read" on dashboard   for select using (true);

-- Schreiben nur via service_role (externes Tool) – kein explizites Policy nötig,
-- da service_role RLS umgeht.

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Realtime wird im Supabase-Dashboard unter Database → Replication aktiviert.
-- Relevante Tabellen: spiel, phase
