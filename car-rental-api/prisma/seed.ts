import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const adminPassword = await bcrypt.hash('Admin@2025!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@car-rental.tn' },
    update: {},
    create: {
      email: 'admin@car-rental.tn',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Agence',
      phone: '+21620000000',
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  await prisma.agencyConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      agencyName: 'AutoLocation Tunisie',
      phone: '+21620000000',
      email: 'contact@car-rental.tn',
      address: '123 Avenue Habib Bourguiba',
      city: 'Tunis',
      slogan: 'Votre mobilité, notre priorité',
      openingHours: {
        Mon: { open: '09:00', close: '18:00' },
        Tue: { open: '09:00', close: '18:00' },
        Wed: { open: '09:00', close: '18:00' },
        Thu: { open: '09:00', close: '18:00' },
        Fri: { open: '09:00', close: '18:00' },
        Sat: { open: '09:00', close: '13:00' },
        Sun: null,
      },
    },
  });
  console.log('✅ Agency config created');

  const vehicles = [
    {
      registration: 'AB-123-TU',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      category: 'SEDAN' as const,
      fuelType: 'ESSENCE' as const,
      transmission: 'AUTOMATIC' as const,
      seats: 5,
      doors: 4,
      color: 'Blanc',
      mileage: 15000,
      dailyRate: 120,
      depositAmount: 200,
      features: ['Climatisation', 'Bluetooth', 'Caméra recul'],
    },
    {
      registration: 'CD-456-TU',
      brand: 'Peugeot',
      model: '308',
      year: 2022,
      category: 'COMPACT' as const,
      fuelType: 'DIESEL' as const,
      transmission: 'MANUAL' as const,
      seats: 5,
      doors: 4,
      color: 'Gris',
      mileage: 28000,
      dailyRate: 95,
      depositAmount: 150,
      features: ['Climatisation', 'Régulateur de vitesse'],
    },
    {
      registration: 'EF-789-TU',
      brand: 'Dacia',
      model: 'Duster',
      year: 2023,
      category: 'SUV' as const,
      fuelType: 'DIESEL' as const,
      transmission: 'MANUAL' as const,
      seats: 5,
      doors: 5,
      color: 'Noir',
      mileage: 8000,
      dailyRate: 130,
      depositAmount: 200,
      features: ['Climatisation', 'Bluetooth', '4x4'],
    },
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { registration: v.registration },
      update: {},
      create: v,
    });
  }
  console.log(`✅ ${vehicles.length} demo vehicles created`);

  // Default price rules
  const priceRules = [
    {
      name: 'Weekend',
      type: 'WEEKEND' as const,
      extraPct: 10,
      minDays: 1,
      isActive: true,
    },
    {
      name: 'Long term 7+ days',
      type: 'LONG_TERM' as const,
      discountPct: 10,
      minDays: 7,
      isActive: true,
    },
    {
      name: 'Long term 15+ days',
      type: 'LONG_TERM' as const,
      discountPct: 20,
      minDays: 15,
      isActive: true,
    },
  ];

  for (const rule of priceRules) {
    await prisma.priceRule.create({ data: rule });
  }
  console.log(`✅ ${priceRules.length} price rules created`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());