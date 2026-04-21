# 🚗 Conception Complète — Plateforme de Location de Voitures
> **Projet :** Plateforme Web de gestion et réservation de véhicules
> **Contexte :** Agence unique · ~50 véhicules · Sans GPS
> **Stack :** Angular · NestJS · Prisma ORM · PostgreSQL
> **Paiement :** Paymee (Tunisie) + Stripe (International)
> **Version :** 2.0 — Backend NestJS

---

## 📑 Table des Matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Rôles et Acteurs](#2-rôles-et-acteurs)
3. [Architecture Système](#3-architecture-système)
4. [Structure du Projet NestJS](#4-structure-du-projet-nestjs)
5. [Schéma Prisma — Base de Données](#5-schéma-prisma--base-de-données)
6. [Modules NestJS — Implémentation](#6-modules-nestjs--implémentation)
7. [Modules Fonctionnels — Vue Globale](#7-modules-fonctionnels--vue-globale)
8. [Spécifications — Espace Client](#8-spécifications--espace-client)
9. [Spécifications — Espace Admin](#9-spécifications--espace-admin)
10. [Système de Paiement](#10-système-de-paiement)
11. [Dashboards & Statistiques](#11-dashboards--statistiques)
12. [Sécurité & Authentification](#12-sécurité--authentification)
13. [API REST — Endpoints Complets](#13-api-rest--endpoints-complets)
14. [Règles Métier](#14-règles-métier)
15. [Diagrammes de Flux](#15-diagrammes-de-flux)
16. [Estimation Budget & Planning](#16-estimation-budget--planning)

---

## 1. Vue d'ensemble du Projet

### 1.1 Objectif
Développer une plateforme web complète permettant à une agence de location de voitures (mono-site, ~50 véhicules) de :
- Présenter et louer son parc automobile en ligne
- Gérer les réservations, clients, paiements et la flotte
- Suivre les maintenances et l'état des véhicules
- Analyser les performances via un dashboard administrateur

### 1.2 Périmètre
| Inclus ✅ | Exclu ❌ |
|-----------|---------|
| Catalogue & réservation en ligne | GPS / Tracking temps réel |
| Paiement Paymee + Stripe | Application mobile native |
| Dashboard admin complet | Multi-agences |
| Gestion flotte & maintenance | Comptabilité avancée |
| Historique & contrats PDF | Marketplace tiers |
| Notifications email | SMS automatiques |

### 1.3 Contraintes Techniques
- **Responsive** : Mobile-first (breakpoints : 375px, 768px, 1024px, 1440px)
- **Performance** : Temps de chargement < 3s, pagination côté serveur
- **Sécurité** : HTTPS obligatoire, données bancaires jamais stockées côté serveur
- **Disponibilité cible** : 99.5% uptime

---

## 2. Rôles et Acteurs

### 2.1 Tableau des Rôles

| Rôle | Description | Accès |
|------|-------------|-------|
| **Visiteur** | Internaute non connecté | Catalogue, disponibilités, formulaire contact |
| **Client** | Utilisateur inscrit et connecté | Réservation, paiement, historique, profil |
| **Admin** | Gestionnaire de l'agence | Gestion complète (flotte, clients, réservations, finances) |

> **Note sur le Super Admin :** L'agence étant mono-site avec un seul propriétaire, le rôle `ADMIN` dispose de tous les droits. Pas besoin d'un Super Admin séparé. Le premier compte Admin est créé via un script de seed. Si une délégation future est nécessaire, le rôle `EMPLOYEE` peut être ajouté avec droits restreints.

### 2.2 Matrice des Permissions

| Fonctionnalité | Visiteur | Client | Admin |
|----------------|----------|--------|-------|
| Voir le catalogue | ✅ | ✅ | ✅ |
| Voir les disponibilités | ✅ | ✅ | ✅ |
| Créer un compte | ✅ | — | — |
| Faire une réservation | ❌ | ✅ | ✅ |
| Payer en ligne | ❌ | ✅ | — |
| Voir son historique | ❌ | ✅ | — |
| Annuler une réservation | ❌ | ✅* | ✅ |
| Télécharger contrat PDF | ❌ | ✅ | ✅ |
| Gérer les véhicules | ❌ | ❌ | ✅ |
| Gérer tous les clients | ❌ | ❌ | ✅ |
| Gérer toutes réservations | ❌ | ❌ | ✅ |
| Voir le dashboard | ❌ | ❌ | ✅ |
| Gérer la maintenance | ❌ | ❌ | ✅ |
| Configurer tarifs | ❌ | ❌ | ✅ |

*Annulation client possible uniquement selon politique d'annulation configurée.

---

## 3. Architecture Système

### 3.1 Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │  Reverse Proxy + SSL (Let's Encrypt)
                    │   (HTTPS)   │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐  ┌─────▼──────┐  ┌────▼────────┐
    │  Angular 17 │  │  NestJS    │  │  Static     │
    │  Frontend   │  │  API REST  │  │  Assets /   │
    │  (SPA)      │  │  (Node.js) │  │  Uploads    │
    └─────────────┘  └─────┬──────┘  └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼─────┐  ┌───▼────┐  ┌───▼──────────┐
       │ PostgreSQL │  │ Redis  │  │  Nodemailer  │
       │  (Prisma)  │  │(Cache/ │  │  SMTP Email  │
       │            │  │Session)│  │              │
       └────────────┘  └────────┘  └──────────────┘
```

### 3.2 Stack Technologique Complète

#### Backend — NestJS
```
@nestjs/core, @nestjs/common          → Framework NestJS
@nestjs/platform-express              → Adaptateur Express.js
@nestjs/config                        → Variables d'environnement (.env)
@nestjs/jwt                           → JSON Web Tokens
@nestjs/passport                      → Stratégies d'authentification
passport-jwt, passport-local          → Stratégies Passport
@nestjs/throttler                     → Rate Limiting
@nestjs/schedule                      → Tâches cron (alertes maintenance)
@nestjs/swagger                       → Documentation API auto (Swagger UI)
@nestjs/cache-manager                 → Cache Redis
prisma, @prisma/client                → ORM Prisma (migrations + queries)
class-validator, class-transformer    → Validation DTO + Transformation
bcryptjs                              → Hachage mots de passe
stripe                                → SDK Stripe officiel Node.js
nodemailer, @nestjs-modules/mailer    → Envoi emails + templates Handlebars
pdfkit ou @pdfme/generator            → Génération PDF contrats
multer, @nestjs/platform-express      → Upload fichiers (images véhicules)
sharp                                 → Optimisation et resize images
uuid                                  → Génération IDs uniques
date-fns                              → Manipulation dates
cache-manager-redis-store             → Store Redis pour cache
```

#### Frontend — Angular 17
```
@angular/core, router, forms, http   → Core framework
@angular/material                    → Composants UI Material Design
ngx-stripe                           → Intégration Stripe Elements
@ngrx/store, @ngrx/effects           → Gestion d'état globale
ngx-toastr                           → Notifications toast
chart.js + ng2-charts                → Graphiques dashboard admin
fullcalendar + @fullcalendar/angular → Calendrier disponibilité
ngx-image-cropper                    → Recadrage image avatar
jwt-decode                           → Décodage JWT côté client
date-fns ou moment.js                → Formatage dates
ngx-pagination                       → Pagination composants
```

#### Infrastructure
```
Nginx 1.25          → Reverse proxy, SSL termination, compression gzip
PostgreSQL 16       → Base de données relationnelle
Redis 7             → Cache sessions, rate limiting
Node.js 20 LTS      → Runtime NestJS
PM2                 → Process manager Node.js (auto-restart, logs)
Let's Encrypt       → Certificats SSL gratuits (via Certbot)
MinIO (optionnel)   → Stockage S3-compatible auto-hébergé pour images
```

### 3.3 Environnements

| Environnement | Usage | URL |
|---------------|-------|-----|
| **Development** | Développement local | `localhost:4200` (Angular) · `localhost:3000` (NestJS) |
| **Staging** | Tests & validation | `staging.votreagence.tn` |
| **Production** | Live | `www.votreagence.tn` |

---

## 4. Structure du Projet NestJS

### 4.1 Arborescence Complète

```
car-rental-api/
│
├── prisma/
│   ├── schema.prisma              ← Schéma base de données
│   ├── migrations/                ← Migrations générées automatiquement
│   └── seed.ts                    ← Script de seed (admin initial + données de base)
│
├── src/
│   ├── main.ts                    ← Point d'entrée, bootstrap, Swagger setup
│   ├── app.module.ts              ← Module racine
│   │
│   ├── config/
│   │   ├── database.config.ts     ← Config Prisma
│   │   ├── jwt.config.ts          ← Config JWT (secret, expiry)
│   │   ├── mail.config.ts         ← Config Nodemailer SMTP
│   │   ├── stripe.config.ts       ← Config Stripe (keys)
│   │   ├── paymee.config.ts       ← Config Paymee (vendor token)
│   │   └── storage.config.ts      ← Config upload fichiers (path, limits)
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts       ← Module Prisma (global)
│   │   └── prisma.service.ts      ← PrismaClient injectable
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   ← @CurrentUser()
│   │   │   ├── public.decorator.ts         ← @Public() (skip JWT guard)
│   │   │   └── roles.decorator.ts          ← @Roles('ADMIN')
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts           ← Guard JWT global
│   │   │   └── roles.guard.ts              ← Guard vérification rôle
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts    ← Filtre erreurs global
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts    ← Standardise format réponses
│   │   │   └── logging.interceptor.ts      ← Log requêtes/réponses
│   │   ├── pipes/
│   │   │   └── parse-int-optional.pipe.ts  ← Pipe conversion int optionnel
│   │   └── dto/
│   │       └── pagination.dto.ts           ← DTO pagination commun
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       ├── login.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       └── reset-password.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       ├── update-user.dto.ts
│   │       └── update-password.dto.ts
│   │
│   ├── vehicles/
│   │   ├── vehicles.module.ts
│   │   ├── vehicles.controller.ts
│   │   ├── vehicles.service.ts
│   │   └── dto/
│   │       ├── create-vehicle.dto.ts
│   │       ├── update-vehicle.dto.ts
│   │       ├── filter-vehicles.dto.ts
│   │       └── update-status.dto.ts
│   │
│   ├── bookings/
│   │   ├── bookings.module.ts
│   │   ├── bookings.controller.ts
│   │   ├── bookings.service.ts
│   │   └── dto/
│   │       ├── create-booking.dto.ts
│   │       ├── update-booking.dto.ts
│   │       └── filter-bookings.dto.ts
│   │
│   ├── payments/
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── paymee/
│   │   │   ├── paymee.service.ts
│   │   │   └── dto/paymee-initiate.dto.ts
│   │   ├── stripe/
│   │   │   ├── stripe.service.ts
│   │   │   └── dto/stripe-intent.dto.ts
│   │   └── webhooks/
│   │       └── webhooks.controller.ts
│   │
│   ├── maintenance/
│   │   ├── maintenance.module.ts
│   │   ├── maintenance.controller.ts
│   │   ├── maintenance.service.ts
│   │   └── dto/
│   │       ├── create-maintenance.dto.ts
│   │       └── update-maintenance.dto.ts
│   │
│   ├── pricing/
│   │   ├── pricing.module.ts
│   │   ├── pricing.controller.ts
│   │   ├── pricing.service.ts
│   │   └── dto/
│   │       └── create-price-rule.dto.ts
│   │
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   │
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   └── notifications.service.ts
│   │
│   ├── mail/
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts
│   │   └── templates/
│   │       ├── booking-confirmed.hbs
│   │       ├── payment-success.hbs
│   │       ├── welcome.hbs
│   │       ├── reminder.hbs
│   │       └── cancellation.hbs
│   │
│   ├── pdf/
│   │   ├── pdf.module.ts
│   │   └── pdf.service.ts
│   │
│   ├── upload/
│   │   ├── upload.module.ts
│   │   └── upload.service.ts
│   │
│   └── scheduler/
│       ├── scheduler.module.ts
│       └── maintenance-alert.scheduler.ts  ← Cron alertes maintenance
│
├── uploads/                        ← Dossier images véhicules (ou MinIO)
├── .env                            ← Variables d'environnement
├── .env.example                    ← Template variables
├── nest-cli.json
├── package.json
└── tsconfig.json
```

### 4.2 Fichier `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Prefix global API
  app.setGlobalPrefix('api/v1');

  // Cookie parser (pour refresh token HttpOnly)
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec champs inconnus
      transform: true,           // Transforme automatiquement les types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtre d'erreur global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Intercepteur de transformation (format réponse uniforme)
  app.useGlobalInterceptors(new TransformInterceptor());

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('Car Rental API')
    .setDescription('API complète pour la plateforme de location de voitures')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentification & gestion compte')
    .addTag('Vehicles', 'Catalogue et gestion flotte')
    .addTag('Bookings', 'Réservations')
    .addTag('Payments', 'Paiements Paymee & Stripe')
    .addTag('Maintenance', 'Maintenance véhicules')
    .addTag('Dashboard', 'Statistiques & KPIs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application démarrée sur http://localhost:${port}`);
  logger.log(`📚 Swagger disponible sur http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 4.3 Fichier `.env`

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Base de données PostgreSQL
DATABASE_URL="postgresql://caruser:carpassword@localhost:5432/car_rental_db?schema=public"

# JWT
JWT_SECRET=votre_super_secret_jwt_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=votre_refresh_secret_different
JWT_REFRESH_EXPIRES=7d

# Email SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre_email@gmail.com
MAIL_PASSWORD=votre_app_password_gmail
MAIL_FROM="Car Rental <noreply@votreagence.tn>"

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paymee
PAYMEE_VENDOR_TOKEN=votre_vendor_token_paymee
PAYMEE_API_URL=https://app.paymee.tn/api/v2
PAYMEE_WEBHOOK_SECRET=votre_secret_hmac_paymee

# Upload fichiers
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880  # 5MB en bytes

# Redis (Cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# URLs publiques
API_URL=http://localhost:3000
APP_URL=http://localhost:4200
```

---

## 5. Schéma Prisma — Base de Données

### 5.1 Fichier `prisma/schema.prisma` Complet

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum Role {
  CLIENT
  ADMIN
}

enum VehicleCategory {
  ECONOMY
  COMPACT
  SEDAN
  SUV
  LUXURY
  VAN
}

enum FuelType {
  ESSENCE
  DIESEL
  HYBRID
  ELECTRIC
}

enum Transmission {
  MANUAL
  AUTOMATIC
}

enum VehicleStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
  OUT_OF_SERVICE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  PAID
  PARTIAL
  REFUNDED
  FAILED
}

enum PaymentMethod {
  PAYMEE
  STRIPE
  CASH
}

enum TransactionType {
  CHARGE
  REFUND
}

enum MaintenanceType {
  OIL_CHANGE
  TECHNICAL_INSPECTION
  INSURANCE
  TIRE_CHANGE
  BRAKE
  CLEANING
  ACCIDENT_REPAIR
  OTHER
}

enum PriceRuleType {
  SEASONAL
  WEEKEND
  LONG_TERM
  PROMO
}

// ─────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────

model User {
  id               Int       @id @default(autoincrement())
  email            String    @unique
  passwordHash     String    @map("password_hash")
  firstName        String    @map("first_name")
  lastName         String    @map("last_name")
  phone            String?
  cin              String?   @unique  // Carte Identité Nationale
  drivingLicense   String?   @map("driving_license")
  licenseExpiry    DateTime? @map("license_expiry")
  address          String?
  city             String?
  role             Role      @default(CLIENT)
  isActive         Boolean   @default(true) @map("is_active")
  isEmailVerified  Boolean   @default(false) @map("is_email_verified")
  avatarUrl        String?   @map("avatar_url")
  emailVerifyToken String?   @map("email_verify_token")
  resetToken       String?   @map("reset_token")
  resetTokenExpiry DateTime? @map("reset_token_expiry")
  refreshToken     String?   @map("refresh_token")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  // Relations
  bookings      Booking[]
  notifications Notification[]
  reviews       Review[]

  @@map("users")
}

model Vehicle {
  id           Int             @id @default(autoincrement())
  registration String          @unique              // Matricule
  brand        String
  model        String
  year         Int
  category     VehicleCategory
  fuelType     FuelType        @map("fuel_type")
  transmission Transmission
  seats        Int             @default(5)
  doors        Int             @default(4)
  color        String?
  mileage      Int             @default(0)
  status       VehicleStatus   @default(AVAILABLE)
  dailyRate    Decimal         @map("daily_rate") @db.Decimal(10, 3)
  depositAmount Decimal        @default(0) @map("deposit_amount") @db.Decimal(10, 3)
  description  String?         @db.Text
  features     Json?           // ["Climatisation", "Bluetooth", ...]
  mainImageUrl String?         @map("main_image_url")
  isVisible    Boolean         @default(true) @map("is_visible")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")

  // Relations
  images       VehicleImage[]
  bookings     Booking[]
  maintenance  MaintenanceRecord[]
  priceRules   PriceRule[]
  reviews      Review[]

  @@index([status])
  @@index([category])
  @@map("vehicles")
}

model VehicleImage {
  id        Int      @id @default(autoincrement())
  vehicleId Int      @map("vehicle_id")
  imageUrl  String   @map("image_url")
  altText   String?  @map("alt_text")
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  vehicle Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  @@index([vehicleId])
  @@map("vehicle_images")
}

model Booking {
  id                Int           @id @default(autoincrement())
  bookingReference  String        @unique @map("booking_reference")  // REF-2025-XXXXX
  clientId          Int           @map("client_id")
  vehicleId         Int           @map("vehicle_id")
  startDate         DateTime      @map("start_date")
  endDate           DateTime      @map("end_date")
  pickupTime        String        @default("09:00") @map("pickup_time")
  returnTime        String        @default("18:00") @map("return_time")
  durationDays      Int           @map("duration_days")
  dailyRate         Decimal       @map("daily_rate") @db.Decimal(10, 3)
  subtotal          Decimal       @db.Decimal(10, 3)
  discountAmount    Decimal       @default(0) @map("discount_amount") @db.Decimal(10, 3)
  depositAmount     Decimal       @default(0) @map("deposit_amount") @db.Decimal(10, 3)
  totalAmount       Decimal       @map("total_amount") @db.Decimal(10, 3)
  status            BookingStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING) @map("payment_status")
  paymentMethod     PaymentMethod? @map("payment_method")
  pickupLocation    String?       @map("pickup_location")
  returnLocation    String?       @map("return_location")
  notes             String?       @db.Text
  adminNotes        String?       @map("admin_notes") @db.Text
  cancelledAt       DateTime?     @map("cancelled_at")
  cancellationReason String?      @map("cancellation_reason") @db.Text
  contractPdfUrl    String?       @map("contract_pdf_url")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  // Relations
  client   User     @relation(fields: [clientId], references: [id])
  vehicle  Vehicle  @relation(fields: [vehicleId], references: [id])
  payments Payment[]
  review   Review?

  @@index([vehicleId, startDate, endDate, status])
  @@index([clientId])
  @@index([status])
  @@map("bookings")
}

model Payment {
  id               Int             @id @default(autoincrement())
  bookingId        Int             @map("booking_id")
  amount           Decimal         @db.Decimal(10, 3)
  currency         String          @default("TND")
  paymentMethod    PaymentMethod   @map("payment_method")
  status           PaymentStatus   @default(PENDING)
  gatewayPaymentId String?         @map("gateway_payment_id")  // ID Stripe / Paymee
  gatewayResponse  Json?           @map("gateway_response")     // Réponse brute gateway
  transactionType  TransactionType @default(CHARGE) @map("transaction_type")
  paidAt           DateTime?       @map("paid_at")
  createdAt        DateTime        @default(now()) @map("created_at")

  booking Booking @relation(fields: [bookingId], references: [id])

  @@index([bookingId])
  @@map("payments")
}

model MaintenanceRecord {
  id          Int             @id @default(autoincrement())
  vehicleId   Int             @map("vehicle_id")
  type        MaintenanceType
  title       String
  description String?         @db.Text
  cost        Decimal?        @db.Decimal(10, 3)
  mileageAt   Int?            @map("mileage_at")
  doneDate    DateTime?       @map("done_date")
  nextDueDate DateTime?       @map("next_due_date")
  provider    String?
  documentUrl String?         @map("document_url")
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  vehicle Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  @@index([vehicleId, nextDueDate])
  @@map("maintenance_records")
}

model PriceRule {
  id          Int           @id @default(autoincrement())
  vehicleId   Int?          @map("vehicle_id")  // null = toutes les voitures
  category    String?                            // ou par catégorie
  name        String
  type        PriceRuleType
  discountPct Decimal?      @map("discount_pct") @db.Decimal(5, 2)  // Réduction en %
  extraPct    Decimal?      @map("extra_pct") @db.Decimal(5, 2)     // Majoration en %
  minDays     Int           @default(1) @map("min_days")
  startDate   DateTime?     @map("start_date")
  endDate     DateTime?     @map("end_date")
  isActive    Boolean       @default(true) @map("is_active")
  createdAt   DateTime      @default(now()) @map("created_at")

  vehicle Vehicle? @relation(fields: [vehicleId], references: [id])

  @@map("price_rules")
}

model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  type      String                   // BOOKING_CONFIRMED, PAYMENT_SUCCESS, etc.
  title     String
  message   String   @db.Text
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}

model Review {
  id        Int      @id @default(autoincrement())
  bookingId Int      @unique @map("booking_id")
  clientId  Int      @map("client_id")
  vehicleId Int      @map("vehicle_id")
  rating    Int                       // 1 à 5
  comment   String?  @db.Text
  isVisible Boolean  @default(true) @map("is_visible")
  createdAt DateTime @default(now()) @map("created_at")

  booking Booking @relation(fields: [bookingId], references: [id])
  client  User    @relation(fields: [clientId], references: [id])
  vehicle Vehicle @relation(fields: [vehicleId], references: [id])

  @@map("reviews")
}

model AgencyConfig {
  id                  Int     @id @default(1)  // Singleton — une seule agence
  agencyName          String  @map("agency_name")
  phone               String?
  email               String?
  address             String? @db.Text
  city                String?
  logoUrl             String? @map("logo_url")
  slogan              String?
  openingHours        Json?   @map("opening_hours")   // {"Mon":{"open":"09:00","close":"18:00"},...}
  // Politique annulation
  freeCancelHours     Int     @default(48) @map("free_cancel_hours")
  cancelFee24to48     Decimal @default(30) @map("cancel_fee_24_to_48") @db.Decimal(5, 2)
  cancelFeeLess24     Decimal @default(50) @map("cancel_fee_less_24") @db.Decimal(5, 2)
  cancelFeeNoShow     Decimal @default(100) @map("cancel_fee_no_show") @db.Decimal(5, 2)
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@map("agency_config")
}
```

### 5.2 Commandes Prisma Essentielles

```bash
# Initialiser Prisma dans le projet
npx prisma init

# Générer le client Prisma (après modification schema.prisma)
npx prisma generate

# Créer et appliquer une migration (en développement)
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production (sans recréer)
npx prisma migrate deploy

# Visualiser la base de données (Prisma Studio)
npx prisma studio

# Lancer le seed
npx prisma db seed

# Réinitialiser la BDD (développement uniquement — DANGER en prod)
npx prisma migrate reset
```

### 5.3 Script de Seed `prisma/seed.ts`

```typescript
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Lancement du seed...');

  // ── Créer compte Admin initial ──
  const adminPassword = await bcrypt.hash('Admin@2025!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@votreagence.tn' },
    update: {},
    create: {
      email: 'admin@votreagence.tn',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Agence',
      phone: '+21620000000',
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin créé : ${admin.email}`);

  // ── Configuration agence ──
  await prisma.agencyConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      agencyName: 'AutoLocation Tunisie',
      phone: '+21620000000',
      email: 'contact@votreagence.tn',
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
  console.log('✅ Configuration agence créée');

  // ── Véhicules de démonstration ──
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
      create: { ...v, dailyRate: v.dailyRate, depositAmount: v.depositAmount },
    });
  }
  console.log(`✅ ${vehicles.length} véhicules de démonstration créés`);

  console.log('🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

---

## 6. Modules NestJS — Implémentation

### 6.1 Module Prisma (Global)

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // Disponible dans tous les modules sans ré-importer
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

### 6.2 Module Auth

#### `auth/dto/register.dto.ts`
```typescript
import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ben Ali' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ahmed@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+21620123456', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiProperty({ example: 'TU-987654', required: false })
  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @ApiProperty({ example: '2028-06-15', required: false })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;
}
```

#### `auth/auth.service.ts`
```typescript
import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifier si email existe déjà
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const emailVerifyToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: undefined,
        passwordHash,
        emailVerifyToken,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    await this.mailService.sendWelcome(user.email, user.firstName, emailVerifyToken);
    return { message: 'Compte créé. Veuillez vérifier votre email.', user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Token invalide');
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) throw new BadRequestException('Token invalide');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });
    return { message: 'Email vérifié avec succès' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si cet email existe, un lien a été envoyé' }; // Sécurité

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: expiry },
    });

    await this.mailService.sendPasswordReset(user.email, user.firstName, resetToken);
    return { message: 'Lien de réinitialisation envoyé' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
    });
    if (!user) throw new BadRequestException('Token invalide ou expiré');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null, refreshToken: null },
    });
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
```

---

### 6.3 Module Vehicles

#### `vehicles/dto/create-vehicle.dto.ts`
```typescript
import {
  IsString, IsInt, IsEnum, IsNumber, IsOptional,
  IsBoolean, IsArray, Min, Max,
} from 'class-validator';
import { VehicleCategory, FuelType, Transmission } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'AB-123-TU' })
  @IsString()
  registration: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @ApiProperty({ enum: FuelType })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ enum: Transmission })
  @IsEnum(Transmission)
  transmission: Transmission;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(2)
  @Max(9)
  seats: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  doors: number;

  @ApiProperty({ example: 'Blanc', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @IsInt()
  mileage?: number;

  @ApiProperty({ example: 120.000 })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiProperty({ example: 200.000, required: false })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['Climatisation', 'Bluetooth'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
```

#### `vehicles/vehicles.service.ts`
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehiclesDto } from './dto/filter-vehicles.dto';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: FilterVehiclesDto) {
    const {
      page = 1, limit = 12, category, fuelType, transmission,
      minPrice, maxPrice, minSeats, startDate, endDate, sortBy,
    } = filters;

    const skip = (page - 1) * limit;

    // Construire la condition WHERE
    const where: any = {
      isVisible: true,
      status: { not: VehicleStatus.OUT_OF_SERVICE },
    };

    if (category) where.category = category;
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (minSeats) where.seats = { gte: minSeats };
    if (minPrice || maxPrice) {
      where.dailyRate = {};
      if (minPrice) where.dailyRate.gte = minPrice;
      if (maxPrice) where.dailyRate.lte = maxPrice;
    }

    // Exclure les véhicules non disponibles pour les dates demandées
    if (startDate && endDate) {
      where.AND = [
        {
          status: { not: VehicleStatus.MAINTENANCE },
        },
        {
          bookings: {
            none: {
              status: { in: ['CONFIRMED', 'ACTIVE'] },
              startDate: { lt: new Date(endDate) },
              endDate: { gt: new Date(startDate) },
            },
          },
        },
      ];
    }

    // Tri
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { dailyRate: 'asc' };
    if (sortBy === 'price_desc') orderBy = { dailyRate: 'desc' };

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          reviews: { select: { rating: true } },
          _count: { select: { bookings: true } },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    // Calculer note moyenne
    const vehiclesWithRating = vehicles.map((v) => ({
      ...v,
      averageRating:
        v.reviews.length > 0
          ? v.reviews.reduce((sum, r) => sum + r.rating, 0) / v.reviews.length
          : null,
    }));

    return {
      data: vehiclesWithRating,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isVisible: true },
          include: { client: { select: { firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        priceRules: { where: { isActive: true } },
      },
    });

    if (!vehicle) throw new NotFoundException(`Véhicule #${id} introuvable`);
    return vehicle;
  }

  async getAvailability(vehicleId: number, year: number, month: number) {
    // Retourne les dates bloquées pour le calendrier
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
      },
      select: { startDate: true, endDate: true },
    });

    const maintenance = await this.prisma.maintenanceRecord.findMany({
      where: {
        vehicleId,
        doneDate: { lte: endOfMonth },
        nextDueDate: { gte: startOfMonth },
      },
      select: { doneDate: true, nextDueDate: true },
    });

    return { bookedPeriods: bookings, maintenancePeriods: maintenance };
  }

  async create(dto: CreateVehicleDto) {
    const exists = await this.prisma.vehicle.findUnique({
      where: { registration: dto.registration },
    });
    if (exists) throw new ConflictException(`Matricule ${dto.registration} déjà enregistré`);

    return this.prisma.vehicle.create({ data: dto });
  }

  async update(id: number, dto: UpdateVehicleDto) {
    await this.findOne(id);
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async updateStatus(id: number, status: VehicleStatus) {
    await this.findOne(id);
    return this.prisma.vehicle.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }

  async addImage(vehicleId: number, imageUrl: string, altText?: string) {
    const lastImage = await this.prisma.vehicleImage.findFirst({
      where: { vehicleId },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    return this.prisma.vehicleImage.create({
      data: { vehicleId, imageUrl, altText, sortOrder },
    });
  }

  async removeImage(vehicleId: number, imageId: number) {
    return this.prisma.vehicleImage.delete({
      where: { id: imageId, vehicleId },
    });
  }
}
```

---

### 6.4 Module Bookings

#### `bookings/bookings.service.ts`
```typescript
import {
  Injectable, NotFoundException, BadRequestException,
  ConflictException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, VehicleStatus } from '@prisma/client';
import { differenceInDays, isAfter, isBefore } from 'date-fns';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private pdfService: PdfService,
  ) {}

  private generateReference(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `REF-${year}-${random}`;
  }

  private async checkAvailability(vehicleId: number, startDate: Date, endDate: Date, excludeBookingId?: number) {
    const where: any = {
      vehicleId,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    };
    if (excludeBookingId) where.id = { not: excludeBookingId };

    const conflict = await this.prisma.booking.findFirst({ where });
    if (conflict) throw new ConflictException('Ce véhicule est déjà réservé pour ces dates');

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable');
    if (vehicle.status === VehicleStatus.MAINTENANCE || vehicle.status === VehicleStatus.OUT_OF_SERVICE) {
      throw new BadRequestException('Ce véhicule n\'est pas disponible actuellement');
    }

    return vehicle;
  }

  private async calculatePrice(vehicle: any, durationDays: number, startDate: Date) {
    const priceRules = await this.prisma.priceRule.findMany({
      where: {
        isActive: true,
        OR: [{ vehicleId: vehicle.id }, { vehicleId: null }],
      },
    });

    let appliedDiscountPct = 0;
    let appliedExtraPct = 0;

    for (const rule of priceRules) {
      if (rule.minDays && durationDays < rule.minDays) continue;
      if (rule.startDate && isBefore(startDate, rule.startDate)) continue;
      if (rule.endDate && isAfter(startDate, rule.endDate)) continue;

      if (rule.discountPct) appliedDiscountPct = Math.max(appliedDiscountPct, Number(rule.discountPct));
      if (rule.extraPct) appliedExtraPct = Math.max(appliedExtraPct, Number(rule.extraPct));
    }

    const baseDaily = Number(vehicle.dailyRate);
    const adjustedDaily = baseDaily * (1 + appliedExtraPct / 100) * (1 - appliedDiscountPct / 100);
    const subtotal = adjustedDaily * durationDays;
    const discountAmount = (baseDaily * durationDays) - subtotal;

    return {
      dailyRate: adjustedDaily,
      subtotal: parseFloat(subtotal.toFixed(3)),
      discountAmount: parseFloat(discountAmount.toFixed(3)),
      depositAmount: Number(vehicle.depositAmount),
      totalAmount: parseFloat((subtotal + Number(vehicle.depositAmount)).toFixed(3)),
    };
  }

  async create(clientId: number, dto: CreateBookingDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (!isAfter(endDate, startDate)) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }
    if (!isAfter(startDate, new Date())) {
      throw new BadRequestException('La date de début doit être dans le futur');
    }

    const durationDays = differenceInDays(endDate, startDate);
    if (durationDays < 1) throw new BadRequestException('Durée minimum : 1 jour');

    const vehicle = await this.checkAvailability(dto.vehicleId, startDate, endDate);
    const pricing = await this.calculatePrice(vehicle, durationDays, startDate);

    const booking = await this.prisma.booking.create({
      data: {
        bookingReference: this.generateReference(),
        clientId,
        vehicleId: dto.vehicleId,
        startDate,
        endDate,
        pickupTime: dto.pickupTime,
        returnTime: dto.returnTime,
        durationDays,
        ...pricing,
        notes: dto.notes,
      },
      include: {
        vehicle: true,
        client: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    await this.notificationsService.create({
      userId: clientId,
      type: 'BOOKING_CREATED',
      title: 'Réservation créée',
      message: `Votre réservation ${booking.bookingReference} a été créée. En attente de confirmation.`,
    });

    return booking;
  }

  async confirm(bookingId: number) {
    const booking = await this.findOne(bookingId);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Seules les réservations en attente peuvent être confirmées');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        vehicle: true,
        client: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    await this.mailService.sendBookingConfirmation(updated);
    await this.notificationsService.create({
      userId: updated.clientId,
      type: 'BOOKING_CONFIRMED',
      title: 'Réservation confirmée !',
      message: `Votre réservation ${updated.bookingReference} est confirmée.`,
    });

    return updated;
  }

  async cancel(bookingId: number, reason: string, requesterId: number, isAdmin: boolean) {
    const booking = await this.findOne(bookingId);

    if (!isAdmin && booking.clientId !== requesterId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à annuler cette réservation');
    }
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw new BadRequestException('Cette réservation ne peut plus être annulée');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    await this.mailService.sendCancellationNotice(booking);
    return updated;
  }

  async getContractPdf(bookingId: number, userId: number, isAdmin: boolean) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: true,
        client: true,
      },
    });

    if (!booking) throw new NotFoundException('Réservation introuvable');
    if (!isAdmin && booking.clientId !== userId) throw new ForbiddenException();

    return this.pdfService.generateContract(booking);
  }

  async findAll(filters: any) {
    const { page = 1, limit = 20, status, clientId, vehicleId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (startDate) where.startDate = { gte: new Date(startDate) };
    if (endDate) where.endDate = { lte: new Date(endDate) };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { firstName: true, lastName: true, email: true, phone: true } },
          vehicle: { select: { brand: true, model: true, registration: true, mainImageUrl: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyBookings(clientId: number, filters: any) {
    return this.findAll({ ...filters, clientId });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        vehicle: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
        payments: true,
      },
    });
    if (!booking) throw new NotFoundException(`Réservation #${id} introuvable`);
    return booking;
  }
}
```

---

### 6.5 Module Dashboard

#### `dashboard/dashboard.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);
    const startLastMonth = startOfMonth(subMonths(now, 1));
    const endLastMonth = endOfMonth(subMonths(now, 1));

    const [
      revenueThisMonth,
      revenueLastMonth,
      bookingsThisMonth,
      bookingsLastMonth,
      totalVehicles,
      rentedVehicles,
      totalClients,
      newClientsThisMonth,
    ] = await Promise.all([
      // Revenus mois courant
      this.prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: startMonth, lte: endMonth } },
        _sum: { amount: true },
      }),
      // Revenus mois dernier
      this.prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: startLastMonth, lte: endLastMonth } },
        _sum: { amount: true },
      }),
      // Réservations ce mois
      this.prisma.booking.count({
        where: { createdAt: { gte: startMonth, lte: endMonth } },
      }),
      // Réservations mois dernier
      this.prisma.booking.count({
        where: { createdAt: { gte: startLastMonth, lte: endLastMonth } },
      }),
      // Total véhicules
      this.prisma.vehicle.count({ where: { isVisible: true } }),
      // Véhicules actuellement loués
      this.prisma.vehicle.count({ where: { status: 'RENTED' } }),
      // Total clients
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      // Nouveaux clients ce mois
      this.prisma.user.count({
        where: { role: 'CLIENT', createdAt: { gte: startMonth, lte: endMonth } },
      }),
    ]);

    const rev = Number(revenueThisMonth._sum.amount || 0);
    const revLast = Number(revenueLastMonth._sum.amount || 0);
    const revChange = revLast > 0 ? ((rev - revLast) / revLast) * 100 : 0;

    const bkChange = bookingsLastMonth > 0
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100 : 0;

    return {
      revenue: { value: rev, change: parseFloat(revChange.toFixed(1)) },
      bookings: { value: bookingsThisMonth, change: parseFloat(bkChange.toFixed(1)) },
      fleet: { total: totalVehicles, rented: rentedVehicles, available: totalVehicles - rentedVehicles },
      clients: { total: totalClients, newThisMonth: newClientsThisMonth },
    };
  }

  async getRevenueChart(months = 12) {
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const revenue = await this.prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
      });

      results.push({
        month: start.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: Number(revenue._sum.amount || 0),
      });
    }

    return results;
  }

  async getBookingsByStatus() {
    const groups = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return groups.map((g) => ({ status: g.status, count: g._count.status }));
  }

  async getTopVehicles(limit = 5) {
    const bookings = await this.prisma.booking.groupBy({
      by: ['vehicleId'],
      where: { status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] } },
      _count: { vehicleId: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { vehicleId: 'desc' } },
      take: limit,
    });

    const vehicleIds = bookings.map((b) => b.vehicleId);
    const vehicles = await this.prisma.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, brand: true, model: true, registration: true, mainImageUrl: true },
    });

    return bookings.map((b) => ({
      vehicle: vehicles.find((v) => v.id === b.vehicleId),
      bookingCount: b._count.vehicleId,
      totalRevenue: Number(b._sum.totalAmount || 0),
    }));
  }

  async getMaintenanceAlerts() {
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const alerts = await this.prisma.maintenanceRecord.findMany({
      where: { nextDueDate: { lte: in30Days } },
      include: {
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    return alerts.map((a) => ({
      ...a,
      urgency: a.nextDueDate && a.nextDueDate < today
        ? 'EXPIRED'
        : a.nextDueDate && a.nextDueDate < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        ? 'CRITICAL'
        : 'WARNING',
    }));
  }

  async getFleetOccupationChart(days = 30) {
    const results = [];
    const totalVehicles = await this.prisma.vehicle.count({ where: { isVisible: true } });

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const rented = await this.prisma.booking.count({
        where: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          startDate: { lte: dayEnd },
          endDate: { gte: dayStart },
        },
      });

      results.push({
        date: dayStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        rented,
        available: totalVehicles - rented,
        occupationRate: totalVehicles > 0 ? parseFloat(((rented / totalVehicles) * 100).toFixed(1)) : 0,
      });
    }

    return results;
  }
}
```

---

### 6.6 Module Scheduler (Alertes Maintenance)

```typescript
// scheduler/maintenance-alert.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MaintenanceAlertScheduler {
  private readonly logger = new Logger(MaintenanceAlertScheduler.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkMaintenanceAlerts() {
    this.logger.log('🔧 Vérification des alertes de maintenance...');

    const alertThresholds = [30, 7, 1, 0]; // jours avant échéance
    const today = new Date();

    for (const days of alertThresholds) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const dateStr = targetDate.toISOString().split('T')[0];

      const records = await this.prisma.maintenanceRecord.findMany({
        where: {
          nextDueDate: {
            gte: new Date(`${dateStr}T00:00:00`),
            lt: new Date(`${dateStr}T23:59:59`),
          },
        },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
      });

      for (const record of records) {
        const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!admin) continue;

        const label = days === 0 ? 'EXPIRÉE AUJOURD\'HUI' : `dans ${days} jour(s)`;
        const urgency = days === 0 ? '🔴' : days <= 7 ? '🟠' : '🟡';

        await this.notifications.create({
          userId: admin.id,
          type: 'MAINTENANCE_ALERT',
          title: `${urgency} Maintenance ${label}`,
          message: `${record.type} — ${record.vehicle.brand} ${record.vehicle.model} (${record.vehicle.registration}) : ${record.title}`,
        });
      }
    }

    this.logger.log('✅ Vérification alertes terminée');
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendBookingReminders() {
    this.logger.log('📅 Envoi rappels réservations J-1...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: {
          gte: new Date(`${tomorrowStr}T00:00:00`),
          lt: new Date(`${tomorrowStr}T23:59:59`),
        },
      },
      include: {
        client: { select: { firstName: true, email: true } },
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
    });

    for (const booking of bookings) {
      await this.mailService.sendBookingReminder(booking);
      this.logger.log(`📧 Rappel envoyé à ${booking.client.email} pour ${booking.bookingReference}`);
    }
  }
}
```

---

## 7. Modules Fonctionnels — Vue Globale

```
PLATEFORME LOCATION VOITURES
│
├── 🌐 MODULE PUBLIC (Visiteur)
│   ├── Page d'accueil
│   ├── Catalogue & Recherche (filtres avancés)
│   ├── Fiche véhicule (galerie, équipements, tarifs)
│   ├── Vérification disponibilité (calendrier)
│   ├── Inscription / Connexion / Mot de passe oublié
│   └── Page Contact
│
├── 👤 MODULE CLIENT (Authentifié)
│   ├── Processus de réservation (tunnel 4 étapes)
│   ├── Paiement en ligne (Paymee / Stripe)
│   ├── Mon espace personnel
│   │   ├── Profil & Documents
│   │   ├── Mes réservations (toutes / filtres)
│   │   ├── Historique paiements
│   │   └── Téléchargement contrats PDF
│   └── Centre de notifications
│
└── 🔧 MODULE ADMIN
    ├── Dashboard & KPIs (graphiques temps réel)
    ├── Gestion Flotte
    │   ├── CRUD véhicules + galerie photos
    │   ├── Statuts (Disponible / Loué / Maintenance / HS)
    │   └── Calendrier d'occupation
    ├── Gestion Réservations
    │   ├── Liste & filtres avancés
    │   ├── Création manuelle (téléphone / présence)
    │   ├── Validation / Modification / Annulation
    │   └── Génération contrats PDF
    ├── Gestion Clients
    │   ├── Liste, recherche, fiche détaillée
    │   └── Activation / Blocage
    ├── Gestion Paiements
    │   ├── Suivi transactions (Paymee + Stripe + Espèces)
    │   └── Remboursements partiels ou totaux
    ├── Maintenance Flotte
    │   ├── Historique par véhicule
    │   ├── Alertes échéances (30j / 7j / 1j)
    │   └── Suivi des coûts
    ├── Tarification
    │   ├── Grille tarifaire par véhicule
    │   └── Règles (saison / weekend / durée / promo)
    └── Configuration Agence
        ├── Infos, logo, horaires
        ├── Politique d'annulation (configurable)
        └── Templates email
