const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const { v4: uuid } = require('uuid');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// ── MAILER ────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const sendTicketEmail = async (order, tickets) => {
  const email = order.guestEmail || order.user?.email;
  const name  = order.guestName  || order.user?.name || 'Cher client';
  if (!email) return;

  const eventDate = new Date(order.event.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Générer les QR codes en buffer PNG pour les pièces jointes
  const attachments = [];
  const ticketsHTML = tickets.map((t, i) => {
    const cid = `qr_${t.ticketNumber}@mauti`;
    // Extraire le buffer base64 du dataURL
    const base64Data = t.qrCode.replace(/^data:image\/png;base64,/, '');
    attachments.push({
      filename: `ticket-${i + 1}-${t.ticketNumber}.png`,
      content: base64Data,
      encoding: 'base64',
      cid: cid  // Content-ID pour référencer dans le HTML
    });

    return `
    <div style="background:#1a0a00;border:2px solid #D4A853;border-radius:16px;padding:24px;margin:16px 0;text-align:center;">
      <div style="font-size:13px;color:#D4A853;font-weight:bold;letter-spacing:2px;margin-bottom:8px;">🎟️ TICKET ${i + 1}</div>
      <div style="font-size:12px;color:#aaa;margin-bottom:8px;">Numéro de ticket</div>
      <div style="font-size:13px;color:#fff;font-family:monospace;font-weight:bold;margin-bottom:16px;background:#000;padding:8px;border-radius:8px;">${t.ticketNumber}</div>
      <img src="cid:${cid}" width="220" height="220" style="background:white;padding:10px;border-radius:12px;display:block;margin:0 auto;" />
      <div style="font-size:12px;color:#D4A853;margin-top:12px;font-weight:bold;">Présentez ce QR code à l'entrée</div>
      <div style="font-size:11px;color:#666;margin-top:4px;">⚠️ Usage unique — ne pas partager</div>
    </div>
  `}).join('');

  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

        <div style="text-align:center;margin-bottom:24px;">
          <div style="background:linear-gradient(135deg,#D4A853,#b8882a);display:inline-block;padding:16px 40px;border-radius:16px;">
            <div style="font-size:26px;font-weight:900;color:white;letter-spacing:2px;">🎫 MAUTI-TICKET</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.8);letter-spacing:3px;margin-top:2px;">MAURITANIE</div>
          </div>
        </div>

        <div style="background:white;border-radius:20px;padding:32px;margin-bottom:16px;box-shadow:0 2px 20px rgba(0,0,0,0.1);">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;">✅</div>
            <h1 style="color:#1a1a1a;font-size:22px;margin:8px 0 4px;">Commande confirmée !</h1>
            <p style="color:#666;font-size:15px;margin:0;">Bonjour <strong>${name}</strong>, votre paiement a été validé.</p>
          </div>

          <div style="background:#f9f6f0;border:1px solid #D4A853;border-radius:12px;padding:20px;margin-bottom:24px;">
            <h2 style="color:#D4A853;font-size:16px;margin:0 0 14px;">📅 Détails de l'événement</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="color:#888;padding:5px 0;width:130px;">Événement</td><td style="color:#1a1a1a;font-weight:bold;">${order.event.title}</td></tr>
              <tr><td style="color:#888;padding:5px 0;">Date</td><td style="color:#1a1a1a;">${eventDate}</td></tr>
              <tr><td style="color:#888;padding:5px 0;">Lieu</td><td style="color:#1a1a1a;">${order.event.location}</td></tr>
              <tr><td style="color:#888;padding:5px 0;">N° Commande</td><td style="color:#D4A853;font-family:monospace;font-weight:bold;">${order.orderNumber}</td></tr>
              <tr><td style="color:#888;padding:5px 0;">Montant payé</td><td style="color:#16a34a;font-weight:bold;">${order.totalAmount.toLocaleString()} MRU</td></tr>
            </table>
          </div>

          <h2 style="color:#1a1a1a;font-size:16px;margin:0 0 8px;">🎟️ Vos tickets QR</h2>
          <p style="color:#666;font-size:13px;margin:0 0 16px;">Présentez ces QR codes à l'entrée. L'agent les scannera pour valider votre accès. Chaque ticket est valide <strong>une seule fois</strong>.</p>
          ${ticketsHTML}
        </div>

        <div style="text-align:center;color:#999;font-size:11px;padding:16px;">
          <p style="margin:0;">Mauti-Ticket — La première plateforme de tickets en ligne en Mauritanie</p>
          <p style="margin:4px 0 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body></html>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || `Mauti-Ticket <${process.env.MAIL_USER}>`,
    to: email,
    subject: `🎫 Vos tickets - ${order.event.title} | Mauti-Ticket`,
    html,
    attachments,  // QR codes en pièces jointes inline
  });
  console.log(`📧 Email envoyé à ${email} avec ${attachments.length} ticket(s)`);
};

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
      data: { paymentProof: `/uploads/receipts/${req.file.filename}`, status: 'PAYMENT_UPLOADED' }
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
      where: { userId: req.user.id },
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

    // Envoyer l'email avec les tickets
    try {
      await sendTicketEmail(confirmed, allTickets);
    } catch (mailErr) {
      console.error('❌ Erreur envoi email:', mailErr.message);
    }

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