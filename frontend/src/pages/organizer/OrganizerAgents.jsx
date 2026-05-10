import { useState, useEffect } from 'react'
import { Plus, UserCheck, Calendar } from 'lucide-react'
import api from '../../utils/api'

export default function OrganizerAgents() {
  const [agents, setAgents] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [assignEventId, setAssignEventId] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/users/agents'),
      api.get('/events/me/list')
    ]).then(([agentsRes, eventsRes]) => {
      setAgents(agentsRes.data.agents)
      setEvents(eventsRes.data.events)
    }).finally(() => setLoading(false))
  }, [])

  const fetchAgents = () => api.get('/users/agents').then(r => setAgents(r.data.agents))

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await api.post('/users/agents', form)
      setShowForm(false)
      setForm({ name: '', phone: '', password: '' })
      fetchAgents()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally { setSubmitting(false) }
  }

  const handleAssign = async () => {
    if (!assignEventId) return
    try {
      await api.post('/events/assign-agent', { eventId: assignEventId, agentId: assignModal.id })
      setAssignModal(null); setAssignEventId('')
      fetchAgents()
    } catch (err) { alert(err.response?.data?.message || 'Erreur') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Mes agents</h1>
          <p className="text-gray-400 text-sm mt-1">{agents.length} agent(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" />Nouvel agent
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 bg-white/3 rounded-3xl border border-white/5">
          <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-bold">Aucun agent</p>
          <p className="text-gray-500 text-sm mt-2 mb-6">Créez des agents pour scanner les tickets</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />Créer un agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-sahara-500/20 rounded-xl flex items-center justify-center text-sahara-400 font-black text-lg">
                  {agent.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{agent.user?.name}</p>
                  <p className="text-xs text-gray-500">{agent.user?.phone}</p>
                </div>
              </div>

              {agent.eventAgents?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Événements assignés :</p>
                  <div className="space-y-1.5">
                    {agent.eventAgents.map(ea => (
                      <div key={ea.event?.id} className="flex items-center gap-2 text-xs bg-white/5 rounded-lg px-3 py-2">
                        <Calendar className="w-3 h-3 text-sahara-400 shrink-0" />
                        <span className="text-gray-300 truncate">{ea.event?.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setAssignModal(agent)} className="w-full text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2 rounded-lg transition-colors">
                Assigner à un événement
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black text-white mb-6">Créer un agent</h2>
            {error && <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Nom complet', field: 'name', type: 'text', required: true },
                { label: 'Téléphone', field: 'phone', type: 'tel', required: true },
                { label: 'Mot de passe', field: 'password', type: 'password', required: true },
              ].map(({ label, field, type, required }) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 font-medium block mb-1.5">{label}</label>
                  <input type={type} required={required} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sahara-400 transition-all" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-sahara-500 hover:bg-sahara-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50">
                  {submitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black text-white mb-2">Assigner {assignModal.user?.name}</h2>
            <p className="text-sm text-gray-400 mb-6">Choisir un événement pour cet agent</p>
            <select value={assignEventId} onChange={e => setAssignEventId(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sahara-400 transition-all mb-4">
              <option value="">Sélectionner un événement</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Annuler</button>
              <button onClick={handleAssign} disabled={!assignEventId} className="flex-1 bg-sahara-500 hover:bg-sahara-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">Assigner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
