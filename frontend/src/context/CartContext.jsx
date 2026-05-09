import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()

  const cartKey = user ? `cart_${user.id}` : null

  const [cart, setCart] = useState([])

  useEffect(() => {
    if (cartKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(cartKey)) || []
        setCart(saved)
      } catch {
        setCart([])
      }
    } else {
      setCart([])
    }
  }, [cartKey])

  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(cart))
    }
  }, [cart, cartKey])

  const addToCart = (event, ticketType, quantity = 1) => {
    if (!user) return
    setCart(prev => {
      const idx = prev.findIndex(i => i.ticketTypeId === ticketType.id && i.eventId === event.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        ticketTypeColor: ticketType.color,
        price: ticketType.price,
        quantity,
        image: event.image
      }]
    })
  }

  const removeFromCart = (ticketTypeId) =>
    setCart(prev => prev.filter(i => i.ticketTypeId !== ticketTypeId))

  const updateQuantity = (ticketTypeId, quantity) => {
    if (quantity <= 0) return removeFromCart(ticketTypeId)
    setCart(prev => prev.map(i => i.ticketTypeId === ticketTypeId ? { ...i, quantity } : i))
  }

  const clearCart = () => {
    setCart([])
    if (cartKey) localStorage.removeItem(cartKey)
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
