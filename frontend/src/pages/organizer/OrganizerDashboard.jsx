import { useState, useEffect } from 'react'
import { CalendarDays, ShoppingBag, Ticket, TrendingUp, AlertCircle, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

const PAYMENT_CONFIG = {
  sedad:   { emoji: "🔴", label: "Sedad",   color: "bg-red-500/20 text-red-400 border-red-500/30" },
  masrivi: { emoji: '🟢', label: 'Masrivi', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  bankily: { emoji: '🟡', label: 'Bankily', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  default: { emoji: '💳', label: 'Autre',   color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    api.get('/stats/organizer').then(r => setStats(r.data.stats)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalPayments = stats?.paymentStats?.reduce((s, p) => s + (p._sum.totalAmount || 0), 0) || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Tableau de bord</h1>
        <p className="text-gray-400 text-sm mt-1">Gérez vos événements et tickets</p>
      </div>

      {stats?.pendingPayments > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-300">{stats.pendingPayments} paiement(s) en attente de validation</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Des acheteurs attendent la confirmation de leur commande</p>
          </div>
          <Link to="/organizer/orders" className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl transition-colors shrink-0">
            Voir
          </Link>
        </div>
      )}

      {/* Stats globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { icon: CalendarDays, label: 'Événements',    value: stats?.totalEvents,    color: 'bg-blue-500/20 text-blue-400' },
          { icon: ShoppingBag,  label: 'Commandes',     value: stats?.confirmedOrders, color: 'bg-green-500/20 text-green-400' },
          { icon: Ticket,       label: 'Tickets vendus', value: stats?.ticketsSold,    color: 'bg-sahara-500/20 text-sahara-400' },
          { icon: TrendingUp,   label: 'Revenus',       value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()} MRU` : '0 MRU', color: 'bg-emerald-500/20 text-emerald-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{value ?? '0'}</div>
          </div>
        ))}
      </div>

      {/* ── STATS PAR MÉTHODE DE PAIEMENT ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-5 h-5 text-sahara-400" />
          <h2 className="font-bold text-white">Paiements par méthode</h2>
        </div>

        {!stats?.paymentStats?.length ? (
          <p className="text-gray-500 text-sm text-center py-6">Aucun paiement confirmé pour le moment</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.paymentStats.map(p => {
              const method = (p.paymentMethod || "default").toLowerCase()
              const config = PAYMENT_CONFIG[method] || PAYMENT_CONFIG.default
              const count = p._count.id
              const amount = p._sum.totalAmount || 0
              const pct = totalPayments > 0 ? Math.round((amount / totalPayments) * 100) : 0
              const isSelected = selectedPayment === method

              return (
                <div key={method}
                  onClick={() => setSelectedPayment(isSelected ? null : method)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all ${config.color} ${isSelected ? 'scale-105 shadow-lg' : 'hover:opacity-90'}`}>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.emoji}</span>
                      <span className="font-bold text-sm">{config.label}</span>
                    </div>
                    <span className="text-xs font-bold opacity-70">{pct}%</span>
                  </div>

                  {/* Barre progression */}
                  <div className="h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
                    <div className="h-full rounded-full bg-current transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-black">{count}</div>
                      <div className="text-xs opacity-70">{count > 1 ? 'commandes' : 'commande'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black">{amount.toLocaleString()}</div>
                      <div className="text-xs opacity-70">MRU</div>
                    </div>
                  </div>

                  {/* Détail au clic */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-current/20 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="opacity-70">Moyenne / commande</span>
                        <span className="font-bold">{Math.round(amount / count).toLocaleString()} MRU</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="opacity-70">Part du total</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Total */}
        {stats?.paymentStats?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm text-gray-400">Total tous paiements confondus</span>
            <span className="text-lg font-black text-white">{totalPayments.toLocaleString()} MRU</span>
          </div>
        )}
      </div>

      {/* Performance par événement */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Performance par événement</h2>
          <Link to="/organizer/events" className="text-xs text-sahara-400 hover:text-sahara-300 transition-colors">Voir tout →</Link>
        </div>
        <div className="space-y-3">
          {stats?.eventStats?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Aucun événement créé</p>
              <Link to="/organizer/events/new" className="inline-flex items-center gap-2 mt-4 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                Créer mon premier événement
              </Link>
            </div>
          )}
          {stats?.eventStats?.map(event => {
            const totalSeats = event.ticketTypes.reduce((s, t) => s + t.totalSeats, 0)
            const soldSeats = event.orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0), 0)
            const pct = totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100) : 0
            return (
              <div key={event.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{soldSeats}/{totalSeats}</p>
                  <p className="text-xs text-gray-500">places</p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-sahara-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
