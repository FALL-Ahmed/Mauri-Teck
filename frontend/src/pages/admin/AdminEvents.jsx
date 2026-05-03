import { useState, useEffect } from 'react'
import { Calendar, MapPin, Ticket, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { BASE_URL } from '../../utils/api'

const STATUS = {
  DRAFT:     { label: 'Brouillon',  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  PUBLISHED: { label: 'Publié',     color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  CANCELLED: { label: 'Annulé',     color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  COMPLETED: { label: 'Terminé',    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events/admin/all').then(r => setEvents(r.data.events)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Tous les événements</h1>
        <p className="text-gray-400 text-sm mt-1">{events.length} événement(s) sur la plateforme</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Événement</th>
                  <th className="text-left px-5 py-3">Organisateur</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Ville</th>
                  <th className="text-left px-5 py-3">Statut</th>
                  <th className="text-left px-5 py-3">Commandes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map(event => {
                  const s = STATUS[event.status]
                  return (
                    <tr key={event.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img src={`${BASE_URL}${event.image}`} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-sahara-500/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-sahara-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-300">{event.organizer?.companyName}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{new Date(event.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{event.city}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s?.color}`}>{s?.label}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-white">{event._count?.orders}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