```

---

## 8. Spécifications — Espace Client

### 8.1 Page d'Accueil (Visiteur)

**Composants :**
- **Hero Section** : Slogan + Formulaire de recherche rapide (date début, date fin)
- **Compteurs animés** : Nb véhicules, années d'expérience, clients satisfaits
- **Catégories Populaires** : Économique, Berline, SUV, Luxe — avec prix à partir de
- **Véhicules Vedettes** : Carrousel des 6 meilleurs véhicules
- **Comment ça marche** : 3 étapes visuelles (Choisir → Réserver → Profiter)
- **Témoignages** : Avis clients (si module reviews activé)
- **Footer** : Contact, liens légaux, réseaux sociaux, horaires agence

---

### 8.2 Catalogue & Recherche

#### Filtres disponibles
```
┌─────────────────────────────────────────────────────────┐
│ FILTRES                                                 │
├─────────────────────────────────────────────────────────┤
│ 📅 Dates          [Date début] → [Date fin]             │
│ 🚗 Catégorie      [ ] Économique  [ ] Berline           │
│                   [ ] SUV        [ ] Luxe               │
│                   [ ] Van                               │
│ ⛽ Carburant      [ ] Essence  [ ] Diesel               │
│                   [ ] Hybride  [ ] Électrique           │
│ ⚙️  Transmission  ◉ Toutes  ○ Manuelle  ○ Automatique   │
│ 💺 Places         [Min] — [Max]                         │
│ 💰 Prix/jour      ────●──────────── 0 — 500 TND         │
│ ✨ Options        [ ] Climatisation  [ ] Bluetooth       │
│                   [ ] Caméra recul  [ ] Toit ouvrant    │
├─────────────────────────────────────────────────────────┤
│ [ Réinitialiser ]              [ Appliquer (12) ]       │
└─────────────────────────────────────────────────────────┘
```

**Tri :** Prix croissant/décroissant, Nouveautés, Plus réservées, Note clients
**Affichage :** Vue Grille (3 col. desktop / 2 tablette / 1 mobile) · Vue Liste · Pagination 12/page

---

### 8.3 Processus de Réservation (Tunnel 4 Étapes)

#### Étape 1 — Sélection dates & vérification disponibilité
- Calendrier visuel avec jours bloqués (grisés)
- Calcul automatique du prix total en temps réel

#### Étape 2 — Informations client
```
Si non connecté → Connexion / Inscription obligatoire

