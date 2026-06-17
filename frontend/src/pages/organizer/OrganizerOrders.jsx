import { useState, useEffect } from 'react'
import { CheckCircle, Eye, Clock, XCircle } from 'lucide-react'
import api, { BASE_URL } from '../../utils/api'

const STATUS = {
  PENDING:          { label: 'En attente',       color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  PAYMENT_UPLOADED: { label: 'Paiement reçu',    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  CONFIRMED:        { label: 'Confirmé ✓',        color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  CANCELLED:        { label: 'Annulé',            color: 'bg-red-500/20 text-red-300 border-red-500/30' },
}

export default function OrganizerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('PAYMENT_UPLOADED')
  const [proofModal, setProofModal] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)

  useEffect(() => { fetchOrders() }, [tab])

  const fetchOrders = () => {
    setLoading(true)
    api.get(`/orders/organizer/all?status=${tab}`).then(r => setOrders(r.data.orders)).finally(() => setLoading(false))
  }

  const handleConfirm = async (orderId) => {
    setConfirming(orderId)
    try {
      await api.patch(`/orders/${orderId}/confirm`)
      fetchOrders()
      alert('✅ Commande confirmée ! Les tickets QR ont été générés.')
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la confirmation')
    } finally { setConfirming(null) }
  }

  const handleCancel = async () => {
    if (!cancelModal) return
    setCancelling(cancelModal.id)
    try {
      await api.patch(`/orders/${cancelModal.id}/reject`)
      setCancelModal(null)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation')
    } finally { setCancelling(null) }
  }

  const TABS = [
    { key: 'PAYMENT_UPLOADED', label: 'Paiements reçus' },
    { key: 'CONFIRMED',        label: 'Confirmées' },
    { key: 'PENDING',          label: 'En attente' },
    { key: 'CANCELLED',        label: 'Annulées' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Commandes</h1>
        <p className="text-gray-400 text-sm mt-1">Gérez et validez les paiements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.key ? 'bg-sahara-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white/3 rounded-2xl border border-white/5">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Aucune commande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const s = STATUS[order.status]
            const canCancel = order.status === 'PENDING' || order.status === 'PAYMENT_UPLOADED'
            return (
              <div key={order.id} className={`bg-white/5 border rounded-2xl p-5 transition-all ${
                order.status === 'PAYMENT_UPLOADED' ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-sahara-400 font-bold">{order.orderNumber}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s?.color}`}>{s?.label}</span>
                    </div>
                    <h3 className="text-white font-bold mt-2">{order.event?.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{new Date(order.event?.date).toLocaleDateString('fr-FR')}</p>

                    {/* Client info */}
                    <div className="mt-3 text-sm text-gray-300">
                      <span className="text-gray-500">Client : </span>
                      {order.guestName || order.user?.name || '—'}
                      {(order.guestEmail || order.user?.email) && (
                        <span className="text-gray-500 ml-2">({order.guestEmail || order.user?.email})</span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="mt-3 space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs bg-white/3 rounded-lg px-3 py-2">
                          <span className="text-gray-300">{item.ticketType?.name} × {item.quantity}</span>
                          <span className="font-bold text-white">{(item.unitPrice * item.quantity).toLocaleString()} MRU</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-sahara-400 font-bold">{order.totalAmount?.toLocaleString()} MRU</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                      {order.paymentMethod && (
                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-gray-300">
                          💳 {order.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {order.paymentProof && (
                      <button onClick={() => setProofModal(order.paymentProof.startsWith('http') ? order.paymentProof : `${BASE_URL}${order.paymentProof}`)}
                        className="flex items-center gap-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Voir reçu
                      </button>
                    )}
                    {order.status === 'PAYMENT_UPLOADED' && (
                      <button onClick={() => handleConfirm(order.id)} disabled={confirming === order.id}
                        className="flex items-center gap-1.5 text-xs font-bold bg-green-500 hover:bg-green-400 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {confirming === order.id ? 'Validation...' : 'Valider'}
                      </button>
                    )}
                    {canCancel && (
                      <button onClick={() => setCancelModal(order)}
                        className="flex items-center gap-1.5 text-xs font-bold bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-2 rounded-lg transition-colors border border-red-500/30">
                        <XCircle className="w-3.5 h-3.5" /> Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal confirmation annulation */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setCancelModal(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Annuler la commande ?</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cette action est irréversible</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-5">
              <div className="font-mono text-xs text-sahara-400 mb-1">{cancelModal.orderNumber}</div>
              <div className="text-white font-bold">{cancelModal.event?.title}</div>
              <div className="text-gray-400 text-sm mt-1">
                {cancelModal.guestName || cancelModal.user?.name || '—'}
              </div>
              <div className="text-sahara-400 font-bold mt-2">{cancelModal.totalAmount?.toLocaleString()} MRU</div>
            </div>

            <p className="text-sm text-gray-400 mb-5">
              Les places seront remises en vente automatiquement. Le client sera notifié de l'annulation.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-all">
                Retour
              </button>
              <button onClick={handleCancel} disabled={!!cancelling}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {cancelling ? 'Annulation...' : '❌ Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reçu paiement */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setProofModal(null)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-4 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Reçu de paiement</h3>
              <button onClick={() => setProofModal(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <img src={proofModal} className="w-full rounded-xl max-h-[70vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
