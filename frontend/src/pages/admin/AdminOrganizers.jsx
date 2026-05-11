import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import api, { BASE_URL } from '../../utils/api'

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', password: '', companyName: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchOrganizers() }, [])

  const fetchOrganizers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users?role=ORGANIZER')
      setOrganizers(data.users)
    } finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await api.post('/users/organizers', form)
      setShowForm(false)
      setForm({ name: '', phone: '', password: '', companyName: '', description: '' })
      fetchOrganizers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally { setSubmitting(false) }
  }

  const toggleStatus = async (id) => {
    await api.patch(`/users/${id}/toggle-status`)
    fetchOrganizers()
  }

  const filtered = organizers.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.toLowerCase().includes(search.toLowerCase()) ||
    o.organizer?.companyName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Organisateurs</h1>
          <p className="text-gray-400 text-sm mt-1">{organizers.length} organisateur(s) enregistré(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-sahara-500 hover:bg-sahara-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" />Nouvel organisateur
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Aucun organisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Organisateur</th>
                  <th className="text-left px-5 py-3">Entreprise</th>
                  <th className="text-left px-5 py-3">Téléphone</th>
                  <th className="text-left px-5 py-3">Statut</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(org => (
                  <tr key={org.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {org.organizer?.logo ? (
                          <img src={org.organizer.logo.startsWith('http') ? org.organizer.logo : `${BASE_URL}${org.organizer.logo}`} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 bg-sahara-500/20 rounded-lg flex items-center justify-center text-sahara-400 font-bold text-sm">
                            {org.name?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{org.name}</p>
                          <p className="text-xs text-gray-500">{org.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">{org.organizer?.companyName || '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{org.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${org.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {org.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleStatus(org.id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${org.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                        {org.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-black text-white mb-6">Créer un organisateur</h2>
            {error && <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1.5">Nom complet</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sahara-400 transition-all" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1.5">Téléphone</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+222 XX XX XX XX"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sahara-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Mot de passe</label>
                <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sahara-400 transition-all" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Nom de l'entreprise</label>
                <input required value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sahara-400 transition-all" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sahara-400 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-sahara-500 hover:bg-sahara-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50">
                  {submitting ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
