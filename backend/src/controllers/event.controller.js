const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── PUBLIC ──────────────────────────────────────────────────────────────────
exports.getPublic = async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 12 } = req.query;
    const where = {
      status: 'PUBLISHED',
      ...(category && { categoryId: category }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] })
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where, skip, take: Number(limit),
        include: {
          category: true,
          organizer: { select: { companyName: true, logo: true } },
          ticketTypes: { select: { id: true, name: true, price: true, availableSeats: true, color: true } }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.event.count({ where })
    ]);
    res.json({ success: true, events, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.getOne = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        organizer: { select: { companyName: true, logo: true, description: true } },
        ticketTypes: true,
        eventAgents: { include: { agent: { include: { user: { select: { name: true, id: true } } } } } }
      }
    });
    if (!event) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    res.json({ success: true, event });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// ── ORGANIZER ────────────────────────────────────────────────────────────────
exports.getMyEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.organizer.id },
      include: {
        category: true,
        ticketTypes: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, events });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.create = async (req, res) => {
  try {
    const { title, description, date, endDate, location, address, city, categoryId, ticketTypes } = req.body;
    const image = req.file ? req.file.path : null;
    const parsedTickets = typeof ticketTypes === 'string' ? JSON.parse(ticketTypes) : ticketTypes || [];

    const event = await prisma.event.create({
      data: {
        title, description, date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        location, address, city, categoryId, image,
        organizerId: req.user.organizer.id,
        ticketTypes: {
          create: parsedTickets.map(t => ({
            name: t.name, description: t.description,
            price: parseFloat(t.price),
            totalSeats: parseInt(t.totalSeats),
            availableSeats: parseInt(t.totalSeats),
            color: t.color || '#D4A853',
            benefits: t.benefits || []
          }))
        }
      },
      include: { ticketTypes: true, category: true }
    });
    res.status(201).json({ success: true, event });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.update = async (req, res) => {
  try {
    const ev = await prisma.event.findFirst({ where: { id: req.params.id, organizerId: req.user.organizer.id } });
    if (!ev) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    const image = req.file ? req.file.path : ev.image;
    const { title, description, date, endDate, location, address, city, categoryId, status } = req.body;
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: { title, description, date: new Date(date), endDate: endDate ? new Date(endDate) : null, location, address, city, categoryId, status, image },
      include: { ticketTypes: true, category: true }
    });
    res.json({ success: true, event: updated });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.publish = async (req, res) => {
  try {
    const ev = await prisma.event.findFirst({ where: { id: req.params.id, organizerId: req.user.organizer.id } });
    if (!ev) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    const updated = await prisma.event.update({ where: { id: req.params.id }, data: { status: 'PUBLISHED' } });
    res.json({ success: true, event: updated });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.assignAgent = async (req, res) => {
  try {
    const { eventId, agentId } = req.body;
    const ev = await prisma.event.findFirst({ where: { id: eventId, organizerId: req.user.organizer.id } });
    if (!ev) return res.status(404).json({ success: false, message: 'Événement introuvable' });
    const assignment = await prisma.eventAgent.upsert({
      where: { eventId_agentId: { eventId, agentId } },
      create: { eventId, agentId },
      update: {}
    });
    res.json({ success: true, assignment });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.removeAgent = async (req, res) => {
  try {
    const { eventId, agentId } = req.body;
    await prisma.eventAgent.deleteMany({ where: { eventId, agentId } });
    res.json({ success: true, message: 'Agent retiré de l\'événement' });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: { select: { companyName: true, logo: true } },
        category: true,
        ticketTypes: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, events });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.adminUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await prisma.event.update({ where: { id: req.params.id }, data: { status } });
    res.json({ success: true, event });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

// ── TICKET TYPES (CRUD) ───────────────────────────────────────────────────────
exports.addTicketType = async (req, res) => {
  try {
    const { name, description, price, totalSeats, color, benefits } = req.body;
    const ev = await prisma.event.findFirst({ where: { id: req.params.id, organizerId: req.user.organizer.id } });
    if (!ev) return res.status(403).json({ success: false, message: 'Accès refusé' });
    const tt = await prisma.ticketType.create({
      data: { eventId: req.params.id, name, description, price: parseFloat(price), totalSeats: parseInt(totalSeats), availableSeats: parseInt(totalSeats), color, benefits: benefits || [] }
    });
    res.status(201).json({ success: true, ticketType: tt });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.updateTicketType = async (req, res) => {
  try {
    const tt = await prisma.ticketType.update({ where: { id: req.params.ttId }, data: req.body });
    res.json({ success: true, ticketType: tt });
  } catch { res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};
