import { PrismaClient, Role, BookingStatus, PaymentStatus, PaymentMethod, TransactionType, MaintenanceType, VehicleCategory, FuelType, Transmission, VehicleStatus, PriceRuleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

function bookingRef(prefix: string, idx: number): string {
  return `${prefix}-${String(idx).padStart(5, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...');

  // Wipe existing data (respect FK order)
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.priceRule.deleteMany();
  await prisma.vehicleImage.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.agencyConfig.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Existing data cleared');

  // ─────────────────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('Password@123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@car-rental.tn',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Agence',
      phone: '+21620000000',
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const clients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'ahmed.benali@email.com',
        passwordHash,
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        phone: '+21620123456',
        cin: '12345678',
        drivingLicense: 'TU-987654',
        licenseExpiry: daysFromNow(365),
        address: '45 Rue de la Liberté',
        city: 'Tunis',
        role: Role.CLIENT,
        isEmailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'fatma.trabelsi@email.com',
        passwordHash,
        firstName: 'Fatma',
        lastName: 'Trabelsi',
        phone: '+21620987654',
        cin: '23456789',
        drivingLicense: 'SO-123456',
        licenseExpiry: daysFromNow(200),
        address: '12 Avenue Habib Thamri',
        city: 'Sousse',
        role: Role.CLIENT,
        isEmailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mohamed.jendoubi@email.com',
        passwordHash,
        firstName: 'Mohamed',
        lastName: 'Jendoubi',
        phone: '+21655111222',
        cin: '34567890',
        drivingLicense: 'MO-654321',
        licenseExpiry: daysFromNow(90),
        address: '8 Boulevard de la République',
        city: 'Monastir',
        role: Role.CLIENT,
        isEmailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'salma.bouazizi@email.com',
        passwordHash,
        firstName: 'Salma',
        lastName: 'Bouazizi',
        phone: '+21655333444',
        cin: '45678901',
        drivingLicense: 'SF-111222',
        licenseExpiry: daysFromNow(150),
        address: '22 Rue des Jasmins',
        city: 'Sfax',
        role: Role.CLIENT,
        isEmailVerified: false,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'youssef.hamdi@email.com',
        passwordHash,
        firstName: 'Youssef',
        lastName: 'Hamdi',
        phone: '+21655555666',
        role: Role.CLIENT,
        isEmailVerified: true,
        isActive: false,
      },
    }),
  ]);

  const [ahmed, fatma, mohamed, salma, youssef] = clients;
  console.log(`✅ ${1 + clients.length} users created (1 admin + ${clients.length} clients)`);

  // ─────────────────────────────────────────────────────────────────────────
  // AGENCY CONFIG
  // ─────────────────────────────────────────────────────────────────────────

  await prisma.agencyConfig.create({
    data: {
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

  // ─────────────────────────────────────────────────────────────────────────
  // VEHICLES (all 6 categories + all fuel types + both transmissions)
  // ─────────────────────────────────────────────────────────────────────────

  const vehicleData = [
    // ECONOMY
    {
      registration: 'TU-101-EA',
      brand: 'Renault',
      model: 'Clio',
      year: 2023,
      category: VehicleCategory.ECONOMY,
      fuelType: FuelType.ESSENCE,
      transmission: Transmission.MANUAL,
      seats: 5,
      doors: 4,
      color: 'Rouge',
      mileage: 32000,
      dailyRate: 65,
      depositAmount: 100,
      description: 'Voiture économique idéale pour la ville. Faible consommation et facile à garer.',
      features: ['Climatisation', 'Bluetooth', 'USB'],
      mainImageUrl: '/images/renault-clio.jpg',
    },
    {
      registration: 'TU-102-EB',
      brand: 'Fiat',
      model: 'Punto',
      year: 2022,
      category: VehicleCategory.ECONOMY,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.MANUAL,
      seats: 5,
      doors: 4,
      color: 'Blanc',
      mileage: 45000,
      dailyRate: 55,
      depositAmount: 80,
      description: 'La plus économique de la flotte. Parfaite pour les petits budgets.',
      features: ['Climatisation', 'Radio'],
      mainImageUrl: '/images/fiat-punto.jpg',
    },
    // COMPACT
    {
      registration: 'TU-201-CA',
      brand: 'Peugeot',
      model: '308',
      year: 2023,
      category: VehicleCategory.COMPACT,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.MANUAL,
      seats: 5,
      doors: 4,
      color: 'Gris',
      mileage: 18000,
      dailyRate: 95,
      depositAmount: 150,
      description: 'Compacte raffinée avec excellent confort de route.',
      features: ['Climatisation', 'Régulateur de vitesse', 'Bluetooth', 'Écran tactile'],
      mainImageUrl: '/images/peugeot-308.jpg',
    },
    {
      registration: 'TU-202-CB',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2024,
      category: VehicleCategory.COMPACT,
      fuelType: FuelType.ESSENCE,
      transmission: Transmission.AUTOMATIC,
      seats: 5,
      doors: 4,
      color: 'Bleu',
      mileage: 5000,
      dailyRate: 110,
      depositAmount: 180,
      description: 'La référence des compactes. Finition allemande et conduite agréable.',
      features: ['Climatisation', 'Régulateur', 'Bluetooth', 'Caméra de recul', 'Apple CarPlay'],
      mainImageUrl: '/images/vw-golf.jpg',
    },
    // SEDAN
    {
      registration: 'TU-301-SA',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      category: VehicleCategory.SEDAN,
      fuelType: FuelType.HYBRID,
      transmission: Transmission.AUTOMATIC,
      seats: 5,
      doors: 4,
      color: 'Blanc',
      mileage: 15000,
      dailyRate: 120,
      depositAmount: 200,
      description: 'Hybride silencieuse et économe. Idéale pour les longs trajets.',
      features: ['Climatisation', 'Bluetooth', 'Caméra de recul', 'Régulateur', 'Apple CarPlay', 'Sièges chauffants'],
      mainImageUrl: '/images/toyota-corolla.jpg',
    },
    {
      registration: 'TU-302-SB',
      brand: 'Mercedes',
      model: 'Classe C',
      year: 2024,
      category: VehicleCategory.SEDAN,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      seats: 5,
      doors: 4,
      color: 'Noir',
      mileage: 3000,
      dailyRate: 180,
      depositAmount: 350,
      description: 'Berline premium avec finitions haut de gamme.',
      features: ['Climatisation bi-zone', 'Bluetooth', 'Caméra 360°', 'Régulateur adaptatif', 'Toit panoramique', 'Sièges chauffants/ventilés'],
      mainImageUrl: '/images/mercedes-classe-c.jpg',
    },
    // SUV
    {
      registration: 'TU-401-UA',
      brand: 'Dacia',
      model: 'Duster',
      year: 2023,
      category: VehicleCategory.SUV,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.MANUAL,
      seats: 5,
      doors: 5,
      color: 'Noir',
      mileage: 8000,
      dailyRate: 130,
      depositAmount: 200,
      description: 'SUV robuste et abordable. Parfait pour les aventures hors des sentiers battus.',
      features: ['Climatisation', 'Bluetooth', '4x4', 'Caméra de recul'],
      mainImageUrl: '/images/dacia-duster.jpg',
    },
    {
      registration: 'TU-402-UB',
      brand: 'Hyundai',
      model: 'Tucson',
      year: 2024,
      category: VehicleCategory.SUV,
      fuelType: FuelType.HYBRID,
      transmission: Transmission.AUTOMATIC,
      seats: 5,
      doors: 5,
      color: 'Gris',
      mileage: 2000,
      dailyRate: 160,
      depositAmount: 300,
      description: 'SUV hybride moderne avec technologie de pointe.',
      features: ['Climatisation bi-zone', 'Bluetooth', 'Caméra 360°', 'Régulateur adaptatif', 'Apple CarPlay', 'Toit panoramique'],
      mainImageUrl: '/images/hyundai-tucson.jpg',
    },
    // LUXURY
    {
      registration: 'TU-501-LA',
      brand: 'BMW',
      model: 'Série 5',
      year: 2024,
      category: VehicleCategory.LUXURY,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      seats: 5,
      doors: 4,
      color: 'Noir',
      mileage: 1500,
      dailyRate: 280,
      depositAmount: 500,
      description: 'Berline de luxe avec performances sportives et confort exceptionnel.',
      features: ['Climatisation bi-zone', 'Bluetooth', 'Caméra 360°', 'Régulateur adaptatif', 'Head-up display', 'Sièges massants', 'Harman Kardon', 'Toit panoramique'],
      mainImageUrl: '/images/bmw-serie5.jpg',
    },
    {
      registration: 'TU-502-LB',
      brand: 'Audi',
      model: 'Q7',
      year: 2024,
      category: VehicleCategory.LUXURY,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.AUTOMATIC,
      seats: 7,
      doors: 5,
      color: 'Blanc',
      mileage: 800,
      dailyRate: 320,
      depositAmount: 600,
      description: 'SUV premium 7 places. Luxe et espace pour toute la famille.',
      features: ['Climatisation tri-zone', 'Bluetooth', 'Caméra 360°', 'Régulateur adaptatif', 'Head-up display', 'Bang & Olufsen', 'Toit panoramique', 'Sièges chauffants/ventilés'],
      mainImageUrl: '/images/audi-q7.jpg',
    },
    // VAN
    {
      registration: 'TU-601-VA',
      brand: 'Renault',
      model: 'Trafic',
      year: 2023,
      category: VehicleCategory.VAN,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.MANUAL,
      seats: 9,
      doors: 4,
      color: 'Blanc',
      mileage: 25000,
      dailyRate: 150,
      depositAmount: 250,
      description: 'Minibus 9 places idéal pour les groupes et les familles nombreuses.',
      features: ['Climatisation', 'Bluetooth', 'USB', 'Portes coulissantes'],
      mainImageUrl: '/images/renault-trafic.jpg',
    },
    {
      registration: 'TU-602-VB',
      brand: 'Citroën',
      model: 'Jumpy',
      year: 2022,
      category: VehicleCategory.VAN,
      fuelType: FuelType.DIESEL,
      transmission: Transmission.MANUAL,
      seats: 8,
      doors: 4,
      color: 'Blanc',
      mileage: 38000,
      dailyRate: 140,
      depositAmount: 220,
      description: 'Transport de groupe confortable avec grand espace de bagages.',
      features: ['Climatisation', 'Bluetooth', 'Portes coulissantes', 'Régulateur de vitesse'],
      mainImageUrl: '/images/citroen-jumpy.jpg',
    },
  ];

  const vehicles: any[] = [];
  for (const v of vehicleData) {
    const created = await prisma.vehicle.create({ data: v });
    vehicles.push(created);
  }
  console.log(`✅ ${vehicles.length} vehicles created across all categories`);

  // ─────────────────────────────────────────────────────────────────────────
  // VEHICLE IMAGES
  // ─────────────────────────────────────────────────────────────────────────

  for (const v of vehicles) {
    await prisma.vehicleImage.createMany({
      data: [
        { vehicleId: v.id, imageUrl: `/images/vehicles/${v.registration}-front.jpg`, altText: `${v.brand} ${v.model} - Vue avant`, sortOrder: 0 },
        { vehicleId: v.id, imageUrl: `/images/vehicles/${v.registration}-side.jpg`, altText: `${v.brand} ${v.model} - Vue côté`, sortOrder: 1 },
        { vehicleId: v.id, imageUrl: `/images/vehicles/${v.registration}-interior.jpg`, altText: `${v.brand} ${v.model} - Intérieur`, sortOrder: 2 },
      ],
    });
  }
  console.log(`✅ ${vehicles.length * 3} vehicle images created`);

  // ─────────────────────────────────────────────────────────────────────────
  // MAINTENANCE RECORDS
  // ─────────────────────────────────────────────────────────────────────────

  const maintenanceData = [
    { vehicleId: vehicles[0].id, type: MaintenanceType.OIL_CHANGE, title: 'Vidange annuelle', description: 'Vidange huile moteur + filtre', cost: 120, mileageAt: 30000, doneDate: daysAgo(30), nextDueDate: daysFromNow(335), provider: 'Garage Central Tunis' },
    { vehicleId: vehicles[0].id, type: MaintenanceType.TIRE_CHANGE, title: 'Remplacement pneus avant', cost: 350, mileageAt: 30000, doneDate: daysAgo(25), nextDueDate: daysFromNow(340), provider: 'Pneu Service Tunis' },
    { vehicleId: vehicles[1].id, type: MaintenanceType.TECHNICAL_INSPECTION, title: 'Contrôle technique', cost: 80, doneDate: daysAgo(60), nextDueDate: daysFromNow(305), provider: 'Centre de Contrôle Ariana' },
    { vehicleId: vehicles[3].id, type: MaintenanceType.INSURANCE, title: 'Renouvellement assurance', cost: 1200, doneDate: daysAgo(10), nextDueDate: daysFromNow(355), provider: 'STAR Assurance' },
    { vehicleId: vehicles[6].id, type: MaintenanceType.CLEANING, title: 'Nettoyage complet intérieur/extérieur', cost: 50, doneDate: daysAgo(2), provider: 'Auto Wash Tunis' },
    { vehicleId: vehicles[9].id, type: MaintenanceType.BRAKE, title: 'Remplacement plaquettes de frein avant', cost: 280, mileageAt: 1200, doneDate: daysAgo(15), nextDueDate: daysFromNow(180), provider: 'Garage Premium Carthage' },
  ];

  for (const m of maintenanceData) {
    await prisma.maintenanceRecord.create({ data: m });
  }
  console.log(`✅ ${maintenanceData.length} maintenance records created`);

  // ─────────────────────────────────────────────────────────────────────────
  // PRICE RULES
  // ─────────────────────────────────────────────────────────────────────────

  const priceRulesData = [
    { name: 'Weekend +10%', type: PriceRuleType.WEEKEND, extraPct: 10, minDays: 1, isActive: true },
    { name: 'Long terme 7+ jours -10%', type: PriceRuleType.LONG_TERM, discountPct: 10, minDays: 7, isActive: true },
    { name: 'Long terme 15+ jours -20%', type: PriceRuleType.LONG_TERM, discountPct: 20, minDays: 15, isActive: true },
    { name: 'Long terme 30+ jours -30%', type: PriceRuleType.LONG_TERM, discountPct: 30, minDays: 30, isActive: true },
    { name: 'Saison estivale +15%', type: PriceRuleType.SEASONAL, extraPct: 15, minDays: 1, startDate: new Date('2025-06-15'), endDate: new Date('2025-09-15'), isActive: true },
    { name: 'Promo Nouvel An -15%', type: PriceRuleType.PROMO, discountPct: 15, minDays: 3, startDate: new Date('2025-12-20'), endDate: new Date('2026-01-05'), isActive: true },
    { vehicleId: vehicles[9].id, name: 'Promo Audi Q7 -10%', type: PriceRuleType.PROMO, discountPct: 10, minDays: 3, isActive: true },
  ];

  for (const rule of priceRulesData) {
    await prisma.priceRule.create({ data: rule });
  }
  console.log(`✅ ${priceRulesData.length} price rules created`);

  // ─────────────────────────────────────────────────────────────────────────
  // BOOKINGS (covering every status)
  // ─────────────────────────────────────────────────────────────────────────

  // Helper: create a booking with computed totals
  async function makeBooking(
    idx: number,
    clientId: number,
    vehicleIdx: number,
    startDaysOffset: number,
    durationDays: number,
    status: BookingStatus,
    paymentStatus: PaymentStatus,
    paymentMethod?: PaymentMethod,
    extra?: Record<string, any>,
  ) {
    const v = vehicles[vehicleIdx];
    const startDate = daysFromNow(startDaysOffset);
    const endDate = daysFromNow(startDaysOffset + durationDays);
    const dailyRate = v.dailyRate;
    const subtotal = Number(dailyRate) * durationDays;
    const discountAmount = durationDays >= 15 ? Math.round(subtotal * 0.2) : durationDays >= 7 ? Math.round(subtotal * 0.1) : 0;
    const depositAmount = Number(v.depositAmount);
    const totalAmount = subtotal - discountAmount + depositAmount;

    return prisma.booking.create({
      data: {
        bookingReference: bookingRef('BK', idx),
        clientId,
        vehicleId: v.id,
        startDate,
        endDate,
        durationDays,
        dailyRate,
        subtotal,
        discountAmount,
        depositAmount,
        totalAmount,
        status,
        paymentStatus,
        paymentMethod,
        pickupLocation: 'Aéroport Tunis-Carthage',
        returnLocation: 'Aéroport Tunis-Carthage',
        ...extra,
      },
    });
  }

  // PENDING bookings (awaiting admin confirmation)
  const b1 = await makeBooking(1, ahmed.id, 0, 3, 5, BookingStatus.PENDING, PaymentStatus.PENDING);
  const b2 = await makeBooking(2, fatma.id, 4, 7, 3, BookingStatus.PENDING, PaymentStatus.PENDING);

  // CONFIRMED bookings (admin approved, not yet active)
  const b3 = await makeBooking(3, mohamed.id, 6, 2, 7, BookingStatus.CONFIRMED, PaymentStatus.PAID, PaymentMethod.PAYMEE);
  const b4 = await makeBooking(4, ahmed.id, 2, 5, 10, BookingStatus.CONFIRMED, PaymentStatus.PAID, PaymentMethod.STRIPE);

  // ACTIVE bookings (currently rented)
  const b5 = await makeBooking(5, fatma.id, 3, -2, 5, BookingStatus.ACTIVE, PaymentStatus.PAID, PaymentMethod.PAYMEE);
  const b6 = await makeBooking(6, salma.id, 8, -1, 14, BookingStatus.ACTIVE, PaymentStatus.PAID, PaymentMethod.CASH);

  // COMPLETED bookings (past rentals)
  const b7 = await makeBooking(7, ahmed.id, 0, -30, 4, BookingStatus.COMPLETED, PaymentStatus.PAID, PaymentMethod.PAYMEE, { pickupTime: '10:00', returnTime: '17:00' });
  const b8 = await makeBooking(8, mohamed.id, 5, -20, 7, BookingStatus.COMPLETED, PaymentStatus.PAID, PaymentMethod.STRIPE, { pickupTime: '09:00', returnTime: '18:00' });
  const b9 = await makeBooking(9, fatma.id, 1, -15, 3, BookingStatus.COMPLETED, PaymentStatus.PAID, PaymentMethod.CASH, { pickupTime: '08:00', returnTime: '16:00' });
  const b10 = await makeBooking(10, ahmed.id, 9, -45, 10, BookingStatus.COMPLETED, PaymentStatus.PAID, PaymentMethod.PAYMEE, { pickupTime: '09:00', returnTime: '18:00' });

  // CANCELLED bookings
  const b11 = await makeBooking(11, youssef.id, 2, 10, 5, BookingStatus.CANCELLED, PaymentStatus.REFUNDED, PaymentMethod.PAYMEE, {
    cancelledAt: daysAgo(5),
    cancellationReason: 'Changement de programme de voyage',
  });
  const b12 = await makeBooking(12, salma.id, 7, 14, 3, BookingStatus.CANCELLED, PaymentStatus.PARTIAL, PaymentMethod.STRIPE, {
    cancelledAt: daysAgo(2),
    cancellationReason: 'Annulation tardive - frais 30% appliqués',
  });

  // NO_SHOW
  const b13 = await makeBooking(13, youssef.id, 1, -3, 2, BookingStatus.NO_SHOW, PaymentStatus.FAILED, PaymentMethod.PAYMEE, {
    adminNotes: 'Client ne s\'est pas présenté. Dépôt conservé.',
  });

  console.log('✅ 13 bookings created (all statuses covered)');

  // ─────────────────────────────────────────────────────────────────────────
  // PAYMENTS
  // ─────────────────────────────────────────────────────────────────────────

  const paymentData = [
    // Paid bookings
    { bookingId: b3.id, amount: b3.totalAmount, paymentMethod: PaymentMethod.PAYMEE, status: PaymentStatus.PAID, gatewayPaymentId: 'PAY-001-XYZ', paidAt: daysAgo(1) },
    { bookingId: b4.id, amount: b4.totalAmount, paymentMethod: PaymentMethod.STRIPE, status: PaymentStatus.PAID, gatewayPaymentId: 'STRIPE-002-ABC', paidAt: daysAgo(2) },
    { bookingId: b5.id, amount: b5.totalAmount, paymentMethod: PaymentMethod.PAYMEE, status: PaymentStatus.PAID, gatewayPaymentId: 'PAY-003-DEF', paidAt: daysAgo(3) },
    { bookingId: b6.id, amount: b6.totalAmount, paymentMethod: PaymentMethod.CASH, status: PaymentStatus.PAID, paidAt: daysAgo(2) },
    { bookingId: b7.id, amount: b7.totalAmount, paymentMethod: PaymentMethod.PAYMEE, status: PaymentStatus.PAID, gatewayPaymentId: 'PAY-004-GHI', paidAt: daysAgo(34) },
    { bookingId: b8.id, amount: b8.totalAmount, paymentMethod: PaymentMethod.STRIPE, status: PaymentStatus.PAID, gatewayPaymentId: 'STRIPE-005-JKL', paidAt: daysAgo(27) },
    { bookingId: b9.id, amount: b9.totalAmount, paymentMethod: PaymentMethod.CASH, status: PaymentStatus.PAID, paidAt: daysAgo(18) },
    { bookingId: b10.id, amount: b10.totalAmount, paymentMethod: PaymentMethod.PAYMEE, status: PaymentStatus.PAID, gatewayPaymentId: 'PAY-006-MNO', paidAt: daysAgo(55) },
    // Refunded
    { bookingId: b11.id, amount: b11.totalAmount, paymentMethod: PaymentMethod.PAYMEE, status: PaymentStatus.REFUNDED, gatewayPaymentId: 'PAY-007-PQR', paidAt: daysAgo(12), refundedAmount: b11.totalAmount, refundedAt: daysAgo(5), transactionType: TransactionType.REFUND },
    // Partial refund
    { bookingId: b12.id, amount: b12.totalAmount, paymentMethod: PaymentMethod.STRIPE, status: PaymentStatus.PARTIAL, gatewayPaymentId: 'STRIPE-008-STU', paidAt: daysAgo(10), refundedAmount: Math.round(Number(b12.totalAmount) * 0.3), refundedAt: daysAgo(2), transactionType: TransactionType.REFUND },
    // Failed
    { bookingId: b13.id, amount: b13.totalAmount, paymentMethod: PaymentMethod.PAYMEE, status: PaymentStatus.FAILED, gatewayPaymentId: 'PAY-009-VWX' },
  ];

  for (const p of paymentData) {
    await prisma.payment.create({ data: p });
  }
  console.log(`✅ ${paymentData.length} payments created`);

  // ─────────────────────────────────────────────────────────────────────────
  // REVIEWS
  // ─────────────────────────────────────────────────────────────────────────

  const reviewData = [
    { bookingId: b7.id, clientId: ahmed.id, vehicleId: vehicles[0].id, rating: 4, comment: 'Très bonne voiture économique. Parfaite pour mes déplacements à Tunis. Climatisation efficace et faible consommation.' },
    { bookingId: b8.id, clientId: mohamed.id, vehicleId: vehicles[5].id, rating: 5, comment: 'La Mercedes Classe C est exceptionnelle. Confort premium et conduite fluide. Je recommande vivement !' },
    { bookingId: b9.id, clientId: fatma.id, vehicleId: vehicles[1].id, rating: 3, comment: 'Voiture correcte pour le prix. Petit souci avec la climatisation qui mettait du temps à refroidir.' },
    { bookingId: b10.id, clientId: ahmed.id, vehicleId: vehicles[9].id, rating: 5, comment: 'L\'Audi Q7 est incroyable ! Beaucoup d\'espace pour toute la famille. Technologie de pointe et confort au top.' },
  ];

  for (const r of reviewData) {
    await prisma.review.create({ data: r });
  }
  console.log(`✅ ${reviewData.length} reviews created`);

  // ─────────────────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────

  const notificationData = [
    { userId: ahmed.id, type: 'BOOKING_CONFIRMED', title: 'Réservation confirmée', message: 'Votre réservation BK-00003 pour la Dacia Duster a été confirmée.', isRead: false },
    { userId: ahmed.id, type: 'BOOKING_REMINDER', title: 'Rappel de prise en charge', message: 'N\'oubliez pas : prise en charge de votre véhicule demain à 09:00.', isRead: false },
    { userId: ahmed.id, type: 'PAYMENT_RECEIVED', title: 'Paiement reçu', message: 'Votre paiement de 560 TND pour la réservation BK-00007 a été confirmé.', isRead: true },
    { userId: fatma.id, type: 'BOOKING_CONFIRMED', title: 'Réservation confirmée', message: 'Votre réservation BK-00005 pour la VW Golf a été confirmée.', isRead: true },
    { userId: fatma.id, type: 'REVIEW_REQUEST', title: 'Avis sur votre location', message: 'Comment s\'est passée votre location de la Fiat Punto ? Laissez un avis !', isRead: false },
    { userId: mohamed.id, type: 'BOOKING_CONFIRMED', title: 'Réservation confirmée', message: 'Votre réservation BK-00003 pour la Dacia Duster a été confirmée.', isRead: true },
    { userId: mohamed.id, type: 'PAYMENT_RECEIVED', title: 'Paiement reçu', message: 'Paiement de 1 040 TND reçu pour la Mercedes Classe C.', isRead: true },
    { userId: salma.id, type: 'EMAIL_VERIFICATION', title: 'Vérifiez votre email', message: 'Cliquez sur le lien envoyé à salma.bouazizi@email.com pour vérifier votre compte.', isRead: false },
    { userId: salma.id, type: 'BOOKING_CANCELLED', title: 'Réservation annulée', message: 'Votre réservation BK-00012 a été annulée. Un remboursement partiel sera effectué.', isRead: true },
    { userId: admin.id, type: 'NEW_BOOKING', title: 'Nouvelle réservation', message: 'Nouvelle réservation BK-00001 de Ahmed Ben Ali pour Renault Clio.', isRead: false },
    { userId: admin.id, type: 'NEW_BOOKING', title: 'Nouvelle réservation', message: 'Nouvelle réservation BK-00002 de Fatma Trabelsi pour Toyota Corolla.', isRead: false },
    { userId: admin.id, type: 'PAYMENT_ALERT', title: 'Paiement échoué', message: 'Le paiement pour la réservation BK-00013 (Youssef Hamdi) a échoué.', isRead: false },
  ];

  for (const n of notificationData) {
    await prisma.notification.create({ data: n });
  }
  console.log(`✅ ${notificationData.length} notifications created`);

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE VEHICLE STATUSES to match bookings
  // ─────────────────────────────────────────────────────────────────────────

  // Vehicles with active bookings should be RENTED
  await prisma.vehicle.update({ where: { id: vehicles[3].id }, data: { status: VehicleStatus.RENTED } }); // VW Golf - b5
  await prisma.vehicle.update({ where: { id: vehicles[8].id }, data: { status: VehicleStatus.RENTED } }); // BMW Série 5 - b6

  // One vehicle in maintenance
  await prisma.vehicle.update({ where: { id: vehicles[4].id }, data: { status: VehicleStatus.MAINTENANCE } }); // Toyota Corolla - has insurance renewal

  // One vehicle out of service
  await prisma.vehicle.update({ where: { id: vehicles[11].id }, data: { status: VehicleStatus.OUT_OF_SERVICE, isVisible: false } }); // Citroën Jumpy

  console.log('✅ Vehicle statuses updated (2 RENTED, 1 MAINTENANCE, 1 OUT_OF_SERVICE)');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:    admin@car-rental.tn / Password@123');
  console.log('   Client 1: ahmed.benali@email.com / Password@123');
  console.log('   Client 2: fatma.trabelsi@email.com / Password@123');
  console.log('   Client 3: mohamed.jendoubi@email.com / Password@123');
  console.log('   Client 4: salma.bouazizi@email.com / Password@123 (unverified email)');
  console.log('   Client 5: youssef.hamdi@email.com / Password@123 (inactive account)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());