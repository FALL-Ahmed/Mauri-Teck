import { useState, useEffect } from 'react'
import { Users, CalendarDays, Ticket, TrendingUp, ShoppingBag, Clock, CheckCircle } from 'lucide-react'
import api from '../../utils/api'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-400 font-medium">{label}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-3xl font-black text-white">{value ?? '—'}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats/admin').then(r => setStats(r.data.stats)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Tableau de bord</h1>
        <p className="text-gray-400 text-sm mt-1">Vue globale de la plateforme Mauri-Ticket</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard icon={CalendarDays} label="Événements" value={stats?.totalEvents} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={Users} label="Organisateurs" value={stats?.totalOrganizers} color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={Users} label="Agents" value={stats?.totalAgents} color="bg-cyan-500/20 text-cyan-400" />
        <StatCard icon={ShoppingBag} label="Commandes confirmées" value={stats?.confirmedOrders} color="bg-green-500/20 text-green-400" />
        <StatCard icon={Ticket} label="Tickets émis" value={stats?.totalTickets} color="bg-sahara-500/20 text-sahara-400" />
        <StatCard icon={TrendingUp} label="Revenus totaux" value={stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()} MRU` : '0 MRU'} color="bg-emerald-500/20 text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sahara-400" />Commandes récentes
          </h2>
          <div className="space-y-3">
            {stats?.recentOrders?.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Aucune commande</p>}
            {stats?.recentOrders?.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{order.event?.title}</p>
                  <p className="text-xs text-gray-500 font-mono">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sahara-400">{order.totalAmount?.toLocaleString()} MRU</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {order.status === 'CONFIRMED' ? 'Confirmé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top events */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sahara-400" />Top Événements
          </h2>
          <div className="space-y-3">
            {stats?.topEvents?.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Aucun événement</p>}
            {stats?.topEvents?.map((event, i) => (
              <div key={event.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="w-7 h-7 rounded-lg bg-sahara-500/20 text-sahara-400 font-black text-sm flex items-center justify-center">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.organizer?.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{event._count?.orders}</p>
                  <p className="text-xs text-gray-500">commandes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
