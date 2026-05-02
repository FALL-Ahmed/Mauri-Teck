import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, AlertCircle, User, Mail, Phone, FileImage, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const PAYMENT_METHODS = [
  {
    value: 'masrivi',
    label: 'Masrivi',
    number: '+222 42212334',
    color: '#00A651',
    desc: 'Envoyez le montant sur ce numéro Masrivi puis uploadez le reçu'
  },
  {
    value: 'bankily',
    label: 'Bankily',
    number: '+222 22212334',
    color: '#F7A800',
    desc: 'Envoyez le montant sur ce numéro Bankily puis uploadez le reçu'
  },
  {
    value: 'virement',
    label: 'Virement bancaire',
    number: null,
    color: '#378ADD',
    desc: 'Contactez-nous pour les détails du virement'
  }
]

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', paymentMethod: 'masrivi', notes: '' })
  const [proofFile, setProofFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [orderId, setOrderId] = useState(null)
  const [orderNumber, setOrderNumber] = useState(null)

  if (cart.length === 0 && step === 1) { navigate('/panier'); return null }

  const byEvent = cart.reduce((acc, item) => {
    if (!acc[item.eventId]) acc[item.eventId] = { eventId: item.eventId, eventTitle: item.eventTitle, items: [] }
    acc[item.eventId].items.push(item)
    return acc
  }, {})

  const selectedMethod = PAYMENT_METHODS.find(m => m.value === form.paymentMethod)

  const handleOrder = async () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Remplissez tous les champs'); return }
    const events = Object.values(byEvent)
    if (events.length > 1) { toast.error('Un seul événement par commande svp'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/orders', {
        eventId: events[0].eventId,
        items: cart.map(i => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity })),
        guestName: form.name, guestEmail: form.email, guestPhone: form.phone,
        paymentMethod: form.paymentMethod, notes: form.notes
      })
      setOrderId(data.order.id)
      setOrderNumber(data.order.orderNumber)
      setStep(2)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la commande')
    } finally { setLoading(false) }
  }

  const handleUploadProof = async () => {
    if (!proofFile) { toast.error('Sélectionnez une image du reçu'); return }
    setLoading(true)
    const fd = new FormData()
    fd.append('paymentProof', proofFile)
    try {
      await api.post(`/orders/${orderId}/payment-proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      clearCart()
      setStep(3)
      toast.success('Preuve de paiement envoyée !')
    } catch { toast.error("Erreur lors de l'envoi") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 max-w-2xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-4 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-sahara-400 text-night-900' : 'bg-night-700 text-desert-500'}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-sahara-400' : 'bg-night-700'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h1 className="font-display font-bold text-3xl text-desert-50">Vos informations</h1>
            <div className="card p-6 space-y-4">
              <div>
                <label className="text-desert-300 text-sm font-medium block mb-1.5">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-desert-500" />
                  <input className="input pl-10" placeholder="Prénom Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-desert-300 text-sm font-medium block mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-desert-500" />
                  <input className="input pl-10" type="email" placeholder="email@exemple.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-desert-300 text-sm font-medium block mb-1.5">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-desert-500" />
                  <input className="input pl-10" placeholder="+222 XX XX XX XX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-desert-300 text-sm font-medium block mb-2">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.value} type="button"
                      onClick={() => setForm({...form, paymentMethod: m.value})}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.paymentMethod === m.value ? 'border-sahara-400 bg-sahara-400/10' : 'border-night-700 bg-night-800 hover:border-night-600'}`}>
                      <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{background: m.color}} />
                      <p className="text-xs font-bold text-desert-200">{m.label}</p>
                    </button>
                  ))}
                </div>

                {selectedMethod && (
                  <div className="mt-3 p-4 rounded-xl border border-night-700 bg-night-800/50">
                    <p className="text-desert-400 text-sm">{selectedMethod.desc}</p>
                    {selectedMethod.number && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-mono font-bold text-sahara-400 text-lg">{selectedMethod.number}</p>
                        <button onClick={() => { navigator.clipboard.writeText(selectedMethod.number); toast.success('Numéro copié !') }}
                          className="flex items-center gap-1 text-xs text-desert-500 hover:text-desert-300 transition-colors">
                          <Copy className="w-3 h-3" /> Copier
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-desert-300 text-sm font-medium block mb-1.5">Notes (optionnel)</label>
                <textarea className="input resize-none" rows={2} placeholder="Remarques..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-desert-200 mb-3">Récapitulatif</h3>
              {cart.map(item => (
                <div key={item.ticketTypeId} className="flex justify-between text-sm py-1.5 border-b border-night-700 last:border-0">
                  <span className="text-desert-400">{item.eventTitle} - {item.ticketTypeName} ×{item.quantity}</span>
                  <span className="text-desert-200 font-semibold">{(item.price * item.quantity).toLocaleString()} MRU</span>
                </div>
              ))}
              <div className="flex justify-between mt-3 pt-2">
                <span className="font-bold text-desert-200">Total</span>
                <span className="font-display font-bold text-xl text-sahara-400">{total.toLocaleString()} MRU</span>
              </div>
            </div>

            <button onClick={handleOrder} disabled={loading} className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2 rounded-xl">
              {loading ? <div className="w-5 h-5 border-2 border-night-900 border-t-transparent rounded-full animate-spin" /> : 'Confirmer la commande →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-sahara-400 mx-auto mb-4" />
              <h1 className="font-display font-bold text-3xl text-desert-50 mb-2">Commande créée !</h1>
              <p className="text-desert-400">N° <span className="font-mono text-sahara-400 font-bold">{orderNumber}</span></p>
            </div>

            <div className="card p-6 border border-sahara-400/30">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-sahara-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-desert-200 font-semibold">Envoyez le paiement puis uploadez votre reçu</p>
                  <p className="text-desert-400 text-sm mt-1">Total : <span className="text-sahara-400 font-bold">{total.toLocaleString()} MRU</span></p>
                </div>
              </div>

              {selectedMethod?.number && (
                <div className="p-4 rounded-xl mb-4" style={{background: selectedMethod.color + '15', border: `1px solid ${selectedMethod.color}40`}}>
                  <p className="text-sm font-bold mb-1" style={{color: selectedMethod.color}}>{selectedMethod.label}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-bold text-desert-100 text-xl">{selectedMethod.number}</p>
                    <button onClick={() => { navigator.clipboard.writeText(selectedMethod.number); toast.success('Numéro copié !') }}
                      className="flex items-center gap-1 text-xs text-desert-400 hover:text-desert-200 transition-colors">
                      <Copy className="w-3 h-3" /> Copier
                    </button>
                  </div>
                  <p className="text-desert-400 text-xs mt-2">Envoyez exactement <span className="text-sahara-400 font-bold">{total.toLocaleString()} MRU</span> sur ce numéro</p>
                </div>
              )}

              <div className="border-2 border-dashed border-night-600 rounded-xl p-8 text-center hover:border-sahara-400/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('proof-input').click()}>
                <input id="proof-input" type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files[0])} />
                {proofFile ? (
                  <div>
                    <img src={URL.createObjectURL(proofFile)} alt="Reçu" className="max-h-48 mx-auto rounded-lg mb-3 object-contain" />
                    <p className="text-sahara-400 font-semibold">{proofFile.name}</p>
                    <p className="text-desert-500 text-sm">Cliquez pour changer</p>
                  </div>
                ) : (
                  <div>
                    <FileImage className="w-12 h-12 text-night-600 mx-auto mb-3" />
                    <p className="text-desert-300 font-semibold">Cliquez pour uploader votre reçu</p>
                    <p className="text-desert-500 text-sm mt-1">JPG, PNG, WEBP · Max 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleUploadProof} disabled={loading || !proofFile} className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2 rounded-xl disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-night-900 border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-4 h-4" /> Envoyer le reçu</>}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-14 h-14 text-green-400" />
            </div>
            <div>
              <h1 className="font-display font-black text-4xl text-desert-50 mb-3">Parfait !</h1>
              <p className="text-desert-300 text-lg mb-2">Votre reçu a bien été envoyé à l'organisateur.</p>
              <p className="text-desert-400">Vous recevrez vos <span className="text-sahara-400 font-semibold">tickets QR Code</span> dès validation du paiement.</p>
            </div>
            <div className="card p-5 inline-block">
              <p className="text-desert-500 text-sm mb-1">Numéro de commande</p>
              <p className="font-mono font-bold text-2xl text-sahara-400">{orderNumber}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={`/track/${orderNumber}`} className="btn-outline py-3 px-6 rounded-xl">Suivre ma commande</a>
              <a href="/" className="btn-gold py-3 px-6 rounded-xl">Retour à l'accueil</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
