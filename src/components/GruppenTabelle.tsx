import type { SpielInfo, TeamInfo, GruppeInfo } from '../hooks/useKonkurrenzDetail'
import SpielKarte from './SpielKarte'

interface Props {
  gruppe: GruppeInfo
  spiele: SpielInfo[]
  teamMap: Map<number, TeamInfo>
}

interface TabellenEintrag {
  teamId: number
  spiele: number
  siege: number
  niederlagen: number
  saetzeGewonnen: number
  saetzeVerloren: number
}

function berechneTabelle(spiele: SpielInfo[]): TabellenEintrag[] {
  const map = new Map<number, TabellenEintrag>()

  const getOrCreate = (teamId: number) => {
    if (!map.has(teamId))
      map.set(teamId, { teamId, spiele: 0, siege: 0, niederlagen: 0, saetzeGewonnen: 0, saetzeVerloren: 0 })
    return map.get(teamId)!
  }

  for (const spiel of spiele) {
    if (spiel.status !== 'beendet' || !spiel.ergebnis) {
      getOrCreate(spiel.team_a_id)
      getOrCreate(spiel.team_b_id)
      continue
    }

    const saetze = spiel.ergebnis.saetze
    const saetzeA = saetze.filter(([a, b]) => a > b).length
    const saetzeB = saetze.filter(([a, b]) => b > a).length

    const a = getOrCreate(spiel.team_a_id)
    const b = getOrCreate(spiel.team_b_id)

    a.spiele++
    b.spiele++
    a.saetzeGewonnen += saetzeA
    a.saetzeVerloren += saetzeB
    b.saetzeGewonnen += saetzeB
    b.saetzeVerloren += saetzeA

    if (saetzeA > saetzeB) {
      a.siege++
      b.niederlagen++
    } else {
      b.siege++
      a.niederlagen++
    }
  }

  return [...map.values()].sort((a, b) => {
    if (b.siege !== a.siege) return b.siege - a.siege
    const diffA = a.saetzeGewonnen - a.saetzeVerloren
    const diffB = b.saetzeGewonnen - b.saetzeVerloren
    if (diffB !== diffA) return diffB - diffA
    return b.saetzeGewonnen - a.saetzeGewonnen
  })
}

function teamLabel(team: TeamInfo) {
  return team.spieler.map((s) => s.name).join(' / ')
}

export default function GruppenTabelle({ gruppe, spiele, teamMap }: Props) {
  const tabelle = berechneTabelle(spiele)

  return (
    <div className="mb-6">
      <h4 className="font-semibold text-gray-700 mb-2">Gruppe {gruppe.name}</h4>

      {tabelle.length > 0 && (
        <div className="mb-3 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left py-1 pr-2">#</th>
                <th className="text-left py-1 pr-4">Spieler</th>
                <th className="text-center py-1 px-2">Sp</th>
                <th className="text-center py-1 px-2">S</th>
                <th className="text-center py-1 px-2">N</th>
                <th className="text-center py-1 px-2">Sätze</th>
              </tr>
            </thead>
            <tbody>
              {tabelle.map((eintrag, idx) => {
                const team = teamMap.get(eintrag.teamId)
                return (
                  <tr key={eintrag.teamId} className={`border-b last:border-0 ${idx === 0 ? 'font-medium' : ''}`}>
                    <td className="py-1.5 pr-2 text-gray-400">{idx + 1}</td>
                    <td className="py-1.5 pr-4">{team ? teamLabel(team) : `Team ${eintrag.teamId}`}</td>
                    <td className="py-1.5 px-2 text-center text-gray-500">{eintrag.spiele}</td>
                    <td className="py-1.5 px-2 text-center text-green-700 font-medium">{eintrag.siege}</td>
                    <td className="py-1.5 px-2 text-center text-red-500">{eintrag.niederlagen}</td>
                    <td className="py-1.5 px-2 text-center text-gray-500 tabular-nums">
                      {eintrag.saetzeGewonnen}:{eintrag.saetzeVerloren}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-2">
        {spiele.map((spiel) => (
          <SpielKarte key={spiel.id} spiel={spiel} teamMap={teamMap} compact />
        ))}
      </div>
    </div>
  )
}
