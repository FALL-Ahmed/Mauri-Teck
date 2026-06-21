const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// AGENT → Scanner un ticket
exports.scan = async (req, res) => {
  try {
    const { qrData, eventId } = req.body;

    // Vérifier que l'agent est assigné à cet événement
    const assigned = await prisma.eventAgent.findFirst({ where: { eventId, agentId: req.user.agent.id } });
    if (!assigned) return res.status(403).json({ success: false, message: 'Vous n\'êtes pas assigné à cet événement' });

    let parsed;
    try { parsed = JSON.parse(qrData); } catch { return res.status(400).json({ success: false, message: 'QR invalide' }); }

    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber: parsed.ticketNumber },
      include: {
        orderItem: {
          include: {
            order: { include: { event: { select: { id: true, title: true, date: true } } } },
            ticketType: { select: { name: true, color: true } }
          }
        }
      }
    });

    if (!ticket) return res.status(404).json({ success: false, message: '❌ Ticket introuvable' });
    if (ticket.orderItem.order.event.id !== eventId)
      return res.status(400).json({ success: false, message: '❌ Ce ticket n\'est pas pour cet événement' });

    if (ticket.status === 'USED')
      return res.status(400).json({ success: false, message: '⚠️ Ticket déjà utilisé', scannedAt: ticket.scannedAt, ticket });
    if (ticket.status === 'CANCELLED')
      return res.status(400).json({ success: false, message: '❌ Ticket annulé', ticket });
    if (ticket.status === 'PENDING')
      return res.status(400).json({ success: false, message: '⏳ Ticket non encore confirmé', ticket });

    // Marquer comme utilisé
    const updated = await prisma.ticket.update({
      where: { ticketNumber: parsed.ticketNumber },
      data: { status: 'USED', scannedAt: new Date(), scannedBy: req.user.id },
      include: { orderItem: { include: { ticketType: true, order: { select: { guestName: true, guestEmail: true, userId: true } } } } }
    });

    res.json({ success: true, message: '✅ Accès autorisé', ticket: updated });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// AGENT → Événements qui lui sont assignés
exports.myEvents = async (req, res) => {
  try {
    const assignments = await prisma.eventAgent.findMany({
      where: { agentId: req.user.agent.id },
      include: {
        event: {
          include: {
            category: true,
            ticketTypes: { select: { name: true, totalSeats: true, availableSeats: true } },
            _count: { select: { orders: true } }
          }
        }
      }
    });
    res.json({ success: true, events: assignments.map(a => a.event) });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// Stats de scan pour un événement
exports.scanStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const base = { orderItem: { order: { eventId } } };
    const [total, used, active, pending] = await Promise.all([
      prisma.ticket.count({ where: base }),
      prisma.ticket.count({ where: { ...base, status: 'USED' } }),
      prisma.ticket.count({ where: { ...base, status: 'ACTIVE' } }),
      prisma.ticket.count({ where: { ...base, status: 'PENDING' } })
    ]);
    res.json({ success: true, stats: { total, used, active, pending, percentUsed: total ? Math.round((used / total) * 100) : 0 } });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// Historique des scans récents (agent)
exports.scanHistory = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await prisma.ticket.findMany({
      where: { orderItem: { order: { eventId } }, status: 'USED', scannedBy: req.user.id },
      include: { orderItem: { include: { ticketType: { select: { name: true, color: true } } } } },
      orderBy: { scannedAt: 'desc' },
      take: 50
    });
    res.json({ success: true, tickets });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// ORGANIZER → Annuler un ticket individuel
exports.cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        orderItem: {
          include: {
            order: { include: { event: { include: { organizer: true } } } },
            ticketType: true
          }
        }
      }
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket introuvable' });
    if (ticket.orderItem.order.event.organizer.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (ticket.status === 'CANCELLED')
      return res.status(400).json({ success: false, message: 'Ticket déjà annulé' });

    // Annuler le ticket, remettre la place et déduire le montant
    const ticketPrice = ticket.orderItem.unitPrice;
    const [updated] = await Promise.all([
      prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'CANCELLED' }
      }),
      prisma.ticketType.update({
        where: { id: ticket.orderItem.ticketTypeId },
        data: { availableSeats: { increment: 1 } }
      }),
      prisma.order.update({
        where: { id: ticket.orderItem.orderId },
        data: { totalAmount: { decrement: ticketPrice } }
      })
    ]);
    res.json({ success: true, message: '✅ Ticket annulé', ticket: updated, refundAmount: ticketPrice });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};
