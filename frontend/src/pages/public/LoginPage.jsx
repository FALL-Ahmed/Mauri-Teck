import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Ticket, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ phone: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.phone, form.password)
      if (redirect) navigate(redirect)
      else if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'ORGANIZER') navigate('/organisateur')
      else if (user.role === 'AGENT') navigate('/agent')
      else navigate('/mes-tickets')
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a00] to-[#0a0a0a] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-sahara-400 to-sahara-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sahara-500/30">
              <Ticket className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-black text-white tracking-tight">MAURI</div>
              <div className="text-xs font-bold text-sahara-400 tracking-[0.3em] -mt-1">TICKET</div>
            </div>
          </Link>
          <p className="text-gray-400 mt-4 text-sm">Connectez-vous à votre espace</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de téléphone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required
                placeholder="+222 XX XX XX XX"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 focus:ring-1 focus:ring-sahara-400/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 focus:ring-1 focus:ring-sahara-400/50 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sahara-500 to-sahara-600 hover:from-sahara-400 hover:to-sahara-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-sahara-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-sahara-400 hover:text-sahara-300 font-semibold">Créer un compte</Link>
            </p>
            <Link to="/" className="block text-sm text-gray-400 hover:text-sahara-400 transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
