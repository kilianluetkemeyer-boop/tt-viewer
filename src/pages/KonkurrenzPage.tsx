import { useParams, Link } from 'react-router-dom'
import { useKonkurrenzDetail, useKonkurrenzRealtime } from '../hooks/useKonkurrenzDetail'
import type { TeamInfo, SpielInfo, PhaseInfo, GruppeInfo } from '../hooks/useKonkurrenzDetail'
import GruppenTabelle from '../components/GruppenTabelle'
import KOBaum from '../components/KOBaum'

const PHASE_STATUS_BADGE: Record<PhaseInfo['status'], string> = {
  offen: 'bg-gray-100 text-gray-500',
  aktiv: 'bg-green-100 text-green-700',
  beendet: 'bg-blue-50 text-blue-600',
}

const PHASE_STATUS_LABEL: Record<PhaseInfo['status'], string> = {
  offen: 'Ausstehend',
  aktiv: 'Läuft',
  beendet: 'Beendet',
}

interface PhaseViewProps {
  phase: PhaseInfo
  spiele: SpielInfo[]
  gruppen: GruppeInfo[]
  teamMap: Map<number, TeamInfo>
}

function PhaseView({ phase, spiele, gruppen, teamMap }: PhaseViewProps) {
  const phaseSpiele = spiele.filter((s) => s.phase_id === phase.id)

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {phase.art === 'gruppe' ? 'Gruppenphase' : 'KO-Phase'}
        </h3>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${PHASE_STATUS_BADGE[phase.status]}`}>
          {PHASE_STATUS_LABEL[phase.status]}
        </span>
      </div>

      {phase.art === 'gruppe' ? (
        <div>
          {gruppen
            .filter((g) => g.phase_id === phase.id)
            .map((gruppe) => (
              <GruppenTabelle
                key={gruppe.id}
                gruppe={gruppe}
                spiele={phaseSpiele.filter((s) => s.gruppe_id === gruppe.id)}
                teamMap={teamMap}
              />
            ))}
        </div>
      ) : (
        <KOBaum spiele={phaseSpiele} teamMap={teamMap} />
      )}
    </div>
  )
}

export default function KonkurrenzPage() {
  const { id } = useParams<{ id: string }>()
  const numId = Number(id)
  const { data, isLoading, error } = useKonkurrenzDetail(numId)
  useKonkurrenzRealtime(numId)

  if (isLoading) return <div className="text-gray-400 py-8 text-center">Lade Konkurrenz…</div>
  if (error || !data) return <div className="text-red-500 py-8 text-center">Fehler beim Laden.</div>

  const teamMap = new Map(data.teams.map((t) => [t.id, t]))

  return (
    <div>
      <div className="mb-1">
        <Link to="/" className="text-sm text-blue-600 hover:underline">← Übersicht</Link>
      </div>
      <div className="mb-6">
        <p className="text-sm text-gray-500">{data.spielklasse.name}</p>
        <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{data.typ === 'doppel' ? 'Doppel' : 'Einzel'}</p>
      </div>

      {data.phasen.length === 0 && (
        <p className="text-gray-400">Noch keine Phasen angelegt.</p>
      )}

      {data.phasen.map((phase) => (
        <PhaseView
          key={phase.id}
          phase={phase}
          spiele={data.spiele}
          gruppen={data.gruppen}
          teamMap={teamMap}
        />
      ))}
    </div>
  )
}
