import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Minus, Plus, ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import { useCart } from '../../context/CartContext'
import api from '../../utils/api'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => {
        setEvent(r.data.event)
        const q = {}
        r.data.event.ticketTypes.forEach(t => { q[t.id] = 0 })
        setQuantities(q)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const setQty = (tid, v) => setQuantities(prev => ({ ...prev, [tid]: Math.max(0, v) }))

  const handleAddToCart = (ticketType) => {
    const qty = quantities[ticketType.id]
    if (qty === 0) { toast.error('Sélectionnez au moins 1 ticket'); return }
    addToCart(event, ticketType, qty)
    toast.success(`${qty} ticket(s) ajouté(s) au panier`)
    setQty(ticketType.id, 0)
  }

  const BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!event) return null

  const TZ = 'Africa/Nouakchott'
  const eventDate = new Date(event.date)
  const eventEndDate = event.endDate ? new Date(event.endDate) : null
  const displayDate = new Date(event.eventDate || event.endDate || event.date)
  const now = new Date()
  const isEventPassed = now > (eventEndDate || eventDate)

  const imgSrc = event.image ? (event.image.startsWith('http') ? event.image : `${BASE}${event.image}`) : null

  const diff = displayDate - now
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const fmtDate = (d, opts) => d.toLocaleDateString('fr-FR', { ...opts, timeZone: TZ })
  const fmtTime = (d, opts) => d.toLocaleTimeString('fr-FR', { ...opts, timeZone: TZ })

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">

        {/* Bouton retour */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux événements
        </button>

        {/* Bannière événement terminé */}
        {isEventPassed && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Cet événement est terminé</p>
              <p className="text-sm text-red-400/70">La vente de tickets est clôturée depuis le {fmtDate(displayDate, { day: 'numeric', month: 'long', year: 'numeric' })} à {fmtTime(displayDate, { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── COLONNE GAUCHE ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* IMAGE */}
            <div className="rounded-3xl overflow-hidden bg-[#111] border border-white/10 relative">
              {imgSrc ? (
                <img src={imgSrc} alt={event.title} className="w-full object-contain" />
              ) : (
                <div className="w-full h-72 sm:h-96 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${event.category?.color || '#D4A853'}22, #111)` }}>
                  <span className="text-9xl">{event.category?.icon || '🎫'}</span>
                </div>
              )}
              {/* Overlay si terminé */}
              {isEventPassed && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="bg-red-500/90 text-white font-black text-2xl px-8 py-4 rounded-2xl rotate-[-5deg]">
                    TERMINÉ
                  </div>
                </div>
              )}
            </div>

            {/* TITRE ET CATÉGORIE */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border"
                  style={{ background: `${event.category?.color || '#D4A853'}20`, color: event.category?.color || '#D4A853', borderColor: `${event.category?.color || '#D4A853'}40` }}>
                  {event.category?.icon} {event.category?.name}
                </span>
                {!isEventPassed && daysLeft >= 0 && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-sahara-500/20 border border-sahara-500/30 text-sahara-400">
                    ⏰ {daysLeft > 0 ? `J-${daysLeft}` : hoursLeft > 0 ? `H-${hoursLeft}` : 'Aujourd\'hui !'}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">{event.title}</h1>

              {/* Infos clés */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-sahara-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-sahara-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-bold text-white">
                      {fmtDate(displayDate, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {eventEndDate && fmtDate(eventEndDate, {}) !== fmtDate(eventDate, {}) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        → {fmtDate(eventEndDate, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-sahara-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-sahara-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Heure</p>
                    <p className="text-sm font-bold text-white">
                      {fmtTime(displayDate, { hour: '2-digit', minute: '2-digit' })}
                      {eventEndDate && ` → ${fmtTime(eventEndDate, { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-sahara-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-sahara-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Lieu</p>
                    <p className="text-sm font-bold text-white">{event.location}</p>
                    <p className="text-xs text-gray-400">{event.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-black text-white mb-3">À propos de l'événement</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* ORGANISATEUR */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-black text-white mb-4">Organisé par</h2>
              <div className="flex items-center gap-4">
                {event.organizer?.logo ? (
                  <img src={event.organizer.logo.startsWith('http') ? event.organizer.logo : `${BASE}${event.organizer.logo}`}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                ) : (
                  <div className="w-14 h-14 bg-sahara-500/20 rounded-2xl flex items-center justify-center text-2xl">🏢</div>
                )}
                <div>
                  <p className="font-bold text-white text-lg">{event.organizer?.companyName || event.organizer?.company_name}</p>
                  {event.organizer?.description && <p className="text-gray-400 text-sm mt-1">{event.organizer.description}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── COLONNE DROITE — TICKETS ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-[#111] border border-white/10 rounded-3xl p-6">

                {/* Si événement terminé */}
                {isEventPassed ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-xl font-black text-white mb-2">Vente clôturée</h2>
                    <p className="text-gray-400 text-sm">
                      La vente de tickets pour cet événement est terminée depuis le<br/>
                      <span className="text-red-400 font-bold">
                        {fmtDate(displayDate, { day: 'numeric', month: 'long' })} à {fmtTime(displayDate, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <p className="text-xs text-gray-500">Consultez nos autres événements disponibles</p>
                      <button onClick={() => navigate('/')}
                        className="mt-3 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-gray-300 transition-all">
                        Voir les événements →
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-black text-white mb-5">Choisir vos tickets</h2>
                    <div className="space-y-4">
                      {event.ticketTypes?.map(tt => (
                        <div key={tt.id} className="border border-white/10 rounded-2xl p-4 hover:border-sahara-500/40 transition-all"
                          style={{ borderLeftColor: tt.color || '#D4A853', borderLeftWidth: '3px' }}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white">{tt.name}</h3>
                              {tt.description && <p className="text-xs text-gray-400 mt-0.5">{tt.description}</p>}
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <div className="text-xl font-black text-sahara-400">
                                {tt.price === 0 ? 'Gratuit' : `${tt.price.toLocaleString()}`}
                              </div>
                              {tt.price > 0 && <div className="text-xs text-gray-500">MRU</div>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                            <Users className="w-3.5 h-3.5" />
                            {tt.availableSeats} places restantes
                          </div>

                          {tt.availableSeats > 0 ? (
                            <>
                              <div className="flex items-center justify-between mb-3">
                                <button onClick={() => setQty(tt.id, (quantities[tt.id] || 0) - 1)}
                                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-black text-white w-12 text-center">{quantities[tt.id] || 0}</span>
                                <button onClick={() => setQty(tt.id, (quantities[tt.id] || 0) + 1)}
                                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button onClick={() => handleAddToCart(tt)}
                                disabled={!quantities[tt.id]}
                                className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                                style={{ background: quantities[tt.id] ? 'linear-gradient(135deg, #D4A853, #b8882a)' : '#333' }}>
                                <ShoppingCart className="w-4 h-4" />
                                Ajouter au panier
                              </button>
                            </>
                          ) : (
                            <div className="text-center py-2 text-red-400 font-bold text-sm">Complet</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-4">
                      Paiement via Masrivi ou Bankily après commande
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