Formulaire (pré-rempli si connecté) :
- Prénom ✱, Nom ✱
- Email ✱, Téléphone ✱
- Numéro CIN ✱
- Numéro permis de conduire ✱
- Date expiration permis ✱
- Notes spéciales (optionnel)
```

#### Étape 3 — Récapitulatif & Paiement
```
┌─────────────────────────────────────────────────────┐
│ RÉCAPITULATIF                                       │
│ 🚗 Toyota Corolla 2023                              │
│ 📅 15 jan → 20 jan (5 jours)                       │
│ 💰 110 TND × 5 jours = 550 TND                     │
│ 🔒 Caution = 200 TND (remboursée au retour)        │
│ TOTAL : 750 TND                                    │
├─────────────────────────────────────────────────────┤
│ MODE DE PAIEMENT                                    │
│ 🇹🇳 ◉ Carte bancaire tunisienne (Paymee)            │
│ 🌍 ○ Carte internationale (Stripe)                  │
│ [Payer avec Paymee]  ou  [Payer avec Stripe]       │
│ 🔒 Paiement 100% sécurisé · Visa · Mastercard      │
└─────────────────────────────────────────────────────┘
```

#### Étape 4 — Confirmation
- Page succès avec numéro de réservation
- Email de confirmation automatique avec contrat PDF
- Redirection vers "Mes réservations"

---

### 8.4 Espace Client — Mon Compte

**Dashboard Client :** Prochaine réservation, compteurs rapides
**Mes Réservations :** Tableau filtrable · Actions : Voir / Télécharger PDF / Annuler / Avis
**Mon Profil :** Modifier infos, changer mot de passe, upload avatar, documents (CIN/permis)
**Notifications :** Liste chronologique, marquer comme lu

---

## 9. Spécifications — Espace Admin

### 9.1 Layout Admin
```
┌─────────────────────────────────────────────────────────────────┐
│  🚗 CarRental Admin              [🔔 3]  [Admin ▼]  [Déco.]    │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│  📊 Dashboard│                CONTENU PRINCIPAL                 │
│  🚗 Flotte   │                                                   │
│  📅 Réservat.│                                                   │
│  👥 Clients  │                                                   │
│  💳 Paiement │                                                   │
│  🔧 Mainten. │                                                   │
│  💰 Tarifs   │                                                   │
│  ⚙️  Config   │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

