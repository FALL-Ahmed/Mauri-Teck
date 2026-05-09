const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const { v4: uuid } = require('uuid');
const prisma = new PrismaClient();

const mkOrderNumber = () => `MT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const mkTicketNumber = () => `TK-${uuid().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

// ── PUBLIC/BUYER ──────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { eventId, items, guestName, guestEmail, guestPhone, paymentMethod, notes } = req.body;
    const userId = req.user?.id || null;

    const event = await prisma.event.findFirst({ where: { id: eventId, status: 'PUBLISHED' } });
    if (!event) return res.status(404).json({ success: false, message: 'Événement introuvable' });

    let totalAmount = 0;
    const validated = [];
    for (const item of items) {
      const tt = await prisma.ticketType.findUnique({ where: { id: item.ticketTypeId } });
      if (!tt) return res.status(400).json({ success: false, message: 'Type de ticket invalide' });
      if (tt.availableSeats < item.quantity)
        return res.status(400).json({ success: false, message: `Pas assez de places pour "${tt.name}"` });
      totalAmount += tt.price * item.quantity;
      validated.push({ ...item, unitPrice: tt.price });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: mkOrderNumber(),
        userId, guestName, guestEmail, guestPhone, eventId, totalAmount, paymentMethod, notes,
        status: 'PENDING',
        items: { create: validated.map(i => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity, unitPrice: i.unitPrice })) }
      },
      include: { items: { include: { ticketType: true } }, event: { select: { title: true, date: true, location: true } } }
    });

    // Decrease seats
    for (const i of validated)
      await prisma.ticketType.update({ where: { id: i.ticketTypeId }, data: { availableSeats: { decrement: i.quantity } } });

    res.status(201).json({ success: true, order });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// Upload proof de paiement
exports.uploadProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image requise' });
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    const updated = await prisma.order.update({
      where: { id },
      data: { paymentProof: req.file.path, status: 'PAYMENT_UPLOADED' }
    });
    res.json({ success: true, order: updated });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// Tracker commande (invité)
exports.trackOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        event: { select: { title: true, date: true, location: true, image: true } },
        items: { include: { ticketType: true, tickets: true } }
      }
    });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, order });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// Mes commandes (acheteur connecté)
exports.myOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { OR: [{ userId: req.user.id }, { guestPhone: req.user.phone }] },
      include: {
        event: { select: { title: true, date: true, location: true, image: true, city: true } },
        items: { include: { ticketType: true, tickets: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// ── ORGANIZER ─────────────────────────────────────────────────────────────────
// Commandes en attente de validation (preuve uploadée)
exports.getPending = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { event: { organizerId: req.user.organizer.id }, status: 'PAYMENT_UPLOADED' },
      include: {
        event: { select: { title: true, date: true } },
        items: { include: { ticketType: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// Toutes les commandes de l'organisateur
exports.getOrganizerOrders = async (req, res) => {
  try {
    const { eventId, status } = req.query;
    const orders = await prisma.order.findMany({
      where: {
        event: { organizerId: req.user.organizer.id },
        ...(eventId && { eventId }),
        ...(status && { status })
      },
      include: {
        event: { select: { title: true, date: true } },
        items: { include: { ticketType: true, tickets: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// CONFIRMER commande → générer tickets avec QR
exports.confirm = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { ticketType: true } },
        event: { include: { organizer: true } },
        user: { select: { email: true, name: true } }
      }
    });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    if (order.event.organizer.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    if (order.status === 'CONFIRMED')
      return res.status(400).json({ success: false, message: 'Commande déjà confirmée' });

    // Générer tickets + QR codes
    const allTickets = [];
    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketNumber = mkTicketNumber();
        const qrData = JSON.stringify({ ticketNumber, eventId: order.eventId, orderId: order.id, eventTitle: order.event.title });
        const qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2, color: { dark: '#1a0a00', light: '#fff8f0' } });
        const ticket = await prisma.ticket.create({ data: { ticketNumber, orderItemId: item.id, qrCode, status: 'ACTIVE' } });
        allTickets.push(ticket);
      }
    }

    const confirmed = await prisma.order.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        items: { include: { ticketType: true, tickets: true } },
        event: { select: { title: true, date: true, location: true } },
        user: { select: { email: true, name: true } }
      }
    });

    res.json({ success: true, order: confirmed, tickets: allTickets });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// REJETER commande
exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id }, include: { event: { include: { organizer: true } }, items: true } });
    if (!order || order.event.organizer.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    // Restore seats
    for (const item of order.items)
      await prisma.ticketType.update({ where: { id: item.ticketTypeId }, data: { availableSeats: { increment: item.quantity } } });

    const updated = await prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } });
    res.json({ success: true, order: updated });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// ADMIN → toutes les commandes
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        event: { select: { title: true, organizer: { select: { companyName: true } } } },
        items: { include: { ticketType: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};