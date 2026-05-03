import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, QrCode, Users } from 'lucide-react'
import api, { BASE_URL } from '../../utils/api'

export default function AgentEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tickets/my-events').then(r => setEvents(r.data.events)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-white">Mes événements</h1>
        <p className="text-gray-400 text-sm mt-1">Sélectionnez un événement pour scanner les tickets</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-white/3 rounded-3xl border border-white/5">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">Aucun événement assigné</h3>
          <p className="text-gray-500 mt-2">Votre organisateur doit vous assigner à un événement</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <Link key={event.id} to={`/agent/scanner/${event.id}`}
              className="block bg-white/5 border border-white/10 hover:border-sahara-500/40 rounded-2xl p-5 transition-all group">
              <div className="flex gap-4">
                {event.image ? (
                  <img src={`${BASE_URL}${event.image}`} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-sahara-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-8 h-8 text-sahara-400/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-sahara-400 transition-colors">{event.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.date).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}, {event.city}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-3">
                      {event.ticketTypes?.map(t => (
                        <div key={t.name} className="text-xs bg-white/5 rounded-lg px-2.5 py-1">
                          <span className="text-gray-400">{t.name}: </span>
                          <span className="text-white font-bold">{t.totalSeats - t.availableSeats}/{t.totalSeats}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sahara-400 group-hover:gap-2 transition-all">
                      <QrCode className="w-4 h-4" />Scanner
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
