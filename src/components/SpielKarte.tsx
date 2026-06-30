import type { SpielInfo, TeamInfo } from '../hooks/useKonkurrenzDetail'

interface Props {
  spiel: SpielInfo
  teamMap: Map<number, TeamInfo>
  compact?: boolean
}

function teamLabel(team: TeamInfo) {
  return team.spieler.map((s) => s.name).join(' / ')
}

function ErgebnisAnzeige({ spiel, teamMap }: { spiel: SpielInfo; teamMap: Map<number, TeamInfo> }) {
  if (spiel.status !== 'beendet' || !spiel.ergebnis) return null

  const saetze = spiel.ergebnis.saetze
  const saetzeA = saetze.filter(([a, b]) => a > b).length
  const saetzeB = saetze.filter(([a, b]) => b > a).length
  const teamA = teamMap.get(spiel.team_a_id)
  const teamB = teamMap.get(spiel.team_b_id)
  const winnerA = saetzeA > saetzeB

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2 text-sm">
        <span className={winnerA ? 'font-bold text-gray-900' : 'text-gray-500'}>
          {teamA ? teamLabel(teamA) : `Team ${spiel.team_a_id}`}
        </span>
        <span className="font-bold text-blue-700 tabular-nums">
          {saetzeA}:{saetzeB}
        </span>
        <span className={!winnerA ? 'font-bold text-gray-900' : 'text-gray-500'}>
          {teamB ? teamLabel(teamB) : `Team ${spiel.team_b_id}`}
        </span>
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        {saetze.map(([a, b], i) => (
          <span key={i} className="mr-1">{a}:{b}</span>
        ))}
      </div>
    </div>
  )
}

const STATUS_BADGE: Record<SpielInfo['status'], string> = {
  offen: 'bg-gray-100 text-gray-500',
  aktiv: 'bg-green-100 text-green-700 animate-pulse',
  beendet: 'bg-blue-50 text-blue-600',
}

const STATUS_LABEL: Record<SpielInfo['status'], string> = {
  offen: 'Offen',
  aktiv: '● Live',
  beendet: 'Beendet',
}

export default function SpielKarte({ spiel, teamMap, compact = false }: Props) {
  const teamA = teamMap.get(spiel.team_a_id)
  const teamB = teamMap.get(spiel.team_b_id)

  if (spiel.status === 'beendet') {
    return (
      <div className={`rounded-lg border bg-white px-3 py-2 ${compact ? '' : 'shadow-sm'}`}>
        <ErgebnisAnzeige spiel={spiel} teamMap={teamMap} />
        <div className="flex gap-2 mt-1 text-xs text-gray-400">
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE.beendet}`}>
            {STATUS_LABEL.beendet}
          </span>
          {spiel.tisch && <span>Tisch {spiel.tisch}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border bg-white px-3 py-2 ${compact ? '' : 'shadow-sm'} ${spiel.status === 'aktiv' ? 'border-green-300 bg-green-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">
          <div className={spiel.status === 'aktiv' ? 'font-semibold text-gray-900' : 'text-gray-700'}>
            {teamA ? teamLabel(teamA) : '?'}
          </div>
          <div className="text-gray-400 text-xs">vs.</div>
          <div className={spiel.status === 'aktiv' ? 'font-semibold text-gray-900' : 'text-gray-700'}>
            {teamB ? teamLabel(teamB) : '?'}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[spiel.status]}`}>
            {STATUS_LABEL[spiel.status]}
          </span>
          {spiel.tisch && <span className="text-xs text-gray-400">Tisch {spiel.tisch}</span>}
          {spiel.zeit && (
            <span className="text-xs text-gray-400">
              {new Date(spiel.zeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