### 9.2 Dashboard Admin

#### KPI Cards
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Revenus Mois │ │ Réservations │ │ Disponibles  │ │ Clients      │
│  12,450 TND  │ │     34       │ │  38 / 50     │ │    127       │
│  ↑ +12%      │ │  ↑ +8%      │ │ 76% dispo    │ │  ↑ +5%       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

#### Graphiques
- **Revenus mensuels** : Barres (12 derniers mois)
- **Réservations par statut** : Donut (Confirmées / En cours / Complétées / Annulées)
- **Taux d'occupation** : Ligne (30 derniers jours)
- **Top 5 véhicules** : Barres horizontales

#### Alertes du Jour
```
⚠️  ALERTES
🔴 Assurance expirée : Toyota Corolla AB-123-TU (il y a 2 jours)
🟠 Vidange dans 5 jours : Peugeot 308 CD-456-TU
🟡 Réservation en attente : REF-2024-0089 (depuis 2h)
🟢 Retour prévu aujourd'hui : Renault Clio — Client: Ahmed Ben Ali
```

#### Calendrier d'occupation
- Vue mensuelle/hebdomadaire, une ligne par véhicule
- Barres colorées : Vert (confirmé), Bleu (en cours), Gris (maintenance)

---

### 9.3 Gestion Flotte — Formulaire Véhicule (4 Onglets)

