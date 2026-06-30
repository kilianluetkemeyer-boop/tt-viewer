import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Ergebnis } from '../lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export interface SpielerInfo {
  id: number
  name: string
  verein_name: string | null
}

export interface TeamInfo {
  id: number
  spieler: SpielerInfo[]
}

export interface SpielInfo {
  id: number
  phase_id: number
  gruppe_id: number | null
  team_a_id: number
  team_b_id: number
  status: 'offen' | 'aktiv' | 'beendet'
  ergebnis: Ergebnis | null
  tisch: number | null
  zeit: string | null
  bracket_pos: number | null
}

export interface GruppeInfo {
  id: number
  phase_id: number
  name: string
}

export interface PhaseInfo {
  id: number
  konkurrenz_id: number
  art: 'gruppe' | 'ko'
  status: 'offen' | 'aktiv' | 'beendet'
  reihenfolge: number
}

export interface KonkurrenzDetail {
  id: number
  name: string
  typ: 'einzel' | 'doppel'
  spielklasse: { id: number; name: string }
  phasen: PhaseInfo[]
  gruppen: GruppeInfo[]
  spiele: SpielInfo[]
  teams: TeamInfo[]
}

export function useKonkurrenzDetail(id: number) {
  return useQuery({
    queryKey: ['konkurrenz-detail', id],
    queryFn: async (): Promise<KonkurrenzDetail> => {
      const [{ data: kRaw }, { data: phasenRaw }, { data: teamsRaw }] = await Promise.all([
        supabase.from('konkurrenz').select('*, spielklasse(id, name)').eq('id', id).single(),
        supabase.from('phase').select('*').eq('konkurrenz_id', id).order('reihenfolge'),
        supabase.from('team').select('*').eq('konkurrenz_id', id),
      ])

      const k = kRaw as Row | null
      const phasen = (phasenRaw as Row[] | null) ?? []
      const teams = (teamsRaw as Row[] | null) ?? []

      if (!k) throw new Error('Konkurrenz nicht gefunden')

      const phaseIds = phasen.map((p) => p.id as number)

      const [{ data: gruppenRaw }, { data: spieleRaw }] = await Promise.all([
        phaseIds.length > 0
          ? supabase.from('gruppe').select('*').in('phase_id', phaseIds).order('name')
          : Promise.resolve({ data: [] }),
        phaseIds.length > 0
          ? supabase.from('spiel').select('*').in('phase_id', phaseIds).order('bracket_pos', { nullsFirst: false })
          : Promise.resolve({ data: [] }),
      ])

      const gruppen = (gruppenRaw as Row[] | null) ?? []
      const spieleRawArr = (spieleRaw as Row[] | null) ?? []

      const allSpielerIds = [...new Set(teams.flatMap((t) => t.spieler_ids as number[]))]
      const { data: spielerRaw } = allSpielerIds.length > 0
        ? await supabase.from('spieler').select('id, name, verein(name)').in('id', allSpielerIds)
        : { data: [] }

      const spielerRows = (spielerRaw as Row[] | null) ?? []
      const spielerMap = new Map(
        spielerRows.map((s) => [
          s.id as number,
          { id: s.id as number, name: s.name as string, verein_name: (s.verein as Row | null)?.name as string | null ?? null },
        ]),
      )

      const teamInfos: TeamInfo[] = teams.map((t) => ({
        id: t.id as number,
        spieler: (t.spieler_ids as number[]).map(
          (sid) => spielerMap.get(sid) ?? { id: sid, name: `#${sid}`, verein_name: null },
        ),
      }))

      return {
        id: k.id as number,
        name: k.name as string,
        typ: k.typ as 'einzel' | 'doppel',
        spielklasse: k.spielklasse as { id: number; name: string },
        phasen: phasen as unknown as PhaseInfo[],
        gruppen: gruppen as unknown as GruppeInfo[],
        spiele: spieleRawArr.map((s) => ({
          id: s.id as number,
          phase_id: s.phase_id as number,
          gruppe_id: s.gruppe_id as number | null,
          team_a_id: s.team_a_id as number,
          team_b_id: s.team_b_id as number,
          status: s.status as SpielInfo['status'],
          ergebnis: s.ergebnis as Ergebnis | null,
          tisch: s.tisch as number | null,
          zeit: s.zeit as string | null,
          bracket_pos: s.bracket_pos as number | null,
        })),
        teams: teamInfos,
      }
    },
    enabled: !!id,
  })
}

export function useKonkurrenzRealtime(id: number) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`konkurrenz-rt-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spiel' }, () => {
        queryClient.invalidateQueries({ queryKey: ['konkurrenz-detail', id] })
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'phase', filter: `konkurrenz_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['konkurrenz-detail', id] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, queryClient])
}
