import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, QrCode, CheckCircle, XCircle, Camera, RotateCcw, User } from 'lucide-react'
import jsQR from 'jsqr'
import api, { BASE_URL } from '../../utils/api'

export default function AgentScanner() {
  const { eventId } = useParams()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const streamRef = useRef(null)

  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [eventInfo, setEventInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    fetchStats()
    fetchEventInfo()
    return () => stopCamera()
  }, [eventId])

  const fetchStats = () => {
    api.get(`/tickets/scan-stats/${eventId}`).then(r => setStats(r.data.stats))
  }

  const fetchEventInfo = () => {
    api.get(`/events/${eventId}`).then(r => setEventInfo(r.data.event)).finally(() => setLoading(false))
  }

  const startCamera = async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      videoRef.current.play()
      setScanning(true)
      scanLoop()
    } catch {
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
    }
  }

  const stopCamera = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setScanning(false)
  }

  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) { handleScan(code.data); return }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
  }

  const handleScan = async (qrData) => {
    stopCamera()
    try {
      let parsed = {}
      try { parsed = JSON.parse(qrData) } catch {}
      const isGuest = parsed.type === 'GUEST'
      const endpoint = isGuest ? '/guest-tickets/scan' : '/tickets/scan'
      const { data } = await api.post(endpoint, { qrData, eventId })
      setResult({ success: true, message: data.message, ticket: data.ticket, isGuest })
      fetchStats()
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Erreur de scan', isGuest: false })
    }
  }

  const reset = () => {
    setResult(null)
    startCamera()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sahara-400 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/agent" onClick={stopCamera} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5"/>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">{eventInfo?.title}</h1>
          <p className="text-sm text-gray-400">{eventInfo?.location} · {new Date(eventInfo?.date).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Entrés', value: stats.used, color: 'text-green-400' },
            { label: 'En attente', value: stats.active, color: 'text-blue-400' },
            { label: 'Total', value: stats.total, color: 'text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {result ? (
          <div className={`p-8 text-center ${result.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {result.success
              ? <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4"/>
              : <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4"/>
            }
            <h2 className={`text-xl font-black mb-2 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
              {result.success ? '✅ ACCÈS AUTORISÉ' : '❌ ACCÈS REFUSÉ'}
            </h2>
            <p className="text-gray-300 text-sm mb-4">{result.message}</p>

            {result.ticket && !result.isGuest && (
              <div className="mt-2 bg-white/5 rounded-xl p-4 text-left text-sm">
                <div className="font-mono text-xs text-sahara-400 mb-2">{result.ticket.ticketNumber}</div>
                <div className="text-gray-300">Type : <span className="text-white font-bold">{result.ticket.orderItem?.ticketType?.name}</span></div>
              </div>
            )}

            {result.ticket && result.isGuest && (
              <div className="mt-2 bg-white/5 border border-sahara-400/20 rounded-xl p-4 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-sahara-400 flex-shrink-0 bg-night-700 flex items-center justify-center">
                    {result.ticket.guestPhoto
                      ? <img src={`${BASE_URL}${result.ticket.guestPhoto}`} alt="" className="w-full h-full object-cover"/>
                      : <User className="w-7 h-7 text-sahara-400"/>
                    }
                  </div>
                  <div>
                    <div className="text-xs text-sahara-400 font-bold uppercase tracking-wider mb-0.5">✦ Invité(e) d'honneur</div>
                    <div className="text-white font-bold text-lg">{result.ticket.guestName}</div>
                    {result.ticket.guestPhone && <div className="text-gray-400 text-xs">{result.ticket.guestPhone}</div>}
                  </div>
                </div>
                <div className="font-mono text-xs text-sahara-400 bg-black/20 px-3 py-1.5 rounded-lg">{result.ticket.ticketNumber}</div>
              </div>
            )}

            <button onClick={reset} className="mt-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors mx-auto">
              <RotateCcw className="w-4 h-4"/> Scanner suivant
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative aspect-square bg-black rounded-xl overflow-hidden mb-4">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted/>
              <canvas ref={canvasRef} className="hidden"/>
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 border-2 border-sahara-400/50 rounded-2xl"/>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sahara-400 rounded-tl-xl"/>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sahara-400 rounded-tr-xl"/>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sahara-400 rounded-bl-xl"/>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sahara-400 rounded-br-xl"/>
                    <div className="absolute left-2 right-2 h-0.5 bg-sahara-400 opacity-80" style={{animation:'scan 2s linear infinite'}}/>
                  </div>
                </div>
              )}
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <QrCode className="w-16 h-16 text-gray-500 mb-4"/>
                  <p className="text-gray-400 text-sm text-center px-4">
                    {cameraError || 'Appuyez sur "Démarrer" pour activer le scanner'}
                  </p>
                  <p className="text-sahara-400/60 text-xs mt-2">Tickets normaux et invités supportés</p>
                </div>
              )}
            </div>
            {cameraError && <p className="text-red-400 text-xs text-center mb-4">{cameraError}</p>}
            <button onClick={scanning ? stopCamera : startCamera}
              className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                scanning ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-sahara-500 hover:bg-sahara-400 text-white'
              }`}>
              <Camera className="w-5 h-5"/>
              {scanning ? 'Arrêter le scanner' : 'Démarrer le scanner'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 8px; }
          50% { top: calc(100% - 8px); }
          100% { top: 8px; }
        }
      `}</style>
    </div>
  )
}
