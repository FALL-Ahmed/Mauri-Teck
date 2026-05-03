import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, Upload, Tag } from 'lucide-react'
import api, { BASE_URL } from '../../utils/api'

const emptyTicket = { name: '', description: '', price: '', totalSeats: '', color: '#f59e0b', benefits: [] }

export default function OrganizerEventForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    title: '', description: '', date: '', endDate: '', location: '',
    address: '', city: '', categoryId: ''
  })
  const [ticketTypes, setTicketTypes] = useState([{ ...emptyTicket }])
  const [categories, setCategories] = useState([])
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories))
    if (isEdit) {
      api.get(`/events/${id}`).then(r => {
        const e = r.data.event
        setForm({
          title: e.title, description: e.description,
          date: e.date?.slice(0, 16), endDate: e.endDate?.slice(0, 16) || '',
          location: e.location, address: e.address || '', city: e.city, categoryId: e.categoryId
        })
        setTicketTypes(e.ticketTypes.map(t => ({ ...t, price: t.price.toString(), totalSeats: t.totalSeats.toString() })))
        if (e.image) setImagePreview(`${BASE_URL}${e.image}`)
      })
    }
  }, [id])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addTicketType = () => setTicketTypes([...ticketTypes, { ...emptyTicket }])
  const removeTicketType = (i) => setTicketTypes(ticketTypes.filter((_, idx) => idx !== i))
  const updateTicket = (i, field, value) => {
    const updated = [...ticketTypes]
    updated[i] = { ...updated[i], [field]: value }
    setTicketTypes(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('ticketTypes', JSON.stringify(ticketTypes))
      if (image) fd.append('image', image)

      if (isEdit) await api.put(`/events/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      else await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

      navigate('/organisateur/evenements')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    } finally { setSubmitting(false) }
  }

  const COLORS = ['#f59e0b','#3b82f6','#10b981','#ec4899','#8b5cf6','#f97316','#ef4444','#06b6d4']

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/organisateur/evenements')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">{isEdit ? 'Modifier' : 'Créer'} un événement</h1>
          <p className="text-gray-400 text-sm mt-0.5">Remplissez les informations de votre événement</p>
        </div>
      </div>

      {error && <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Image de l'événement</h2>
          <label className="block cursor-pointer group">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} className="w-full h-48 object-cover rounded-xl" />
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/20 rounded-xl h-48 flex flex-col items-center justify-center gap-3 hover:border-sahara-400/50 transition-colors">
                <Upload className="w-8 h-8 text-gray-500" />
                <p className="text-sm text-gray-500">Cliquez pour uploader une image</p>
                <p className="text-xs text-gray-600">JPG, PNG, WebP — max 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* Basic info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white">Informations générales</h2>
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">Titre de l'événement *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Festival de Musique Nouakchott 2025"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">Description *</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Décrivez votre événement..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">Catégorie *</label>
            <select required value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sahara-400 transition-all text-sm">
              <option value="">Sélectionner une catégorie</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Date de début *</label>
              <input required type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sahara-400 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Date de fin</label>
              <input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sahara-400 transition-all text-sm" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-white">Lieu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Nom du lieu *</label>
              <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                placeholder="Palais des Congrès"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Ville *</label>
              <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                placeholder="Nouakchott"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1.5">Adresse complète</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              placeholder="Avenue Gamal Abdel Nasser, Nouakchott"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all text-sm" />
          </div>
        </div>

        {/* Ticket types */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">Types de tickets</h2>
            <button type="button" onClick={addTicketType} className="flex items-center gap-1.5 text-xs font-bold bg-sahara-500/20 hover:bg-sahara-500/30 text-sahara-400 px-3 py-2 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />Ajouter un type
            </button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((ticket, i) => (
              <div key={i} className="border border-white/10 rounded-xl p-4 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/20" style={{ backgroundColor: ticket.color }} />
                    <span className="text-sm font-bold text-white">Ticket {i + 1}</span>
                  </div>
                  {ticketTypes.length > 1 && (
                    <button type="button" onClick={() => removeTicketType(i)} className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Nom du ticket *</label>
                    <input required value={ticket.name} onChange={e => updateTicket(i, 'name', e.target.value)}
                      placeholder="VIP, Standard, Early Bird..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Description</label>
                    <input value={ticket.description} onChange={e => updateTicket(i, 'description', e.target.value)}
                      placeholder="Accès VIP, boissons incluses..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Prix (MRU) *</label>
                    <input required type="number" min="0" value={ticket.price} onChange={e => updateTicket(i, 'price', e.target.value)}
                      placeholder="5000"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Nombre de places *</label>
                    <input required type="number" min="1" value={ticket.totalSeats} onChange={e => updateTicket(i, 'totalSeats', e.target.value)}
                      placeholder="100"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-sahara-400 transition-all" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-500 block mb-2">Couleur du badge</label>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => updateTicket(i, 'color', c)}
                        className={`w-6 h-6 rounded-full transition-all ${ticket.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#111]' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/organisateur/evenements')} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={submitting} className="flex-1 bg-sahara-500 hover:bg-sahara-400 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50">
            {submitting ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer l\'événement'}
          </button>
        </div>
      </form>
    </div>
  )
}
