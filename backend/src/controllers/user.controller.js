const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ADMIN → Créer un organisateur
exports.createOrganizer = async (req, res) => {
  try {
    const { email, password, name, phone, companyName, description } = req.body;
    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });

    const logo = req.file ? req.file.path : null;
    const user = await prisma.user.create({
      data: {
        email, name, phone, role: 'ORGANIZER', createdBy: req.user.id,
        password: await bcrypt.hash(password, 12),
        organizer: { create: { companyName, description, logo } }
      },
      include: { organizer: true }
    });
    const { password: _, ...safe } = user;
    res.status(201).json({ success: true, user: safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ORGANIZER → Créer un agent
exports.createAgent = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });

    const user = await prisma.user.create({
      data: {
        email, name, phone, role: 'AGENT', createdBy: req.user.id,
        password: await bcrypt.hash(password, 12),
        agent: { create: { organizerId: req.user.organizer.id } }
      },
      include: { agent: true }
    });
    const { password: _, ...safe } = user;
    res.status(201).json({ success: true, user: safe });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ADMIN → Tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true,
        organizer: { select: { companyName: true, logo: true, isVerified: true } },
        agent: { select: { organizer: { select: { companyName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ORGANIZER → Ses agents
exports.getMyAgents = async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { organizerId: req.user.organizer.id },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true, isActive: true, createdAt: true } },
        eventAgents: { include: { event: { select: { id: true, title: true, date: true, status: true } } } }
      }
    });
    res.json({ success: true, agents });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ADMIN → Activer/désactiver un compte
exports.toggleStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
    res.json({ success: true, isActive: updated.isActive });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ORGANIZER → Vérifier logo upload
exports.updateLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Fichier requis' });
    const logo = req.file.path;
    await prisma.organizer.update({ where: { userId: req.user.id }, data: { logo } });
    res.json({ success: true, logo });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
