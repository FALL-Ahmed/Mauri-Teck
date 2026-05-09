const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Token manquant' });

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organizer: true,
        agent: { include: { organizer: true } }
      }
    });

    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Non autorisé' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  next();
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organizer: true, agent: { include: { organizer: true } } }
    });
    if (user && user.isActive) req.user = user;
  } catch { /* token invalide ou absent → on continue comme guest */ }
  next();
};

module.exports = { authenticate, authorize, optionalAuthenticate };
