import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Calendar, MapPin, Download, ChevronRight, QrCode, Clock } from 'lucide-react'
import jsPDF from 'jspdf'
import Navbar from '../../components/common/Navbar'
import api from '../../utils/api'

const STATUS_MAP = {
  PENDING:          { label: 'En attente de paiement', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  PAYMENT_UPLOADED: { label: 'Paiement envoyé ⏳',     color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  CONFIRMED:        { label: 'Confirmé ✓',              color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  CANCELLED:        { label: 'Annulé',                  color: 'bg-red-500/20 text-red-300 border-red-500/30' },
}

const downloadTicket = async (ticket, eventTitle) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
  pdf.setFillColor(10, 10, 10)
  pdf.rect(0, 0, 148, 210, 'F')
  pdf.setDrawColor(212, 168, 83)
  pdf.setLineWidth(1)
  pdf.rect(5, 5, 138, 200)
  pdf.setFillColor(212, 168, 83)
  pdf.rect(5, 5, 138, 25, 'F')
  pdf.setTextColor(10, 10, 10)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('MAURI-TICKET', 74, 20, { align: 'center' })
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(13)
  pdf.text((eventTitle || 'Evenement').substring(0, 35), 74, 45, { align: 'center' })
  pdf.setTextColor(212, 168, 83)
  pdf.setFontSize(9)
  pdf.setFont('courier', 'normal')
  pdf.text(ticket.ticketNumber, 74, 55, { align: 'center' })
  if (ticket.qrCode) {
    pdf.addImage(ticket.qrCode, 'PNG', 39, 65, 70, 70)
  }
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(150, 150, 150)
  pdf.setFontSize(8)
  pdf.text("Presentez ce QR code a l'entree", 74, 145, { align: 'center' })
  pdf.text('Ce ticket est valide une seule fois', 74, 152, { align: 'center' })
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  if (ticket.status === 'USED') {
    pdf.setTextColor(239, 68, 68)
    pdf.text('TICKET DEJA UTILISE', 74, 168, { align: 'center' })
  } else {
    pdf.setTextColor(34, 197, 94)
    pdf.text('TICKET VALIDE', 74, 168, { align: 'center' })
  }
  pdf.setTextColor(100, 100, 100)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Mauri-Ticket — Powered by AfricaIAConsulting', 74, 195, { align: 'center' })
  pdf.save('ticket-' + ticket.ticketNumber + '.pdf')
}

export default function MyTicketsPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data.orders)).finally(() => setLoading(false))
  }, [])

  const handleDownload = async (ticket, eventTitle) => {
    setDownloading(ticket.ticketNumber)
    try { await downloadTicket(ticket, eventTitle) }
    finally { setDownloading(null) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black">Mes Tickets</h1>
          <p className="text-gray-400 mt-1">Consultez et telechargez vos tickets</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white/3 rounded-3xl border border-white/5">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400">Aucune commande</h3>
            <p className="text-gray-500 mt-2 mb-6">Vous n avez pas encore achete de tickets</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Explorer les evenements
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const s = STATUS_MAP[order.status] || STATUS_MAP.PENDING
              const isOpen = selectedOrder?.id === order.id
              const allTickets = order.items?.flatMap(item => item.tickets || []) || []

              return (
                <div key={order.id} className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${isOpen ? 'border-sahara-500/40' : 'border-white/10 hover:border-white/20'}`}>
                  <div className="p-5 flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-sahara-500/20 to-sahara-600/20 rounded-xl flex items-center justify-center shrink-0">
                      <Ticket className="w-8 h-8 text-sahara-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white truncate">{order.event?.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{order.orderNumber}</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${s.color}`}>{s.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.event?.date).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {order.event?.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sahara-400 font-bold">{order.totalAmount?.toLocaleString()} MRU</span>
                        {order.status === 'CONFIRMED' && (
                          <button onClick={() => setSelectedOrder(isOpen ? null : order)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                            <QrCode className="w-3.5 h-3.5" />
                            {isOpen ? 'Masquer' : `Voir mes ${allTickets.length} ticket(s)`}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isOpen && order.status === 'CONFIRMED' && (
                    <div className="border-t border-white/10 p-5">
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-sahara-400" />
                          {allTickets.length} ticket(s) QR
                        </h4>
                        {allTickets.length > 1 && (
                          <button onClick={async () => { for (const t of allTickets) await handleDownload(t, order.event?.title) }}
                            className="text-xs flex items-center gap-1.5 bg-sahara-500/20 hover:bg-sahara-500/30 text-sahara-400 px-3 py-1.5 rounded-lg transition-colors font-bold">
                            <Download className="w-3.5 h-3.5" />Tout telecharger
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {allTickets.map((ticket, i) => (
                          <div key={ticket.id || i} className={`border rounded-2xl p-5 flex flex-col items-center gap-3 ${ticket.status === 'USED' ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                            <p className="text-xs font-mono text-sahara-400 font-bold">{ticket.ticketNumber}</p>
                            {ticket.qrCode && (
                              <div className="relative">
                                <img src={ticket.qrCode} alt="QR Code"
                                  className={`w-44 h-44 rounded-xl bg-white p-2 shadow-lg ${ticket.status === 'USED' ? 'opacity-30 grayscale' : ''}`} />
                                {ticket.status === 'USED' && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-red-500 text-white font-black text-sm px-4 py-1.5 rounded-full -rotate-12 shadow-lg">UTILISE</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className={`text-xs font-bold px-4 py-1.5 rounded-full border ${ticket.status === 'USED' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
                              {ticket.status === 'USED' ? 'Deja utilise' : 'Valide — Pret a scanner'}
                            </div>
                            <button onClick={() => handleDownload(ticket, order.event?.title)}
                              disabled={downloading === ticket.ticketNumber}
                              className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-sahara-500/20 hover:bg-sahara-500/30 text-sahara-400 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                              <Download className="w-3.5 h-3.5" />
                              {downloading === ticket.ticketNumber ? 'Generation PDF...' : 'Telecharger en PDF'}
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-center text-gray-600 mt-5">
                        Retrouvez toujours vos tickets ici apres connexion
                      </p>
                    </div>
                  )}

                  {order.status === 'PENDING' && (
                    <div className="border-t border-white/10 p-5">
                      <p className="text-sm text-yellow-400 mb-3">Vous n avez pas encore envoye votre recu de paiement.</p>
                      <Link to={`/paiement?order=${order.id}&number=${order.orderNumber}&amount=${order.totalAmount}`}
                        className="inline-flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                        Envoyer le recu de paiement
                      </Link>
                    </div>
                  )}

                  {order.status === 'PAYMENT_UPLOADED' && (
                    <div className="border-t border-white/10 p-5">
                      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <Clock className="w-5 h-5 text-blue-400 shrink-0 animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-blue-300">Recu recu — En attente de validation</p>
                          <p className="text-xs text-blue-400/70 mt-0.5">L organisateur va valider votre paiement. Vos tickets apparaitront ici des que l'organisateur valide votre paiement.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
