const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.admin = async (req, res) => {
  try {
    const [events, organizers, agents, orders, tickets, revenue, recentOrders, topEvents, paymentStats] = await Promise.all([
      prisma.event.count(),
      prisma.user.count({ where: { role: 'ORGANIZER' } }),
      prisma.user.count({ where: { role: 'AGENT' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.ticket.count({ where: { status: { in: ['ACTIVE', 'USED'] } } }),
      prisma.order.aggregate({ where: { status: 'CONFIRMED' }, _sum: { totalAmount: true } }),
      prisma.order.findMany({
        take: 8, orderBy: { createdAt: 'desc' },
        where: { status: { in: ['CONFIRMED', 'PAYMENT_UPLOADED', 'PENDING'] } },
        include: { event: { select: { title: true } } }
      }),
      prisma.event.findMany({
        take: 5, where: { status: 'PUBLISHED' },
        include: { organizer: { select: { companyName: true } }, _count: { select: { orders: true } } },
        orderBy: { orders: { _count: 'desc' } }
      }),
      // Stats par méthode de paiement
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: { status: 'CONFIRMED', paymentMethod: { not: null } },
        _count: { id: true },
        _sum: { totalAmount: true }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents: events,
        totalOrganizers: organizers,
        totalAgents: agents,
        confirmedOrders: orders,
        totalTickets: tickets,
        totalRevenue: revenue._sum.totalAmount || 0,
        recentOrders,
        topEvents,
        paymentStats
      }
    });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};

exports.organizer = async (req, res) => {
  try {
    const orgId = req.user.organizer.id;
    const [events, orders, revenue, ticketsSold, pendingPayments, eventDetails, paymentStats] = await Promise.all([
      prisma.event.count({ where: { organizerId: orgId } }),
      prisma.order.count({ where: { event: { organizerId: orgId }, status: 'CONFIRMED' } }),
      prisma.order.aggregate({ where: { event: { organizerId: orgId }, status: 'CONFIRMED' }, _sum: { totalAmount: true } }),
      prisma.ticket.count({ where: { orderItem: { order: { event: { organizerId: orgId }, status: 'CONFIRMED' } } } }),
      prisma.order.count({ where: { event: { organizerId: orgId }, status: 'PAYMENT_UPLOADED' } }),
      prisma.event.findMany({
        where: { organizerId: orgId },
        include: { ticketTypes: true, orders: { include: { items: true } }, _count: { select: { orders: true } } },
        orderBy: { date: 'asc' },
        take: 10
      }),
      // Stats par méthode de paiement pour l'organisateur
      prisma.order.groupBy({
        by: ['paymentMethod'],
        where: {
          event: { organizerId: orgId },
          status: 'CONFIRMED',
          paymentMethod: { not: null }
        },
        _count: { id: true },
        _sum: { totalAmount: true }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents: events,
        confirmedOrders: orders,
        totalRevenue: revenue._sum.totalAmount || 0,
        ticketsSold,
        pendingPayments,
        eventStats: eventDetails,
        paymentStats
      }
    });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Erreur serveur' }); }
};