**Onglet 1 — Infos Générales :** Matricule, marque, modèle, année, couleur, catégorie, transmission, carburant, places, portes, kilométrage

**Onglet 2 — Tarification :** Prix/jour (TND), caution, remises longue durée paramétrables

**Onglet 3 — Options & Description :** Équipements (cases à cocher), description riche (éditeur WYSIWYG)

**Onglet 4 — Photos :** Zone glisser-déposer · Photo principale + galerie jusqu'à 9 photos · Réorganisation par drag-and-drop

---

### 9.4 Gestion Réservations

#### Détail Réservation Admin
```
┌─────────────────────────────────────────────────────────────┐
│ RÉSERVATION #REF-2025-0089                   [✏️ Modifier]  │
├───────────────────────┬─────────────────────────────────────┤
│ CLIENT                │ VÉHICULE                            │
│ Ahmed Ben Ali         │ Toyota Corolla 2023                 │
│ ahmed@email.com       │ AB-123-TU · Berline · Blanc        │
│ CIN: 12345678         │                                     │
│ Permis: TU-987654     │                                     │
├───────────────────────┼─────────────────────────────────────┤
│ PÉRIODE               │ FINANCIER                           │
│ 15/01 → 20/01 (5 j)  │ 5j × 110 TND = 550 TND             │
│ Pickup: 09h00         │ Caution : 200 TND                  │
│ Retour: 18h00         │ TOTAL   : 750 TND                  │
├───────────────────────┴─────────────────────────────────────┤
│ Statut: ✅ CONFIRMÉE · Paiement: 💳 PAYÉ (Paymee)          │
├─────────────────────────────────────────────────────────────┤
│ [Confirmer] [Marquer Active] [Marquer Terminée]            │
│ [Annuler] [Rembourser] [Générer Contrat PDF]               │
└─────────────────────────────────────────────────────────────┘
```

**Création Manuelle :** Sélection client (existant ou création rapide), véhicule, dates, tarif override possible, paiement espèces (CASH)

---

### 9.5 Gestion Maintenance — Alertes & Suivi

#### Vue alertes globale
```
⚠️ ÉCHÉANCES — 30 PROCHAINS JOURS
──────────────────────────────────────────────────────────────
🔴 [EXPIRÉ]   Assurance     Toyota Corolla  AB-123-TU  (-2 jours)
🟠 [5 jours]  Vidange       Peugeot 308     CD-456-TU
🟡 [12 jours] Visite Tech.  Renault Clio    GH-012-TU
🟡 [28 jours] Assurance     Dacia Duster    IJ-345-TU
```

