import { Link } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

export default function EventCard({ event }) {
  const minPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map(t => t.price))
    : null
  const totalSeats    = event.ticketTypes?.reduce((s, t) => s + t.availableSeats, 0) || 0
  const totalAllSeats = event.ticketTypes?.reduce((s, t) => s + t.totalSeats, 0) || 0
  const soldPct       = totalAllSeats > 0 ? Math.round(((totalAllSeats - totalSeats) / totalAllSeats) * 100) : 0
  const isSoldOut     = totalSeats === 0 && totalAllSeats > 0
  const isAlmostFull  = soldPct >= 80 && !isSoldOut

  const displayDate = new Date(event.eventDate || event.endDate || event.date)
  const TZ = 'Africa/Nouakchott'
  const day   = displayDate.toLocaleDateString('fr-FR', { day: '2-digit', timeZone: TZ })
  const month = displayDate.toLocaleDateString('fr-FR', { month: 'short', timeZone: TZ }).toUpperCase()
  const time  = displayDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ })

  const BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`
  const imgSrc = event.image ? (event.image.startsWith('http') ? event.image : `${BASE}${event.image}`) : null

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <div className="relative rounded-3xl overflow-hidden bg-[#111] border border-white/5 hover:border-sahara-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sahara-400/10">
        <div className="relative overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={event.title}
              className="w-full" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${event.category?.color || '#D4A853'}22, #080808)` }}>
              <span className="text-7xl mb-2">{event.category?.icon || 'ticket'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2 text-center min-w-[52px]">
            <div className="text-2xl font-black text-white leading-none">{day}</div>
            <div className="text-xs font-bold text-sahara-400 mt-0.5">{month}</div>
          </div>
          <div className="absolute top-4 right-4">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-black/70 backdrop-blur-md"
              style={{ color: event.category?.color || '#D4A853', borderColor: event.category?.color || '#D4A853' }}>
              {event.category?.icon} {event.category?.name}
            </span>
          </div>
          {isSoldOut && (
            <div className="absolute bottom-16 right-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">COMPLET</div>
          )}
          {isAlmostFull && !isSoldOut && (
            <div className="absolute bottom-16 right-4 bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse">PRESQUE PLEIN</div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-black text-lg leading-tight line-clamp-2 drop-shadow-lg">{event.title}</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sahara-400 shrink-0" />{event.location}, {event.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sahara-400 shrink-0" />{time}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3 truncate">
            Par <span className="text-gray-300">{event.organizer?.company_name || event.organizer?.companyName}</span>
          </p>
          {totalAllSeats > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{totalSeats} places restantes</span>
                <span>{soldPct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${soldPct}%`, background: soldPct >= 80 ? '#f97316' : soldPct >= 50 ? '#D4A853' : '#22c55e' }} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">A partir de</span>
              <div className="text-xl font-black text-sahara-400">
                {minPrice === null ? '-' : minPrice === 0 ? 'Gratuit' : `${minPrice.toLocaleString()} MRU`}
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-xl transition-all bg-sahara-500/20 border border-sahara-500/30 text-sahara-400 group-hover:bg-sahara-500 group-hover:text-white group-hover:border-sahara-500">
              Voir <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
