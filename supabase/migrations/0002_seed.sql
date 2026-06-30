-- ── Vereine ──────────────────────────────────────────────────────────────────
insert into verein (ext_id, name) values
  ('v1', 'TSV Musterstadt'),
  ('v2', 'SV Beispieldorf'),
  ('v3', 'TTC Testingen'),
  ('v4', 'SC Demobach');

-- ── Spieler ───────────────────────────────────────────────────────────────────
insert into spieler (ext_id, name, verein_id) values
  ('s1',  'Anna Müller',     1),
  ('s2',  'Ben Schmidt',     1),
  ('s3',  'Clara Weber',     2),
  ('s4',  'David Koch',      2),
  ('s5',  'Eva Bauer',       3),
  ('s6',  'Felix Braun',     3),
  ('s7',  'Greta Lang',      4),
  ('s8',  'Hans Kern',       4),
  ('s9',  'Ida Vogel',       1),
  ('s10', 'Jonas Wolf',      2),
  ('s11', 'Kira Fuchs',      3),
  ('s12', 'Luca Hartmann',   4);

-- ── Spielklassen ─────────────────────────────────────────────────────────────
insert into spielklasse (ext_id, name) values
  ('sk1', 'Herren A'),
  ('sk2', 'Damen'),
  ('sk3', 'Mixed Doppel');

-- ── Konkurrenzen ─────────────────────────────────────────────────────────────
insert into konkurrenz (ext_id, spielklasse_id, typ, name) values
  ('k1', 1, 'einzel', 'Herren A Einzel'),
  ('k2', 2, 'einzel', 'Damen Einzel'),
  ('k3', 3, 'doppel', 'Mixed Doppel');

-- ── Phasen ───────────────────────────────────────────────────────────────────
insert into phase (ext_id, konkurrenz_id, art, status, reihenfolge) values
  -- Herren A: Gruppe (beendet) + KO (aktiv)
  ('p1', 1, 'gruppe', 'beendet', 1),
  ('p2', 1, 'ko',     'aktiv',   2),
  -- Damen: nur KO (aktiv)
  ('p3', 2, 'ko',     'aktiv',   1),
  -- Mixed Doppel: KO (offen)
  ('p4', 3, 'ko',     'offen',   1);

-- ── Gruppen ──────────────────────────────────────────────────────────────────
insert into gruppe (ext_id, phase_id, name) values
  ('g1', 1, 'A'),
  ('g2', 1, 'B');

-- ── Teams ─────────────────────────────────────────────────────────────────────
-- Herren A Einzel (je 1 Spieler)
insert into team (ext_id, konkurrenz_id, spieler_ids) values
  ('t1',  1, '{2}'),   -- Ben Schmidt
  ('t2',  1, '{4}'),   -- David Koch
  ('t3',  1, '{6}'),   -- Felix Braun
  ('t4',  1, '{8}'),   -- Hans Kern
  ('t5',  1, '{10}'),  -- Jonas Wolf
  ('t6',  1, '{12}'),  -- Luca Hartmann
  -- Damen Einzel (je 1 Spielerin)
  ('t7',  2, '{1}'),   -- Anna Müller
  ('t8',  2, '{3}'),   -- Clara Weber
  ('t9',  2, '{5}'),   -- Eva Bauer
  ('t10', 2, '{7}'),   -- Greta Lang
  -- Mixed Doppel (je 2 Spieler)
  ('t11', 3, '{2,1}'),  -- Ben & Anna
  ('t12', 3, '{4,3}'),  -- David & Clara
  ('t13', 3, '{6,5}'),  -- Felix & Eva
  ('t14', 3, '{8,7}');  -- Hans & Greta

-- ── Spiele: Herren A Gruppenphase (beendet) ──────────────────────────────────
-- Gruppe A: t1 (Ben), t2 (David), t3 (Felix)
insert into spiel (ext_id, phase_id, gruppe_id, team_a_id, team_b_id, status, ergebnis, tisch) values
  ('sp1', 1, 1, 1, 2, 'beendet', '{"saetze": [[11,8],[11,6],[9,11],[11,9]]}', 1),
  ('sp2', 1, 1, 1, 3, 'beendet', '{"saetze": [[11,7],[8,11],[11,8],[11,5]]}', 1),
  ('sp3', 1, 1, 2, 3, 'beendet', '{"saetze": [[9,11],[11,8],[11,9],[8,11],[11,7]]}', 2);

-- Gruppe B: t4 (Hans), t5 (Jonas), t6 (Luca)
insert into spiel (ext_id, phase_id, gruppe_id, team_a_id, team_b_id, status, ergebnis, tisch) values
  ('sp4', 1, 2, 4, 5, 'beendet', '{"saetze": [[11,9],[9,11],[11,13],[11,8],[12,10]]}', 3),
  ('sp5', 1, 2, 4, 6, 'beendet', '{"saetze": [[11,5],[11,7],[11,9]]}', 3),
  ('sp6', 1, 2, 5, 6, 'beendet', '{"saetze": [[11,8],[11,6],[11,4]]}', 4);

-- ── Spiele: Herren A KO-Phase (aktiv, bracket_pos nach Binary-Heap) ───────────
-- HF (pos 2+3), Finale (pos 1)
insert into spiel (ext_id, phase_id, gruppe_id, team_a_id, team_b_id, status, ergebnis, tisch, bracket_pos) values
  ('sp7',  2, null, 1, 4, 'beendet', '{"saetze": [[11,7],[9,11],[11,8],[11,6]]}', 1, 2),
  ('sp8',  2, null, 5, 2, 'aktiv',   null, 2, 3),
  ('sp9',  2, null, 1, 5, 'offen',   null, null, 1);

-- ── Spiele: Damen KO (aktiv) ──────────────────────────────────────────────────
-- VF (pos 4-7), HF (pos 2-3), F (pos 1)
insert into spiel (ext_id, phase_id, gruppe_id, team_a_id, team_b_id, status, ergebnis, tisch, bracket_pos) values
  ('sp10', 3, null, 7,  8,  'beendet', '{"saetze": [[11,8],[11,6],[11,9]]}', 3, 4),
  ('sp11', 3, null, 9,  10, 'beendet', '{"saetze": [[9,11],[11,9],[8,11],[11,7],[11,8]]}', 4, 5),
  ('sp12', 3, null, 7,  9,  'aktiv',   null, 3, 2),
  ('sp13', 3, null, 8,  10, 'offen',   null, null, 3),
  ('sp14', 3, null, 7,  8,  'offen',   null, null, 1);

-- ── Spiele: Mixed Doppel KO (offen) ──────────────────────────────────────────
insert into spiel (ext_id, phase_id, gruppe_id, team_a_id, team_b_id, status, tisch, bracket_pos) values
  ('sp15', 4, null, 11, 12, 'offen', null, null, 2),
  ('sp16', 4, null, 13, 14, 'offen', null, null, 3),
  ('sp17', 4, null, 11, 13, 'offen', null, null, 1);