#### Formulaire ajout maintenance
```
Véhicule ✱     : [Toyota Corolla AB-123-TU ▼]
Type ✱         : [Vidange ▼]
Titre ✱        : [___________________________________]
Date réalisée  : [📅]   Kilométrage : [__________] km
Coût           : [__________] TND
Prestataire    : [___________________________________]
Prochaine éch. : [📅]
Notes          : [Zone texte]
Document       : [📎 PDF / Image]
```

---

### 9.6 Tarification — Règles de Prix

| Nom | Type | Valeur | Période | Statut |
|-----|------|--------|---------|--------|
| Été 2025 | Saisonnière | +20% | 01/07–31/08 | ✅ Active |
| Weekend | Weekend | +10% | Sam–Dim | ✅ Active |
| Location 7j+ | Long terme | -10% | ≥7 jours | ✅ Active |
| Location 15j+ | Long terme | -20% | ≥15 jours | ✅ Active |
| Promo Janvier | Promotion | -15% | 01/01–31/01 | ⏸ Inactive |

---

## 10. Système de Paiement

### 10.1 Architecture de Paiement

```
TUNNEL DE PAIEMENT
───────────────────────────────────────────────────────
                  ┌──────────────────┐
                  │  Angular Frontend │
                  │  (Choix méthode) │
                  └────────┬─────────┘
                           │
            ┌──────────────┼──────────────┐
            │                             │
   ┌────────▼──────────┐     ┌────────────▼────────┐
   │ 🇹🇳  PAYMEE         │     │  🌍 STRIPE           │
   │ (Cartes TND)      │     │  (International)     │
   │ Redirection page  │     │  Stripe Elements     │
   │ sécurisée Paymee  │     │  (inline dans page)  │
   └────────┬──────────┘     └────────────┬────────┘
            │                             │
   ┌────────▼─────────────────────────────▼────────┐
   │              NESTJS BACKEND                   │
   │   Webhooks vérifiés → BDD → Email → Notif.   │
   └─────────────────────────────────────────────-─┘
```

### 10.2 Service Paymee

```typescript
// payments/paymee/paymee.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymeeService {
  constructor(private config: ConfigService) {}

  async initiatePayment(params: {
    amount: number;
    bookingRef: string;
    bookingId: number;
    client: { firstName: string; lastName: string; email: string; phone: string };
  }) {
    const vendorToken = this.config.get('PAYMEE_VENDOR_TOKEN');
    const apiUrl = this.config.get('PAYMEE_API_URL');
    const appUrl = this.config.get('API_URL');
    const frontUrl = this.config.get('APP_URL');

    const payload = {
      vendor: vendorToken,
      amount: parseFloat(params.amount.toFixed(3)),
      note: `Location véhicule — ${params.bookingRef}`,
      first_name: params.client.firstName,
      last_name: params.client.lastName,
      email: params.client.email,
      phone: params.client.phone?.replace('+216', '') || '',
      return_url: `${frontUrl}/booking/success?ref=${params.bookingRef}`,
      cancel_url: `${frontUrl}/booking/cancel?ref=${params.bookingRef}`,
      webhook_url: `${appUrl}/api/v1/webhooks/paymee`,
      order_id: params.bookingId.toString(),
    };

    try {
      const response = await axios.post(`${apiUrl}/payments/create`, payload, {
        headers: {
          Authorization: `Token ${vendorToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data?.data?.token) {
        throw new BadRequestException('Erreur création paiement Paymee');
      }

      return {
        token: response.data.data.token,
        paymentUrl: `https://app.paymee.tn/gateway/${response.data.data.token}`,
      };
    } catch (error) {
      throw new BadRequestException(`Paymee: ${error.message}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.config.get('PAYMEE_WEBHOOK_SECRET');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async refund(paymentToken: string, amount: number) {
    const vendorToken = this.config.get('PAYMEE_VENDOR_TOKEN');
    const apiUrl = this.config.get('PAYMEE_API_URL');

    await axios.post(
      `${apiUrl}/payments/refund`,
      { token: paymentToken, amount: parseFloat(amount.toFixed(3)) },
      { headers: { Authorization: `Token ${vendorToken}` } },
    );
  }
}
```

### 10.3 Service Stripe

```typescript
// payments/stripe/stripe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private config: ConfigService) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });
  }

  async createPaymentIntent(params: {
    amountTND: number;
    bookingRef: string;
    bookingId: number;
    clientEmail: string;
  }) {
    // Stripe ne supporte pas TND → facturation en EUR
    // Taux de change approximatif : 1 EUR ≈ 3.3 TND
    // En production: utiliser un service de taux de change en temps réel
    const EUR_RATE = 3.3;
    const amountInEurCents = Math.round((params.amountTND / EUR_RATE) * 100);

    const intent = await this.stripe.paymentIntents.create({
      amount: amountInEurCents,
      currency: 'eur',
      metadata: {
        booking_ref: params.bookingRef,
        booking_id: params.bookingId.toString(),
        amount_tnd: params.amountTND.toString(),
      },
      receipt_email: params.clientEmail,
      description: `Location véhicule — ${params.bookingRef}`,
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async refund(paymentIntentId: string, amountTND?: number) {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amountTND) {
      const EUR_RATE = 3.3;
      params.amount = Math.round((amountTND / EUR_RATE) * 100);
    }

    return this.stripe.refunds.create(params);
  }
}
```

### 10.4 Webhooks Controller

```typescript
// payments/webhooks/webhooks.controller.ts
import {
  Controller, Post, Body, Headers, RawBodyRequest,
  Req, HttpCode, Logger, BadRequestException,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PaymeeService } from '../paymee/paymee.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentsService } from '../payments.service';
import { BookingsService } from '../../bookings/bookings.service';
import { MailService } from '../../mail/mail.service';

@Controller('webhooks')
@Public()
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private paymeeService: PaymeeService,
    private stripeService: StripeService,
    private paymentsService: PaymentsService,
    private bookingsService: BookingsService,
    private mailService: MailService,
  ) {}

  @Post('paymee')
  @HttpCode(200)
  async handlePaymeeWebhook(
    @Body() body: any,
    @Headers('x-paymee-signature') signature: string,
    @Req() req: any,
  ) {
    const rawBody = JSON.stringify(body);

    if (!this.paymeeService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('⚠️ Signature Paymee invalide');
      throw new BadRequestException('Signature invalide');
    }

    this.logger.log(`📩 Webhook Paymee reçu: ${body.status} — Order: ${body.order_id}`);

    if (body.status === true || body.payment_status === 'SUCCESS') {
      await this.paymentsService.confirmByGatewayToken(body.token);
      const booking = await this.bookingsService.confirmByIdAndPay(
        parseInt(body.order_id),
        { method: 'PAYMEE', gatewayId: body.token, gatewayResponse: body },
      );
      await this.mailService.sendPaymentConfirmation(booking);
    }

    return { received: true };
  }

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: any;

    try {
      event = this.stripeService.constructWebhookEvent(req.rawBody as Buffer, signature);
    } catch (err) {
      this.logger.warn(`⚠️ Webhook Stripe invalide: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`📩 Webhook Stripe: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const bookingId = parseInt(intent.metadata.booking_id);

      await this.bookingsService.confirmByIdAndPay(bookingId, {
        method: 'STRIPE',
        gatewayId: intent.id,
        gatewayResponse: intent,
      });
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      this.logger.warn(`❌ Paiement échoué: ${intent.id}`);
      await this.paymentsService.markFailed(intent.id);
    }

    return { received: true };
  }
}
```

### 10.5 Note sur les Devises

> **⚠️ Important :** Stripe ne supporte pas le Dinar Tunisien (TND).
>
> **Solution recommandée :** Facturer en EUR avec taux de conversion affiché clairement au client. En production, utiliser une API de taux de change (ex: `exchangerate-api.com`) pour calculer le montant EUR en temps réel, et afficher les deux montants dans l'interface.
>
> **Paymee** est la solution privilégiée pour les clients tunisiens car il supporte nativement le TND avec les cartes locales tunisiennes (CIB, etc.).

---

## 11. Dashboards & Statistiques

### 11.1 KPIs Disponibles

| Catégorie | Indicateur |
|-----------|-----------|
| **Financiers** | Revenu total (jour/mois/année), revenu par véhicule, revenu par catégorie, impact annulations, montant remboursements |
| **Opérationnels** | Taux d'occupation global (%), taux par véhicule, durée moyenne location, jours de pointe, nb véhicules en maintenance |
| **Clients** | Nouveaux clients/mois, clients récurrents vs nouveaux, satisfaction moyenne, top clients |

### 11.2 Graphiques du Dashboard

| Graphique | Type | Source API |
|-----------|------|------------|
| Revenus mensuels | Barres | `GET /dashboard/revenue?months=12` |
| Réservations par statut | Donut | `GET /dashboard/bookings-by-status` |
| Taux d'occupation | Ligne | `GET /dashboard/fleet-occupation?days=30` |
| Top véhicules | Barres horizontales | `GET /dashboard/top-vehicles?limit=5` |
| Méthodes paiement | Donut | `GET /dashboard/payment-methods` |

### 11.3 Rapports Exportables

| Rapport | Format | Contenu |
|---------|--------|---------|
| Réservations période | Excel / PDF | Liste complète avec tous détails |
| Revenus mensuel | Excel | Par véhicule, par client, par méthode |
| État flotte | PDF | Statut + kilométrage + maintenance |
| Clients actifs | Excel | Liste + statistiques dépense |
| Transactions | Excel | Toutes transactions paiement |

---

## 12. Sécurité & Authentification

### 12.1 Stratégie JWT

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();
    return user; // Injecté dans req.user
  }
}
```

### 12.2 Guard JWT Global + Roles

```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('Accès refusé : rôle insuffisant');
    }
    return true;
  }
}
```

### 12.3 Mesures de Sécurité Globales

| Mesure | Implémentation NestJS |
|--------|----------------------|
| HTTPS | Nginx + Let's Encrypt |
| Mots de passe | `bcryptjs` (rounds: 12) |
| Rate Limiting | `@nestjs/throttler` — 100 req/min global · 5 tentatives login/5min |
| Validation inputs | `class-validator` + `class-transformer` (whitelist, forbidNonWhitelisted) |
| Données paiement | JAMAIS stockées — tokenisation Stripe/Paymee (PCI DSS) |
| Uploads | Validation MIME type, taille max 5MB, `sharp` pour resize |
| CORS | Whitelist explicite domaines autorisés |
| Helmet | Headers sécurité HTTP (`helmet` middleware Express) |
| Logs | Winston logger — toutes requêtes + actions admin |
| Session Admin | Déconnexion auto après 30 min (refresh token expiry) |

### 12.4 Configuration Rate Limiting

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },      // 10 req/seconde
      { name: 'medium', ttl: 60000, limit: 100 },    // 100 req/minute
      { name: 'long', ttl: 900000, limit: 500 },     // 500 req/15 minutes
    ]),
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // Appliqué globalement
  ],
})
export class AppModule {}
```

