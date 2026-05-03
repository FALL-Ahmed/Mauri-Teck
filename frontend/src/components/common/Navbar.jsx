import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Ticket, LogIn, LogOut, User, Menu, X, Phone } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const dashboardLink = () => {
    if (!user) return null
    if (user.role === 'ADMIN') return '/admin'
    if (user.role === 'ORGANIZER') return '/organisateur'
    if (user.role === 'AGENT') return '/agent'
    return '/mes-tickets'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-sahara-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-sahara-400 to-sahara-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5 text-night-900" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">Mauri-Ticket</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-desert-300 hover:text-sahara-400 font-medium transition-colors text-sm">Accueil</Link>
            <Link to="/?category=musique" className="text-desert-300 hover:text-sahara-400 font-medium transition-colors text-sm">Événements</Link>
            <Link to="/contact" className="flex items-center gap-1.5 text-desert-300 hover:text-sahara-400 font-medium transition-colors text-sm">
              <Phone className="w-3.5 h-3.5" /> Contact
            </Link>
            {user && user.role === 'USER' && (
              <Link to="/mes-tickets" className="flex items-center gap-1.5 text-desert-300 hover:text-sahara-400 font-medium transition-colors text-sm">
                <Ticket className="w-3.5 h-3.5" /> Mes Tickets
              </Link>
            )}
            {user && user.role !== 'USER' && dashboardLink() && (
              <Link to={dashboardLink()} className="text-desert-300 hover:text-sahara-400 font-medium transition-colors text-sm">Mon espace</Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/panier" className="relative p-2 text-desert-300 hover:text-sahara-400 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-sahara-400 text-night-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to={dashboardLink()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-night-700 border border-night-600 hover:border-sahara-400 transition-colors text-sm">
                  <User className="w-4 h-4 text-sahara-400" />
                  <span className="text-desert-200">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-desert-400 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 btn-gold py-2 px-4 text-sm">
                <LogIn className="w-4 h-4" /> Connexion
              </Link>
            )}

            <button className="md:hidden p-2 text-desert-300" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-night-700 space-y-2 animate-slide-up">
            <Link to="/" className="block px-4 py-2 text-desert-300 hover:text-sahara-400" onClick={() => setOpen(false)}>Accueil</Link>
            <Link to="/contact" className="block px-4 py-2 text-desert-300 hover:text-sahara-400" onClick={() => setOpen(false)}>Contact</Link>
            {user && user.role === 'USER' && (
              <Link to="/mes-tickets" className="block px-4 py-2 text-desert-300 hover:text-sahara-400" onClick={() => setOpen(false)}>🎟️ Mes Tickets</Link>
            )}
            {user && user.role !== 'USER' && dashboardLink() && (
              <Link to={dashboardLink()} className="block px-4 py-2 text-desert-300 hover:text-sahara-400" onClick={() => setOpen(false)}>Mon espace</Link>
            )}
            {user ? (
              <button onClick={() => { handleLogout(); setOpen(false) }} className="block w-full text-left px-4 py-2 text-red-400">Déconnexion</button>
            ) : (
              <Link to="/login" className="block px-4 py-2 text-sahara-400 font-semibold" onClick={() => setOpen(false)}>Connexion</Link>
            )}
          </div>
        )}
      </div>

      {/* Footer bar AfriacaIAConsulting */}
      <div className="bg-night-900/80 border-t border-night-800 py-1 text-center">
        <p className="text-xs text-desert-600">
          Réalisé par{' '}
          <a href="https://africa-ia-consulting.com" target="_blank" rel="noreferrer"
            className="text-sahara-400/70 hover:text-sahara-400 transition-colors font-medium">
            AfriacaIAConsulting
          </a>
        </p>
      </div>
    </nav>
  )
}
