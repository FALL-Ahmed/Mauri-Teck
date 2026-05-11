const { PrismaClient } = require('@prisma/client')
const QRCode = require('qrcode')
const prisma = new PrismaClient()

const generateTicketNumber = () => 'GUEST-' + Date.now() + '-' + Math.random().toString(36).substring(2,7).toUpperCase()

exports.createGuestTicket = async (req, res) => {
  try {
    const { eventId, guestName, guestPhone } = req.body
    const ticketNumber = generateTicketNumber()
    const qrData = JSON.stringify({ type: 'GUEST', ticketNumber, eventId })
    const qrCode = await QRCode.toDataURL(qrData)

    const ticket = await prisma.guestTicket.create({
      data: { eventId, guestName, guestPhone, ticketNumber, qrCode }
    })
    res.json({ ticket })
  } catch (e) { console.error('GUEST TICKET ERROR:', e); res.status(500).json({ message: e.message }) }
}

exports.getEventGuestTickets = async (req, res) => {
  try {
    const tickets = await prisma.guestTicket.findMany({
      where: { eventId: req.params.eventId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ tickets })
  } catch (e) { console.error(e); res.status(500).json({ message: e.message }) }
}

exports.scanGuestTicket = async (req, res) => {
  try {
    const { qrData, eventId } = req.body
    let parsed
    try { parsed = JSON.parse(qrData) } catch { return res.status(400).json({ message: 'QR invalide' }) }

    const ticket = await prisma.guestTicket.findUnique({ where: { ticketNumber: parsed.ticketNumber } })
    if (!ticket) return res.status(404).json({ message: 'Ticket introuvable' })
    if (ticket.eventId !== eventId) return res.status(400).json({ message: 'Ticket pour un autre événement' })
    if (ticket.status === 'USED') return res.status(400).json({ message: 'Ticket déjà utilisé' })

    const updated = await prisma.guestTicket.update({
      where: { id: ticket.id },
      data: { status: 'USED', scannedAt: new Date() }
    })
    res.json({ message: 'Invité admis avec succès', ticket: updated })
  } catch (e) { console.error(e); res.status(500).json({ message: e.message }) }
}

exports.deleteGuestTicket = async (req, res) => {
  try {
    await prisma.guestTicket.delete({ where: { id: req.params.id } })
    res.json({ message: 'Supprimé' })
  } catch (e) { console.error(e); res.status(500).json({ message: e.message }) }
}