---

## 13. API REST — Endpoints Complets

### Convention de réponse (TransformInterceptor)
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 12, "total": 48, "totalPages": 4 },
  "timestamp": "2025-01-15T14:32:00.000Z"
}
```

### 13.1 Authentification `@Public()`

| Méthode | Endpoint | Corps | Description |
|---------|----------|-------|-------------|
| `POST` | `/api/v1/auth/register` | `RegisterDto` | Inscription client |
| `POST` | `/api/v1/auth/login` | `LoginDto` | Connexion → tokens |
| `POST` | `/api/v1/auth/refresh` | `{ refreshToken }` | Renouveler access token |
| `POST` | `/api/v1/auth/logout` | — | Invalidation refresh token |
| `GET` | `/api/v1/auth/verify-email?token=` | — | Vérification email |
| `POST` | `/api/v1/auth/forgot-password` | `{ email }` | Demande reset MDP |
| `POST` | `/api/v1/auth/reset-password` | `{ token, newPassword }` | Reset MDP |

### 13.2 Véhicules

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/v1/vehicles` | Public | Liste + filtres + pagination |
| `GET` | `/api/v1/vehicles/:id` | Public | Détail + galerie + avis |
| `GET` | `/api/v1/vehicles/:id/availability?year=&month=` | Public | Dates bloquées (calendrier) |
| `GET` | `/api/v1/vehicles/categories` | Public | Liste catégories disponibles |
| `POST` | `/api/v1/admin/vehicles` | Admin | Créer véhicule |
| `PUT` | `/api/v1/admin/vehicles/:id` | Admin | Modifier véhicule |
| `DELETE` | `/api/v1/admin/vehicles/:id` | Admin | Supprimer véhicule |
| `PATCH` | `/api/v1/admin/vehicles/:id/status` | Admin | Changer statut |
| `POST` | `/api/v1/admin/vehicles/:id/images` | Admin | Upload image (multipart) |
| `DELETE` | `/api/v1/admin/vehicles/:id/images/:imgId` | Admin | Supprimer image |
| `PATCH` | `/api/v1/admin/vehicles/:id/images/reorder` | Admin | Réordonner images |

### 13.3 Réservations

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/v1/bookings/my` | Client | Mes réservations (filtres) |
| `GET` | `/api/v1/bookings/my/:id` | Client | Détail ma réservation |
| `POST` | `/api/v1/bookings` | Client | Créer réservation |
| `POST` | `/api/v1/bookings/:id/cancel` | Client | Annuler ma réservation |
| `GET` | `/api/v1/bookings/:id/contract` | Client/Admin | Télécharger contrat PDF |
| `GET` | `/api/v1/admin/bookings` | Admin | Toutes réservations |
| `GET` | `/api/v1/admin/bookings/:id` | Admin | Détail réservation |
| `POST` | `/api/v1/admin/bookings` | Admin | Créer réservation manuelle |
| `PUT` | `/api/v1/admin/bookings/:id` | Admin | Modifier réservation |
| `PATCH` | `/api/v1/admin/bookings/:id/status` | Admin | Changer statut |
| `POST` | `/api/v1/admin/bookings/:id/confirm` | Admin | Confirmer réservation |

### 13.4 Paiements

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/v1/payments/paymee/initiate` | Client | Initier paiement Paymee → URL |
| `POST` | `/api/v1/payments/stripe/create-intent` | Client | Créer PaymentIntent → client_secret |
| `POST` | `/api/v1/webhooks/paymee` | Public* | Webhook Paymee (signature vérifiée) |
| `POST` | `/api/v1/webhooks/stripe` | Public* | Webhook Stripe (signature vérifiée) |
| `GET` | `/api/v1/admin/payments` | Admin | Toutes transactions |
| `GET` | `/api/v1/admin/payments/:id` | Admin | Détail transaction |
| `POST` | `/api/v1/admin/payments/:id/refund` | Admin | Rembourser (partiel/total) |

### 13.5 Profil Utilisateur

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/v1/users/me` | Client | Mon profil complet |
| `PUT` | `/api/v1/users/me` | Client | Modifier mon profil |
| `PUT` | `/api/v1/users/me/password` | Client | Changer mot de passe |
| `POST` | `/api/v1/users/me/avatar` | Client | Upload avatar |
| `GET` | `/api/v1/admin/users` | Admin | Liste tous clients |
| `GET` | `/api/v1/admin/users/:id` | Admin | Fiche client + historique |
| `PATCH` | `/api/v1/admin/users/:id/status` | Admin | Activer / Bloquer |

### 13.6 Maintenance

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/v1/admin/maintenance` | Admin | Toutes maintenances (filtres) |
| `GET` | `/api/v1/admin/maintenance/alerts` | Admin | Alertes échéances < 30 jours |
| `GET` | `/api/v1/admin/vehicles/:id/maintenance` | Admin | Historique par véhicule |
| `POST` | `/api/v1/admin/maintenance` | Admin | Ajouter entretien |
| `PUT` | `/api/v1/admin/maintenance/:id` | Admin | Modifier |
| `DELETE` | `/api/v1/admin/maintenance/:id` | Admin | Supprimer |

### 13.7 Dashboard & Stats

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/v1/admin/dashboard/kpis` | Admin | KPIs principaux + variations |
| `GET` | `/api/v1/admin/dashboard/revenue?months=12` | Admin | Revenus mensuels |
| `GET` | `/api/v1/admin/dashboard/bookings-by-status` | Admin | Distribution par statut |
| `GET` | `/api/v1/admin/dashboard/fleet-occupation?days=30` | Admin | Taux occupation |
| `GET` | `/api/v1/admin/dashboard/top-vehicles?limit=5` | Admin | Top véhicules |
| `GET` | `/api/v1/admin/dashboard/payment-methods` | Admin | Répartition méthodes paiement |
| `GET` | `/api/v1/admin/reports/bookings?from=&to=&format=excel` | Admin | Export Excel/PDF |
| `GET` | `/api/v1/admin/reports/revenue?from=&to=&format=excel` | Admin | Export revenus |

### 13.8 Notifications

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/v1/notifications` | Client/Admin | Mes notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | Client/Admin | Marquer comme lu |
| `PATCH` | `/api/v1/notifications/read-all` | Client/Admin | Tout marquer comme lu |
| `GET` | `/api/v1/notifications/unread-count` | Client/Admin | Compteur non lus |

### 13.9 Configuration Agence

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/v1/config` | Public | Config publique (nom, horaires) |
| `GET` | `/api/v1/admin/config` | Admin | Config complète |
| `PUT` | `/api/v1/admin/config` | Admin | Modifier configuration |
| `GET` | `/api/v1/admin/price-rules` | Admin | Règles tarifaires |
| `POST` | `/api/v1/admin/price-rules` | Admin | Créer règle |
| `PUT` | `/api/v1/admin/price-rules/:id` | Admin | Modifier règle |
| `DELETE` | `/api/v1/admin/price-rules/:id` | Admin | Supprimer règle |

---

## 14. Règles Métier

### 14.1 Disponibilité Véhicule

```
Un véhicule est INDISPONIBLE pour une période [startDate, endDate] si :
  1. Il a une réservation status IN (CONFIRMED, ACTIVE)
     dont les dates chevauchent → startDate_résa < endDate ET endDate_résa > startDate
  2. Son status est MAINTENANCE ou OUT_OF_SERVICE

Prisma query chevauchement :
  where: {
    vehicleId,
    status: { in: ['CONFIRMED', 'ACTIVE'] },
    startDate: { lt: endDate },   // La résa commence avant la fin demandée
    endDate: { gt: startDate },   // La résa finit après le début demandé
  }
```

### 14.2 Calcul Prix

```
1. Prix de base = vehicle.dailyRate × durationDays
2. Appliquer les règles prix actives (PriceRule) :
   - Vérifier minDays, dates de validité, catégorie/véhicule
   - Prendre la remise max et la majoration max séparément
3. Prix ajusté/jour = dailyRate × (1 + extraPct/100) × (1 - discountPct/100)
4. Subtotal = Prix ajusté × durationDays
5. Discount = (dailyRate × durationDays) - subtotal
6. Total = subtotal + depositAmount
```

### 14.3 Politique d'Annulation (configurable dans AgencyConfig)

```
Défauts configurables :
  Annulation > 48h avant départ  → Remboursement 100% (0% frais)
  Annulation 24h–48h avant       → Remboursement 70% (30% pénalité)
  Annulation < 24h avant         → Remboursement 50% (50% pénalité)
  No-show                        → Remboursement 0% (100% pénalité)

Calcul frais annulation :
  hoursUntilStart = differenceInHours(startDate, now)
  if (hoursUntilStart > config.freeCancelHours) → frais = 0%
  else if (hoursUntilStart > 24) → frais = config.cancelFee24to48
  else if (hoursUntilStart > 0)  → frais = config.cancelFeeLess24
  else → frais = config.cancelFeeNoShow
```

### 14.4 Machine d'État — Statuts Réservation

```
PENDING ─────────────────────────────► CONFIRMED ──────────► ACTIVE ──────► COMPLETED
   │         (admin confirme              │                                       │
   │          ou paiement reçu)           │                                       │
   ▼                                      ▼                                       │
CANCELLED ◄─────────────────────── CANCELLED                                     │
(admin ou                                                                         │
 client avant)                                                              NO_SHOW
                                                          (si client ne se présente pas)
