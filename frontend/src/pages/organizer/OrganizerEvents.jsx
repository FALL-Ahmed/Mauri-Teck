import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, MapPin, Users, Edit, Eye, Send } from 'lucide-react'
import api, { BASE_URL } from '../../utils/api'

const STATUS = {
  DRAFT:     { label: 'Brouillon',  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  PUBLISHED: { label: 'Publié',     color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  CANCELLED: { label: 'Annulé',     color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  COMPLETED: { label: 'Terminé',    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

export default function OrganizerEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = () => {
    setLoading(true)
    api.get('/events/me/list').then(r => setEvents(r.data.events)).finally(() => setLoading(false))
  }

  const handlePublish = async (id) => {
    try {
      await api.patch(`/events/${id}/publish`)
      fetchEvents()
    } catch (err) { alert(err.response?.data?.message || 'Erreur') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Mes événements</h1>
          <p className="text-gray-400 text-sm mt-1">{events.length} événement(s)</p>
        </div>
        <Link to="/organisateur/evenements/nouveau" className="flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" />Nouvel événement
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white/3 rounded-3xl border border-white/5">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">Aucun événement</h3>
          <p className="text-gray-500 mt-2 mb-6">Créez votre premier événement</p>
          <Link to="/organisateur/evenements/nouveau" className="inline-flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Créer un événement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map(event => {
            const s = STATUS[event.status]
            const totalSeats = event.ticketTypes.reduce((acc, t) => acc + t.totalSeats, 0)
            const soldSeats = totalSeats - event.ticketTypes.reduce((acc, t) => acc + t.availableSeats, 0)
            return (
              <div key={event.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                <div className="flex gap-4 p-5">
                  {event.image ? (
                    <img src={`${BASE_URL}${event.image}`} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-24 h-24 bg-sahara-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-8 h-8 text-sahara-400/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white truncate">{event.title}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${s?.color}`}>{s?.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.city}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{soldSeats}/{totalSeats} places</span>
                    </div>
                    <div className="mt-3">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-sahara-400 rounded-full" style={{ width: totalSeats > 0 ? `${(soldSeats / totalSeats) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 flex gap-2">
                  <Link to={`/organisateur/evenements/${event.id}/modifier`} className="flex items-center gap-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg transition-colors">
                    <Edit className="w-3.5 h-3.5" />Modifier
                  </Link>
                  {event.status === 'DRAFT' && (
                    <button onClick={() => handlePublish(event.id)} className="flex items-center gap-1.5 text-xs font-medium bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-2 rounded-lg transition-colors">
                      <Send className="w-3.5 h-3.5" />Publier
                    </button>
                  )}
                  <Link to={`/events/${event.id}`} target="_blank" className="flex items-center gap-1.5 text-xs font-medium bg-sahara-500/10 hover:bg-sahara-500/20 text-sahara-400 px-3 py-2 rounded-lg transition-colors">
                    <Eye className="w-3.5 h-3.5" />Voir public
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
