import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, LogIn } from 'lucide-react'
import Navbar from '../../components/common/Navbar'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!user) { navigate('/login?redirect=/checkout'); return }
    navigate('/checkout')
  }

  if (cart.length === 0) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <ShoppingCart className="w-20 h-20 text-night-600 mb-6" />
        <h2 className="font-display font-bold text-3xl text-desert-200 mb-3">Votre panier est vide</h2>
        <p className="text-desert-500 mb-8">Découvrez nos événements et achetez vos tickets</p>
        <Link to="/" className="btn-gold">Parcourir les événements</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl text-desert-50">Mon Panier</h1>
          <button onClick={clearCart} className="text-desert-500 hover:text-red-400 text-sm transition-colors flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Vider
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.ticketTypeId} className="card p-5 flex gap-4">
                {item.image ? (
                  <img src={item.image} alt={item.eventTitle} className="w-24 h-20 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-24 h-20 bg-night-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🎫</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-desert-50 truncate">{item.eventTitle}</h3>
                  <div className="text-desert-400 text-sm mt-0.5 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: item.ticketTypeColor || '#D4A853' }} />
                    {item.ticketTypeName}
                  </div>
                  {item.eventDate && (
                    <div className="text-desert-500 text-xs mt-1">
                      {format(new Date(item.eventDate), "d MMM yyyy", { locale: fr })} · {item.eventLocation}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-night-700 rounded-lg">
                      <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)} className="p-1.5 text-desert-300 hover:text-sahara-400">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)} className="p-1.5 text-desert-300 hover:text-sahara-400">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-sahara-400">{(item.price * item.quantity).toLocaleString()} MRU</span>
                      <button onClick={() => removeFromCart(item.ticketTypeId)} className="text-desert-600 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="font-display font-bold text-xl text-desert-50 mb-4">Récapitulatif</h2>
              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.ticketTypeId} className="flex justify-between text-sm">
                    <span className="text-desert-400">{item.ticketTypeName} ×{item.quantity}</span>
                    <span className="text-desert-200">{(item.price * item.quantity).toLocaleString()} MRU</span>
                  </div>
                ))}
              </div>
              <div className="divider pt-4 mb-4">
                <div className="flex justify-between font-bold">
                  <span className="text-desert-200">Total</span>
                  <span className="font-display text-xl text-sahara-400">{total.toLocaleString()} MRU</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="btn-gold w-full text-center py-3 flex items-center justify-center gap-2 rounded-xl">
                {user ? <><ArrowRight className="w-4 h-4" /> Commander</> : <><LogIn className="w-4 h-4" /> Se connecter pour commander</>}
              </button>
            </div>
            <div className="card p-4 text-center text-desert-500 text-sm">
              🔒 Paiement validé par l'organisateur · QR Code envoyé après confirmation
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