```

### 14.5 Notifications Automatiques

| Événement | Destinataire | Canal | Délai |
|-----------|-------------|-------|-------|
| Inscription | Client | Email | Immédiat |
| Réservation créée | Client + Admin | Email + Notif app | Immédiat |
| Paiement confirmé | Client | Email | Immédiat |
| Rappel prise en charge | Client | Email | J-1 à 10h (cron) |
| Retour prévu | Admin | Notif app | Jour J à 8h (cron) |
| Maintenance échéance | Admin | Notif app | J-30, J-7, J-1, J-0 (cron) |
| Annulation | Client + Admin | Email + Notif app | Immédiat |
| Remboursement | Client | Email | Immédiat |

---

## 15. Diagrammes de Flux

### 15.1 Flux Réservation + Paiement Complet

```
CLIENT                    NESTJS API                    GATEWAY (Paymee/Stripe)
  │                           │                                   │
  ├── GET /vehicles ──────────►│                                   │
  │◄─ Liste avec dispo ────────┤                                   │
  │                           │                                   │
  ├── GET /vehicles/:id ──────►│                                   │
  │◄─ Détail + calendrier ─────┤                                   │
  │                           │                                   │
  ├── POST /bookings ─────────►│                                   │
  │   {vehicleId, dates}      ├── Vérifier dispo Prisma           │
  │                           ├── Calculer prix (PriceRule)       │
  │                           ├── Créer Booking PENDING           │
  │◄─ booking créé ────────────┤                                   │
  │                           │                                   │
  ├── POST /payments/paymee ──►│                                   │
  │   {bookingId}             ├── PaymeeService.initiate() ───────►│
  │                           │◄─ { token, paymentUrl } ──────────┤
  │                           ├── Créer Payment PENDING           │
  │◄─ { paymentUrl } ──────────┤                                   │
  │                           │                                   │
  ├── [Redirigé vers Paymee]  │                                   │
  │   Saisit données carte    │                                   │
  │                           │◄── Webhook POST /webhooks/paymee ─┤
  │                           ├── Vérifier signature HMAC         │
  │                           ├── Payment → PAID                  │
  │                           ├── Booking → CONFIRMED             │
  │                           ├── Véhicule → RENTED              │
  │                           ├── Email confirmation ─────────────►► Client
  │                           ├── Notification app                │
  │                           ├── Générer PDF contrat             │
  │◄─── Redirect /success ─────┤                                   │
```

### 15.2 Flux Maintenance & Alertes

```
CRON JOB (08:00 chaque jour)
  │
  ├── Requête Prisma : maintenanceRecords où nextDueDate ≤ aujourd'hui + 30j
  │
  ├── Pour chaque record trouvé :
  │   ├── Calculer urgence (EXPIRED / CRITICAL / WARNING)
  │   ├── Créer Notification → Admin
  │   └── [Si EXPIRED] → Envoyer email admin
  │
  └── ADMIN reçoit badge 🔔 dans l'interface
       │
       ├── Consulte liste alertes maintenance
       ├── Effectue l'entretien (ou le planifie)
       ├── POST /admin/maintenance
       │   ├── Créer MaintenanceRecord
       │   ├── Mettre à jour nextDueDate
       │   └── [Si en cours] → Véhicule.status = MAINTENANCE
       │
       └── Terminé → Véhicule.status = AVAILABLE
```

---

## 16. Estimation Budget & Planning

### 16.1 Budget de Développement

#### Version Complète (toutes fonctionnalités décrites)

| Poste | Estimation (USD) |
|-------|------------------|
| Backend NestJS + Prisma (API complète) | 1,200 – 1,300 |
| Frontend Angular (client + admin) | 1,100 – 1,200 |
| Intégrations paiement (Paymee + Stripe) | 450 – 500 |
| Génération PDF contrats | 150 – 200 |
| Module notifications + emails | 150 – 200 |
| Tests & débogage | 300 – 350 |
| Déploiement initial + configuration | 150 – 200 |
| **TOTAL DÉVELOPPEMENT** | **3,500 – 3,950 USD** |

#### Version MVP Réduit *(démarrer vite)*

*Sans règles tarifaires avancées, sans rapports Excel, sans graphiques complexes*

| Poste | Estimation (USD) |
|-------|------------------|
| Backend NestJS simplifié | 900 – 1,200 |
| Frontend essentiel | 800 – 1,100 |
| Intégration Paymee uniquement | 300 – 400 |
| **TOTAL MVP** | **2,000 – 2,700 USD** |

### 16.2 Coûts Récurrents Mensuels

| Service | Coût |
|---------|------|
| VPS (4GB RAM, 80GB SSD, Ubuntu 22) | 60 – 120 TND/mois |
| Nom de domaine `.tn` | 30 – 50 TND/an |
| SSL Let's Encrypt | Gratuit |
| Paymee | Commission 1.5% – 2.5%/transaction |
| Stripe | Commission 1.4% + 0.25€ (cartes EU) |
| SMTP (Gmail App Password ou Mailtrap) | 0 – 30 TND/mois |
| **TOTAL MENSUEL** | **~80 – 150 TND/mois** |

### 16.3 Packages npm — Installation Complète

```bash
# Créer le projet NestJS
npm i -g @nestjs/cli
nest new car-rental-api

# ORM & Base de données
npm install prisma @prisma/client
npm install -D prisma

# Authentification
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install bcryptjs
npm install -D @types/bcryptjs @types/passport-jwt @types/passport-local

# Validation & Transformation
npm install class-validator class-transformer

# Configuration
npm install @nestjs/config

# Paiements
npm install stripe
npm install axios  # Pour appels Paymee REST

# Email
npm install @nestjs-modules/mailer nodemailer handlebars
npm install -D @types/nodemailer

# PDF
npm install pdfkit
npm install -D @types/pdfkit

# Upload & Images
npm install multer sharp uuid
npm install -D @types/multer @types/sharp @types/uuid

# Cache & Rate limiting
npm install @nestjs/cache-manager cache-manager
npm install @nestjs/throttler

# Tâches planifiées
npm install @nestjs/schedule
npm install -D @types/cron

# Sécurité
npm install helmet cookie-parser
npm install -D @types/cookie-parser

# Documentation
npm install @nestjs/swagger swagger-ui-express

# Utilitaires dates
npm install date-fns

# Swagger & Dev
npm install -D @nestjs/testing jest @types/jest ts-jest
```

### 16.4 Planning de Développement (6 Sprints)

```
SPRINT 1 — Semaines 1–2 : Fondations Backend
├── Setup NestJS + Prisma + PostgreSQL
├── Schéma Prisma + migrations + seed
├── Module Auth (JWT, register, login, refresh)
├── Module Vehicles (CRUD + filtres + upload images)
└── Tests unitaires Auth & Vehicles

SPRINT 2 — Semaines 3–4 : Réservations & Calcul Prix
├── Module Bookings (création, disponibilité, calcul prix)
├── Module PriceRules (règles tarifaires)
├── Génération PDF contrats (PDFKit)
├── Module Mail (templates Handlebars)
└── Tests réservations

SPRINT 3 — Semaines 5–6 : Paiements
├── Intégration Paymee (initiation + webhook)
├── Intégration Stripe (PaymentIntent + webhook)
├── Module Refunds (remboursements)
├── Tests paiements (sandbox)
└── Sécurité webhooks (signatures)

SPRINT 4 — Semaines 7–8 : Frontend Client
├── Setup Angular 17 + NgRx + Material
├── Catalogue + filtres + fiche véhicule
├── Tunnel de réservation (4 étapes)
├── Espace client (profil, réservations, historique)
└── Intégration Paymee & Stripe Frontend

SPRINT 5 — Semaines 9–10 : Frontend Admin
├── Dashboard + graphiques (Chart.js)
├── Gestion flotte (CRUD + galerie drag-and-drop)
├── Gestion réservations + clients + paiements
├── Module maintenance + alertes
└── Configuration agence

SPRINT 6 — Semaines 11–12 : Finalisation
├── Scheduler cron (alertes maintenance + rappels)
├── Tests E2E (Cypress)
├── Audit sécurité (OWASP)
├── Optimisation performances (cache Redis)
├── Documentation API Swagger
└── Déploiement production (VPS + Nginx + PM2)

DURÉE TOTALE : 12 semaines (~3 mois)
```

### 16.5 Technologies 100% Open Source (Coût = 0€)

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Runtime backend | Node.js | 20 LTS |
| Framework backend | NestJS | 10.x |
| ORM | Prisma | 5.x |
| Base de données | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Serveur web | Nginx | 1.25 |
| SSL | Let's Encrypt (Certbot) | — |
| PDF | PDFKit | 0.15 |
| Emails | Nodemailer + Handlebars | — |
| Process manager | PM2 | — |
| Tests | Jest (unit) + Cypress (E2E) | — |
| Doc API | Swagger UI (NestJS intégré) | — |

---

## ✅ Checklist Finale Avant Lancement

### Backend NestJS
- [ ] Toutes les routes documentées dans Swagger (`/api/docs`)
- [ ] Validation DTO activée globalement (whitelist, transform)
- [ ] Rate limiting configuré sur login et endpoints sensibles
- [ ] Variables d'environnement séparées `.env.development` / `.env.production`
- [ ] Migrations Prisma appliquées en production avec `prisma migrate deploy`
- [ ] Seed initial exécuté (compte admin + config agence)
- [ ] Logs Winston configurés avec rotation quotidienne

### Paiements
- [ ] Tests Paymee en mode sandbox → tous scénarios validés
- [ ] Tests Stripe avec cartes de test (`4242 4242 4242 4242`)
- [ ] Webhooks configurés sur dashboard Paymee & Stripe
- [ ] Signatures HMAC vérifiées sur chaque webhook
- [ ] Tests remboursements (partiel + total)
- [ ] Aucune donnée de carte stockée en BDD

### Sécurité
- [ ] HTTPS configuré (Nginx + Let's Encrypt)
- [ ] Headers sécurité Helmet activés
- [ ] CORS whitelist uniquement domaines de production
- [ ] Backup PostgreSQL automatique quotidien (cron + pg_dump)
- [ ] Rate limiting testé (anti-brute force login)

### Frontend & UX
- [ ] Responsive testé (iPhone SE, Android, tablette, 1080p, 1440p)
- [ ] Temps de chargement < 3s (Lighthouse ≥ 90)
- [ ] Emails de confirmation testés (desktop + mobile Gmail/Outlook)
- [ ] Contrats PDF générés et lisibles
- [ ] Formulaires avec messages d'erreur clairs
- [ ] Gestion état chargement (spinners, skeletons)

### Production
- [ ] Domaine .tn configuré + DNS pointant vers VPS
- [ ] Compte Paymee de production activé (vérification KYB)
- [ ] Compte Stripe de production activé
- [ ] PM2 configuré avec auto-restart + logs
- [ ] Monitoring uptime configuré (UptimeRobot gratuit)
- [ ] Procédure de rollback documentée

---

*Document de conception v2.0 — Plateforme Location Voitures*
*Backend : NestJS 10 · ORM : Prisma 5 · Base de données : PostgreSQL 16*
*Frontend : Angular 17 · Paiement : Paymee (TND) + Stripe (International)*
