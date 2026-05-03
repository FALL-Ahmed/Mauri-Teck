import { Link } from 'react-router-dom'
import { BASE_URL } from '../../utils/api'
import { Calendar, MapPin, Ticket, Users } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function EventCard({ event }) {
  const minPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map(t => t.price))
    : null
  const totalSeats = event.ticketTypes?.reduce((s, t) => s + t.availableSeats, 0) || 0

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <div className="card overflow-hidden hover:border-sahara-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sahara-400/10">
        {/* Image */}
        <div className="relative h-48 bg-night-700 overflow-hidden">
          {event.image ? (
            <img src={event.image?.startsWith('http') ? event.image : `${BASE_URL}${event.image}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-night-700 to-night-900">
              <Ticket className="w-16 h-16 text-night-600" />
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="badge text-xs px-2 py-1 rounded-full font-semibold" style={{ background: `${event.category?.color}22`, color: event.category?.color, border: `1px solid ${event.category?.color}44` }}>
              {event.category?.icon} {event.category?.name}
            </span>
          </div>
          {/* Organizer */}
          {event.organizer?.logo && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full overflow-hidden border-2 border-sahara-400/30 bg-night-800">
              <img src={event.organizer.logo} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-display font-bold text-lg text-desert-50 group-hover:text-sahara-400 transition-colors line-clamp-2 leading-tight">
            {event.title}
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-desert-400 text-sm">
              <Calendar className="w-3.5 h-3.5 text-sahara-400 flex-shrink-0" />
              <span>{format(new Date(event.date), "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-2 text-desert-400 text-sm">
              <MapPin className="w-3.5 h-3.5 text-sahara-400 flex-shrink-0" />
              <span className="truncate">{event.location}, {event.city}</span>
            </div>
            <div className="flex items-center gap-2 text-desert-400 text-sm">
              <Users className="w-3.5 h-3.5 text-sahara-400 flex-shrink-0" />
              <span>{totalSeats} places disponibles</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-night-700">
            <div>
              {minPrice !== null ? (
                <div>
                  <span className="text-xs text-desert-500">À partir de</span>
                  <div className="font-display font-bold text-sahara-400 text-lg">{minPrice.toLocaleString()} MRU</div>
                </div>
              ) : (
                <span className="text-desert-500 text-sm">Prix non défini</span>
              )}
            </div>
            <span className="btn-gold py-1.5 px-4 text-sm">Voir →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
