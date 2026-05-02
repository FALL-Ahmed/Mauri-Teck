import { useState, useEffect } from 'react'
import { Search, MapPin, TrendingUp, Shield, Smartphone, ChevronDown } from 'lucide-react'
import Navbar from '../../components/common/Navbar'
import EventCard from '../../components/common/EventCard'
import api from '../../utils/api'

export default function HomePage() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    Promise.all([api.get('/categories'), fetchEvents()])
      .then(([catRes]) => setCategories(catRes.data.categories))
      .finally(() => setLoading(false))
  }, [])

  const fetchEvents = async (params = {}) => {
    setLoading(true)
    const { data } = await api.get('/events', { params })
    setEvents(data.events)
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchEvents({ search, category: selectedCategory, city })
  }

  const handleCategoryFilter = (catId) => {
    const cat = catId === selectedCategory ? '' : catId
    setSelectedCategory(cat)
    fetchEvents({ search, category: cat, city })
  }

  const cities = ['Nouakchott', 'Nouadhibou', 'Rosso', 'Kiffa', 'Zouerate']

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative pt-16 min-h-[85vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-night-900 via-night-800 to-night-900" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,168,83,0.12) 0%, transparent 70%)' }} />
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full border border-sahara-400/10 animate-spin-slow" />
        <div className="absolute top-32 right-24 w-32 h-32 rounded-full border border-sahara-400/20" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full border border-sahara-400/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Flag colors accent */}
          <div className="flex justify-center gap-1 mb-8">
          </div>

          <h1 className="font-display font-black text-5xl md:text-7xl leading-tight mb-6">
            <span className="text-gradient">Mauri</span>
            <span className="text-desert-50">-Ticket</span>
          </h1>
          <p className="text-desert-300 text-xl md:text-2xl max-w-2xl mx-auto mb-4 font-light">
            La première plateforme mauritanienne de vente de tickets en ligne
          </p>
          <p className="text-desert-500 text-base max-w-xl mx-auto mb-12">
            🎵 Concerts · ⚽ Sport · 🎭 Culture · 💼 Conférences
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-2 flex flex-col md:flex-row gap-2 border border-sahara-400/20">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-sahara-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher un événement..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-desert-100 placeholder-desert-500 outline-none py-2 font-body"
                />
              </div>
              <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-sahara-400/20 px-4 py-2">
                <MapPin className="w-4 h-4 text-sahara-400 flex-shrink-0" />
                <select value={city} onChange={e => setCity(e.target.value)} className="bg-transparent text-desert-300 outline-none text-sm">
                  <option value="" className="bg-night-800">Toutes les villes</option>
                  {cities.map(c => <option key={c} value={c} className="bg-night-800">{c}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-gold rounded-xl px-6 py-3">
                Rechercher
              </button>
            </div>
          </form>

          <div className="mt-8 animate-bounce">
            <ChevronDown className="w-6 h-6 text-sahara-400/50 mx-auto" />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────── */}
      <section className="py-8 bg-night-800/50 border-y border-night-700">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${!selectedCategory ? 'bg-sahara-400 text-night-900' : 'bg-night-700 text-desert-300 hover:bg-night-600'}`}
            >
              Tous
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${selectedCategory === cat.id ? 'text-night-900' : 'bg-night-700 text-desert-300 hover:bg-night-600'}`}
                style={selectedCategory === cat.id ? { background: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS GRID ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display font-bold text-3xl text-desert-50">
                {selectedCategory ? 'Événements filtrés' : 'Événements à venir'}
              </h2>
              <p className="text-desert-500 mt-1">{events.length} événement{events.length !== 1 ? 's' : ''} disponible{events.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card h-72 animate-pulse">
                  <div className="h-48 bg-night-700 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-night-700 rounded w-3/4" />
                    <div className="h-3 bg-night-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="font-display text-2xl text-desert-300 mb-2">Aucun événement trouvé</h3>
              <p className="text-desert-500">Essayez d'autres critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-night-800/30 border-t border-night-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-center text-desert-50 mb-16">
            Pourquoi choisir <span className="text-gradient">Mauri-Ticket</span> ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-8 h-8" />, title: 'Paiement Sécurisé', desc: 'Validation manuelle par l\'organisateur. Votre argent est protégé.' },
              { icon: <Smartphone className="w-8 h-8" />, title: 'Ticket sur Mobile', desc: 'Votre QR code directement sur votre téléphone. Aucun papier nécessaire.' },
              { icon: <TrendingUp className="w-8 h-8" />, title: 'Événements Locaux', desc: 'Découvrez les meilleurs événements en Mauritanie, partout dans le pays.' }
            ].map((f, i) => (
              <div key={i} className="card p-8 text-center group hover:border-sahara-400/40 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-sahara-400/10 flex items-center justify-center text-sahara-400 mx-auto mb-5 group-hover:bg-sahara-400/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-xl text-desert-50 mb-3">{f.title}</h3>
                <p className="text-desert-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-night-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="font-display font-bold text-2xl text-gradient mb-2">Mauri-Ticket</div>
          <p className="text-desert-500 text-sm">© 2024 Mauri-Ticket · Mauritanie 🇲🇷</p>
        </div>
      </footer>
    </div>
  )
}
