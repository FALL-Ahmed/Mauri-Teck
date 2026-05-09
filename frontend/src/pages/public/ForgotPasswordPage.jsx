import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, Ticket, AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleCheckPhone = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setStep(2)
    } catch {
      setError('Erreur serveur, réessayez')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Le mot de passe doit avoir au moins 6 caractères'); return }
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setError('Erreur serveur, réessayez')
    } finally { setLoading(false) }
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
          <p className="text-gray-400 mt-4 text-sm">Réinitialisation du mot de passe</p>
        </div>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-sahara-400 text-black' : 'bg-white/10 text-gray-500'}`}>{s}</div>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-sahara-400' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-xl font-black text-white">Mot de passe modifié !</h2>
              <p className="text-gray-400 text-sm">Vous allez être redirigé vers la page de connexion...</p>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleCheckPhone} className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Votre numéro de téléphone</h2>
                <p className="text-gray-400 text-sm mb-4">Entrez le numéro associé à votre compte</p>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                    placeholder="+222 XX XX XX XX"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-sahara-500 to-sahara-600 hover:from-sahara-400 hover:to-sahara-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Vérification...
                  </span>
                ) : 'Continuer →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <h2 className="text-lg font-black text-white mb-1">Nouveau mot de passe</h2>
                <p className="text-gray-400 text-sm mb-4">Choisissez un nouveau mot de passe pour <span className="text-sahara-400">{phone}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-sahara-400 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-sahara-500 to-sahara-600 hover:from-sahara-400 hover:to-sahara-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Modification...
                  </span>
                ) : 'Modifier le mot de passe'}
              </button>
            </form>
          )}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-sahara-400 transition-colors">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
