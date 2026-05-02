import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Ticket, User, Mail, Phone, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (form.password.length < 6) { setError('Le mot de passe doit avoir au moins 6 caractères'); return }
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/mes-tickets')
      window.location.reload()
    } catch {
      setError('Erreur lors de la création du compte')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a00] to-[#0a0a0a] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-sahara-400 to-sahara-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white tracking-tight">MAURI</div>
              <div className="text-xs font-bold text-sahara-400 tracking-[0.3em] -mt-1">TICKET</div>
            </div>
          </Link>
          <p className="text-gray-400 mt-4 text-sm">Créez votre compte pour acheter des tickets</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  placeholder="Prénom Nom"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                  placeholder="votre@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required
                  placeholder="+222 XX XX XX XX"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
              <input type="password" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sahara-500 to-sahara-600 hover:from-sahara-400 hover:to-sahara-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </span>
              ) : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-sahara-400 hover:text-sahara-300 font-semibold">Se connecter</Link>
            </p>
            <Link to="/" className="block text-sm text-gray-500 hover:text-sahara-400 transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
