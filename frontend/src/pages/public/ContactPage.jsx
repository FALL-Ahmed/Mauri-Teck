import { Phone, Mail, MessageCircle, MapPin, ExternalLink } from 'lucide-react'
import Navbar from '../../components/common/Navbar'

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-4xl text-desert-50 mb-3">Nous contacter</h1>
          <p className="text-desert-400">Une question ? Un problème ? On est là pour vous aider.</p>
        </div>

        <div className="space-y-4">
          <a href="https://wa.me/22249377834" target="_blank" rel="noreferrer"
            className="card p-5 flex items-center gap-4 hover:border-green-400/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-desert-100">WhatsApp</p>
              <p className="text-desert-400 text-sm">+222 49 37 78 34</p>
            </div>
            <ExternalLink className="w-4 h-4 text-desert-600 group-hover:text-desert-400 transition-colors" />
          </a>

          <a href="tel:+22242212338"
            className="card p-5 flex items-center gap-4 hover:border-sahara-400/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sahara-400/10 flex items-center justify-center group-hover:bg-sahara-400/20 transition-colors">
              <Phone className="w-6 h-6 text-sahara-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-desert-100">Téléphone</p>
              <p className="text-desert-400 text-sm">+222 42 21 23 38</p>
            </div>
            <ExternalLink className="w-4 h-4 text-desert-600 group-hover:text-desert-400 transition-colors" />
          </a>

          <a href="mailto:contact@mauri-ticket.mr"
            className="card p-5 flex items-center gap-4 hover:border-blue-400/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-desert-100">Email</p>
              <p className="text-desert-400 text-sm">contact@mauri-ticket.mr</p>
            </div>
            <ExternalLink className="w-4 h-4 text-desert-600 group-hover:text-desert-400 transition-colors" />
          </a>

          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-desert-100">Localisation</p>
              <p className="text-desert-400 text-sm">Nouakchott, Mauritanie</p>
            </div>
          </div>
        </div>

        <div className="mt-8 card p-6 text-center border border-sahara-400/20">
          <p className="text-desert-400 text-sm mb-1">Réalisé par</p>
          <a href="https://africa-ia-consulting.com" target="_blank" rel="noreferrer"
            className="font-bold text-sahara-400 hover:text-sahara-300 transition-colors text-lg flex items-center justify-center gap-2">
            AfriacaIAConsulting <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
