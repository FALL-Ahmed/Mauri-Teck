import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Download, Users, QrCode } from 'lucide-react'
import html2canvas from 'html2canvas'
import api from '../../utils/api'

export default function OrganizerGuestTickets() {
  const { eventId } = useParams()
  const [tickets, setTickets] = useState([])
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guestName: '', guestPhone: '' })

  useEffect(() => { fetchData() }, [eventId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [evRes, tickRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/guest-tickets/event/${eventId}`)
      ])
      setEvent(evRes.data.event)
      setTickets(tickRes.data.tickets)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.guestName) return
    setCreating(true)
    try {
      await api.post('/guest-tickets', { eventId, guestName: form.guestName, guestPhone: form.guestPhone })
      setForm({ guestName: '', guestPhone: '' })
      setShowForm(false)
      fetchData()
    } catch (e) { console.error(e) }
    finally { setCreating(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce ticket ?')) return
    try { await api.delete(`/guest-tickets/${id}`); fetchData() }
    catch (e) { console.error(e) }
  }

  const downloadTicket = async (ticket) => {
    const eventDate = new Date(event.date).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
    const initials = ticket.guestName.split(' ').map(function(n) { return n[0] }).join('').slice(0, 2).toUpperCase()

    const div = document.createElement('div')
    div.style.cssText = 'position:fixed;left:-9999px;top:0;width:440px;font-family:Georgia,serif;background:#0d0d0d;border-radius:28px;overflow:hidden;'
    div.innerHTML = '<div style="background:linear-gradient(135deg,#8B6914,#C9A84C,#E8C97A,#C9A84C,#6B4F0A);padding:32px 32px 52px;position:relative;">'
      + '<div style="font-size:9px;font-weight:700;color:rgba(10,10,10,0.55);letter-spacing:4px;text-transform:uppercase;margin-bottom:10px;">Invitation Officielle · Accès VIP</div>'
      + '<div style="font-size:26px;font-weight:900;color:#0A0A0A;text-transform:uppercase;letter-spacing:2px;">' + event.title + '</div>'
      + '<div style="position:absolute;top:16px;right:20px;font-size:28px;opacity:0.25;">✦</div>'
      + '</div>'
      + '<div style="padding:32px;display:flex;align-items:center;gap:24px;border-bottom:1px solid rgba(201,168,76,0.15);">'
      + '<div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#1a0800,#2d1500);border:3px solid #C9A84C;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
      + '<span style="font-size:36px;font-weight:700;color:#C9A84C;">' + initials + '</span>'
      + '</div>'
      + '<div>'
      + '<div style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#C9A84C;margin-bottom:10px;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);padding:4px 10px;border-radius:20px;display:inline-block;">✦ Invité d\'honneur</div>'
      + '<div style="font-size:22px;font-weight:700;color:#F5F0E8;margin-bottom:8px;">' + ticket.guestName + '</div>'
      + (ticket.guestPhone ? '<div style="font-size:12px;color:#888;">📞 ' + ticket.guestPhone + '</div>' : '')
      + '</div></div>'
      + '<div style="padding:20px 32px;display:grid;grid-template-columns:1fr 1fr;gap:20px;border-bottom:1px solid rgba(201,168,76,0.12);">'
      + '<div><div style="font-size:8px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">📅 Date</div>'
      + '<div style="font-size:12px;color:#C8C4BC;font-weight:500;">' + eventDate + '</div></div>'
      + '<div><div style="font-size:8px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">📍 Lieu</div>'
      + '<div style="font-size:12px;color:#C8C4BC;font-weight:500;">' + event.location + ', ' + event.city + '</div></div>'
      + '</div>'
      + '<div style="margin:20px 32px;padding:14px 18px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:12px;display:flex;align-items:center;justify-content:space-between;">'
      + '<div style="display:flex;align-items:center;gap:10px;">'
      + '<span style="font-size:20px;">🎟️</span>'
      + '<div><div style="font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;">Type de billet</div>'
      + '<div style="font-size:14px;color:#E8C97A;font-weight:700;">Invitation VIP</div></div>'
      + '</div><span style="font-size:20px;color:#C9A84C;opacity:0.4;">✦</span></div>'
      + '<div style="display:flex;justify-content:space-between;padding:4px 24px;">'
      + Array(13).fill('<div style="width:14px;height:14px;background:#1a1a1a;border-radius:50%;border:1px solid #222;"></div>').join('')
      + '</div>'
      + '<div style="padding:20px 32px 32px;display:flex;gap:20px;align-items:center;">'
      + '<div style="background:white;padding:12px;border-radius:16px;width:120px;height:120px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">'
      + '<img src="' + ticket.qrCode + '" style="width:96px;height:96px;"/>'
      + '</div>'
      + '<div>'
      + '<div style="font-family:monospace;font-size:11px;color:#C9A84C;font-weight:700;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);padding:7px 12px;border-radius:8px;margin-bottom:10px;letter-spacing:1px;display:block;">' + ticket.ticketNumber + '</div>'
      + '<div style="font-size:10px;color:#555;line-height:1.8;">Présentez ce QR code à l\'entrée.<br/><span style="color:#C9A84C;font-weight:bold;">Usage unique</span> — Ne pas partager.<br/><span style="color:#C9A84C;font-weight:bold;">Invitation personnelle</span> non transférable.</div>'
      + '</div></div>'
      + '<div style="background:linear-gradient(135deg,#C9A84C,#A07828,#C9A84C);padding:14px 32px;display:flex;justify-content:space-between;align-items:center;">'
      + '<div><div style="font-size:16px;font-weight:700;color:#0A0A0A;">Mauri-Ticket</div>'
      + '<div style="font-size:8px;color:rgba(10,10,10,0.5);letter-spacing:3px;text-transform:uppercase;">Mauritanie</div></div>'
      + '<div style="background:rgba(10,10,10,0.2);border-radius:20px;padding:5px 14px;font-size:9px;font-weight:700;color:#0A0A0A;letter-spacing:2px;text-transform:uppercase;">✦ Invité Officiel</div>'
      + '</div>'

    document.body.appendChild(div)
    try {
      const canvas = await html2canvas(div, { backgroundColor: '#0d0d0d', scale: 2, useCORS: true, logging: false })
      const link = document.createElement('a')
      link.download = ticket.guestName.split(' ').join('-') + '.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      document.body.removeChild(div)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/organisateur/evenements" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sahara-400"/> Tickets Invités
            </h1>
            <p className="text-sm text-gray-400">{event?.title} — {tickets.length} invité(s)</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all">
          <Plus className="w-4 h-4"/> Ajouter un invité
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-night-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-black text-white mb-6">Nouvel invité</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Nom complet *</label>
                <input value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-sahara-400 outline-none"
                  placeholder="Ex: Aminata Diallo" required/>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Téléphone</label>
                <input value={form.guestPhone} onChange={e => setForm({...form, guestPhone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-sahara-400 outline-none"
                  placeholder="+222 XX XX XX XX"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-sahara-500 hover:bg-sahara-400 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                  {creating ? 'Création...' : '✨ Créer le ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p>Aucun ticket invité pour cet événement</p>
          <p className="text-sm mt-1">Cliquez sur "Ajouter un invité" pour commencer</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sahara-600 to-sahara-900 border-2 border-sahara-400/40 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg font-bold text-sahara-300">{ticket.guestName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white">{ticket.guestName}</div>
                <div className="text-xs text-gray-400 mt-0.5">{ticket.guestPhone || '—'}</div>
                <div className="font-mono text-xs text-sahara-400 mt-1">{ticket.ticketNumber}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'USED' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {ticket.status === 'USED' ? '✅ Scanné' : '🎟️ Actif'}
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadTicket(ticket)}
                  className="p-2.5 rounded-xl bg-sahara-500/20 hover:bg-sahara-500/40 text-sahara-400 transition-all">
                  <Download className="w-4 h-4"/>
                </button>
                <button onClick={() => handleDelete(ticket.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
