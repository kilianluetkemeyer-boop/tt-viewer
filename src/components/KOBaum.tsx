import type { SpielInfo, TeamInfo } from '../hooks/useKonkurrenzDetail'
import SpielKarte from './SpielKarte'

interface Props {
  spiele: SpielInfo[]
  teamMap: Map<number, TeamInfo>
}

// bracket_pos nutzt Binary-Heap-Nummerierung:
// 1 = Finale, 2-3 = HF, 4-7 = VF, 8-15 = Achtelfinale …
// Tiefe vom Finale: floor(log2(bracket_pos))
function tiefe(pos: number) {
  return Math.floor(Math.log2(pos))
}

const RUNDEN_NAMEN: Record<number, string> = {
  0: 'Finale',
  1: 'Halbfinale',
  2: 'Viertelfinale',
  3: 'Achtelfinale',
  4: 'Runde der letzten 32',
}

function rundenName(maxTiefe: number, t: number) {
  const fromEnd = maxTiefe - t
  return RUNDEN_NAMEN[fromEnd] ?? `Runde ${maxTiefe - t + 1}`
}

export default function KOBaum({ spiele, teamMap }: Props) {
  const mitPos = spiele.filter((s) => s.bracket_pos !== null)
  const ohnePos = spiele.filter((s) => s.bracket_pos === null)

  if (mitPos.length === 0) {
    return (
      <div className="grid gap-2">
        {spiele.map((s) => (
          <SpielKarte key={s.id} spiel={s} teamMap={teamMap} />
        ))}
      </div>
    )
  }

  const maxTiefe = Math.max(...mitPos.map((s) => tiefe(s.bracket_pos!)))

  // Gruppiere nach Tiefe (Runde), sortiere innerhalb nach bracket_pos
  const rundenMap = new Map<number, SpielInfo[]>()
  for (const s of mitPos) {
    const t = tiefe(s.bracket_pos!)
    if (!rundenMap.has(t)) rundenMap.set(t, [])
    rundenMap.get(t)!.push(s)
  }

  // Runden von früh (hohe Tiefe) zu spät (Tiefe 0 = Finale)
  const rundenSortiert = [...rundenMap.entries()]
    .sort(([a], [b]) => b - a)
    .map(([t, sp]) => ({
      t,
      label: rundenName(maxTiefe, t),
      spiele: sp.sort((a, b) => (a.bracket_pos ?? 0) - (b.bracket_pos ?? 0)),
    }))

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {rundenSortiert.map(({ t, label, spiele: rs }) => (
          <div key={t} className="min-w-52 shrink-0">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h5>
            <div className="flex flex-col gap-3">
              {rs.map((s) => (
                <SpielKarte key={s.id} spiel={s} teamMap={teamMap} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {ohnePos.length > 0 && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Weitere Spiele</h5>
          <div className="grid gap-2">
            {ohnePos.map((s) => (
              <SpielKarte key={s.id} spiel={s} teamMap={teamMap} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
