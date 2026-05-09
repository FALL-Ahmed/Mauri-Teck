const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Mauti-Ticket database...');

  // Admin
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { phone: '41414141' },
    update: { password: adminPass, role: 'ADMIN' },
    create: { phone: '41414141', email: 'admin@gmail.com', password: adminPass, name: 'Super Admin', role: 'ADMIN' }
  });
  console.log('Admin créé - téléphone: 41414141');

  // Categories
  const categories = [
    { name: 'Musique', description: 'Concerts et festivals musicaux', icon: '🎵', color: '#D4A853' },
    { name: 'Sport', description: 'Événements sportifs', icon: '⚽', color: '#2E7D32' },
    { name: 'Culture', description: 'Expositions et spectacles culturels', icon: '🎭', color: '#7B1FA2' },
    { name: 'Conférence', description: 'Conférences et séminaires', icon: '💼', color: '#1565C0' },
    { name: 'Fête', description: 'Célébrations et festivités', icon: '🎉', color: '#E65100' },
    { name: 'Formation', description: 'Ateliers et formations', icon: '📚', color: '#00695C' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({ where: { name: cat.name }, update: {}, create: cat });
  }
  console.log('Catégories créées');

  // Organizer
  const orgPass = await bcrypt.hash('org123', 12);
  const orgUser = await prisma.user.upsert({
    where: { phone: '42424242' },
    update: { password: orgPass, role: 'ORGANIZER' },
    create: {
      phone: '42424242', email: 'organisateur@gmail.com', password: orgPass,
      name: 'Organisateur', role: 'ORGANIZER', createdBy: admin.id,
      organizer: { create: { companyName: 'Events Mauritanie SARL', description: 'Organisateur événementiel de référence en Mauritanie', isVerified: true } }
    }
  });
  const existingOrg = await prisma.organizer.findUnique({ where: { userId: orgUser.id } });
  if (!existingOrg) await prisma.organizer.create({ data: { userId: orgUser.id, companyName: 'Events Mauritanie SARL', isVerified: true } });
  console.log('Organisateur créé - téléphone: 42424242');

  console.log('\nComptes créés:');
  console.log('  Admin        → téléphone: 41414141  / mot de passe: admin123');
  console.log('  Organisateur → téléphone: 42424242  / mot de passe: org123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
