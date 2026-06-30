import { Link } from 'react-router-dom'
import { useSpielklassen } from '../hooks/useSpielklassen'

export default function HomePage() {
  const { data, isLoading, error } = useSpielklassen()

  if (isLoading) return <div className="text-gray-400 py-8 text-center">Lade Turnierdaten…</div>
  if (error) return <div className="text-red-500 py-8 text-center">Fehler beim Laden der Daten.</div>
  if (!data || data.length === 0)
    return <div className="text-gray-400 py-8 text-center">Noch keine Turnierdaten vorhanden.</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Spielklassen</h1>
      <div className="grid gap-4">
        {data.map((sk) => (
          <div key={sk.id} className="rounded-xl border bg-white shadow-sm p-4">
            <h2 className="font-semibold text-lg text-gray-800 mb-3">{sk.name}</h2>
            {sk.konkurrenzen.length === 0 ? (
              <p className="text-sm text-gray-400">Keine Konkurrenzen</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sk.konkurrenzen.map((k) => (
                  <Link
                    key={k.id}
                    to={`/konkurrenz/${k.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {k.name}
                    <span className="text-xs text-blue-400">{k.typ === 'doppel' ? 'D' : 'E'}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
