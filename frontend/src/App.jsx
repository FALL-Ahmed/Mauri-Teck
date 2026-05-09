import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import HomePage from './pages/public/HomePage'
import EventDetailPage from './pages/public/EventDetailPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import CartPage from './pages/public/CartPage'
import CheckoutPage from './pages/public/CheckoutPage'
import OrderTrackPage from './pages/public/OrderTrackPage'
import MyTicketsPage from './pages/public/MyTicketsPage'
import ContactPage from './pages/public/ContactPage'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrganizers from './pages/admin/AdminOrganizers'
import AdminEvents from './pages/admin/AdminEvents'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'

import OrganizerLayout from './pages/organizer/OrganizerLayout'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import OrganizerEvents from './pages/organizer/OrganizerEvents'
import OrganizerEventForm from './pages/organizer/OrganizerEventForm'
import OrganizerOrders from './pages/organizer/OrganizerOrders'
import OrganizerAgents from './pages/organizer/OrganizerAgents'

import AgentLayout from './pages/agent/AgentLayout'
import AgentScanner from './pages/agent/AgentScanner'
import AgentEvents from './pages/agent/AgentEvents'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track/:orderNumber" element={<OrderTrackPage />} />
          <Route path="/mes-tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="organisateurs" element={<AdminOrganizers />} />
            <Route path="evenements" element={<AdminEvents />} />
            <Route path="commandes" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          <Route path="/organisateur" element={<ProtectedRoute roles={['ORGANIZER']}><OrganizerLayout /></ProtectedRoute>}>
            <Route index element={<OrganizerDashboard />} />
            <Route path="evenements" element={<OrganizerEvents />} />
            <Route path="evenements/nouveau" element={<OrganizerEventForm />} />
            <Route path="evenements/:id/modifier" element={<OrganizerEventForm />} />
            <Route path="commandes" element={<OrganizerOrders />} />
            <Route path="agents" element={<OrganizerAgents />} />
          </Route>

          <Route path="/agent" element={<ProtectedRoute roles={['AGENT']}><AgentLayout /></ProtectedRoute>}>
            <Route index element={<AgentEvents />} />
            <Route path="scanner/:eventId" element={<AgentScanner />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
