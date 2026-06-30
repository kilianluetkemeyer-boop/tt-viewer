export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Ergebnis ────────────────────────────────────────────────────────────────
export interface Ergebnis {
  saetze: [number, number][]   // z.B. [[11,8],[9,11],[11,7]]
}

// ── Dashboard-View-Konfiguration ─────────────────────────────────────────────
export type DashboardViewTyp = 'live' | 'konkurrenz' | 'spieler' | 'status'

export interface DashboardView {
  typ: DashboardViewTyp
  konkurrenz_id?: number
  spieler_id?: number
}

// ── Datenbank-Typen (manuell, bis wir supabase gen types nutzen) ─────────────
export interface Database {
  public: {
    Tables: {
      verein: {
        Row: Verein
        Insert: Omit<Verein, 'id'>
        Update: Partial<Omit<Verein, 'id'>>
      }
      spieler: {
        Row: Spieler
        Insert: Omit<Spieler, 'id'>
        Update: Partial<Omit<Spieler, 'id'>>
      }
      spielklasse: {
        Row: Spielklasse
        Insert: Omit<Spielklasse, 'id'>
        Update: Partial<Omit<Spielklasse, 'id'>>
      }
      konkurrenz: {
        Row: Konkurrenz
        Insert: Omit<Konkurrenz, 'id'>
        Update: Partial<Omit<Konkurrenz, 'id'>>
      }
      phase: {
        Row: Phase
        Insert: Omit<Phase, 'id'>
        Update: Partial<Omit<Phase, 'id'>>
      }
      gruppe: {
        Row: Gruppe
        Insert: Omit<Gruppe, 'id'>
        Update: Partial<Omit<Gruppe, 'id'>>
      }
      team: {
        Row: Team
        Insert: Omit<Team, 'id'>
        Update: Partial<Omit<Team, 'id'>>
      }
      spiel: {
        Row: Spiel
        Insert: Omit<Spiel, 'id'>
        Update: Partial<Omit<Spiel, 'id'>>
      }
      dashboard: {
        Row: Dashboard
        Insert: Omit<Dashboard, 'id'>
        Update: Partial<Omit<Dashboard, 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ── Domain-Typen ─────────────────────────────────────────────────────────────
export interface Verein {
  id: number
  name: string
  ext_id: string
}

export interface Spieler {
  id: number
  name: string
  verein_id: number
  ext_id: string
}

export interface Spielklasse {
  id: number
  name: string
  ext_id: string
}

export type KonkurrenzTyp = 'einzel' | 'doppel'

export interface Konkurrenz {
  id: number
  spielklasse_id: number
  typ: KonkurrenzTyp
  name: string
  ext_id: string
}

export type PhaseArt = 'gruppe' | 'ko'
export type PhaseStatus = 'offen' | 'aktiv' | 'beendet'

export interface Phase {
  id: number
  konkurrenz_id: number
  art: PhaseArt
  status: PhaseStatus
  reihenfolge: number
  ext_id: string
}

export interface Gruppe {
  id: number
  phase_id: number
  name: string
  ext_id: string
}

export interface Team {
  id: number
  konkurrenz_id: number
  spieler_ids: number[]
  ext_id: string
}

export type SpielStatus = 'offen' | 'aktiv' | 'beendet'

export interface Spiel {
  id: number
  phase_id: number
  gruppe_id: number | null
  team_a_id: number
  team_b_id: number
  status: SpielStatus
  ergebnis: Ergebnis | null
  tisch: number | null
  zeit: string | null       // ISO-8601
  bracket_pos: number | null
  ext_id: string
}

export interface Dashboard {
  id: number
  name: string
  views: DashboardView[]
  rotations_intervall_sek: number
}
