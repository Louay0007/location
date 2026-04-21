# 🚗 Car Rental Platform - Backend API

> **Version:** 2.0  
> **Stack:** NestJS 10 · Prisma 5 · PostgreSQL 16 · Node.js 20  
> **Payment:** Paymee (Tunisie) + Stripe (International)

A complete backend API for a car rental management platform with online booking, payment integration, fleet management, and administrative dashboard.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Getting Started](#5-getting-started)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Authentication](#8-authentication)
9. [Payment Integration](#9-payment-integration)
10. [Scheduled Tasks](#10-scheduled-tasks)
11. [Environment Variables](#11-environment-variables)
12. [Available Scripts](#12-available-scripts)
13. [API Documentation](#13-api-documentation)

---

## 1. Project Overview

This is a complete backend API for a single-agency car rental platform (~50 vehicles) that enables:

- Online vehicle catalog with availability checking
- Real-time booking and reservation management
- Payment processing via Paymee (Tunisian cards) and Stripe (International)
- Fleet management with maintenance tracking
- Administrative dashboard with KPIs and analytics
- PDF contract generation
- Email notifications
- User authentication with JWT

---

## 2. Features

### ✅ Implemented Modules

| Module | Description |
|--------|-------------|
| **Auth** | JWT authentication, registration, login, password reset, email verification |
| **Users** | Profile management, admin user control |
| **Vehicles** | CRUD operations, availability checking, image management |
| **Bookings** | Reservation creation, confirmation, cancellation, pricing |
| **Payments** | Paymee & Stripe integration, webhooks, refunds |
| **Pricing** | Dynamic pricing rules (seasonal, weekend, long-term) |
| **Maintenance** | Vehicle maintenance records, alerts |
| **Dashboard** | KPIs, revenue charts, fleet occupancy |
| **Notifications** | In-app notification system |
| **Mail** | Email templates (welcome, confirmation, reminders) |
| **PDF** | Contract and invoice generation |
| **Upload** | Image upload with optimization |
| **Scheduler** | Automated tasks (maintenance alerts, booking reminders) |

---

## 3. Tech Stack

### Backend
```
@nestjs/core, @nestjs/common          → NestJS Framework
@nestjs/platform-express              → Express adapter
@nestjs/config                        → Environment variables
@nestjs/jwt                          → JWT tokens
@nestjs/passport                      → Authentication strategies
@nestjs/schedule                      → Cron jobs
@nestjs/swagger                       → API documentation
@nestjs/serve-static                  → Static file serving

prisma, @prisma/client              → ORM
class-validator, class-transformer    → DTO validation

bcryptjs                              → Password hashing
stripe                                → Stripe SDK
nodemailer, @nestjs-modules/mailer   → Email sending
pdfkit                                → PDF generation
sharp                                 → Image optimization
uuid                                  → Unique IDs
date-fns                              → Date manipulation
```

### Database
- **PostgreSQL 16** - Relational database
- **Prisma ORM** - Database access layer

---

## 4. Project Structure

```
car-rental-api/
├── prisma/
│   ├── schema.prisma              ← Database schema
│   ├── migrations/                ← Database migrations
│   └── seed.ts                    ← Seed data
│
├── src/
│   ├── main.ts                    ← Application entry point
│   ├── app.module.ts              ← Root module
│   │
│   ├── prisma/                    ← Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── common/                    ← Shared components
│   │   ├── decorators/          ← @CurrentUser, @Public, @Roles
│   │   ├── guards/                ← JWT & Roles guards
│   │   ├── filters/               ← HTTP exception filter
│   │   ├── interceptors/          ← Response transformation
│   │   └── dto/                  ← Pagination DTO
│   │
│   ├── auth/                     ← Authentication
│   ├── users/                    ← User management
│   ├── vehicles/                 ← Fleet management
│   ├── bookings/                 ← Reservations
│   ├── payments/                 ← Payment processing
│   │   ├── paymee/              ← Paymee service
│   │   ├── stripe/               ← Stripe service
│   │   └── webhooks/             ← Payment webhooks
│   ├── pricing/                  ← Pricing rules
│   ├── maintenance/               ← Vehicle maintenance
│   ├── dashboard/                ← Analytics & KPIs
│   ├── notifications/             ← In-app notifications
│   ├── mail/                    ← Email service
│   ├── pdf/                     ← PDF generation
│   ├── upload/                   ← File uploads
│   └── scheduler/                ← Cron jobs
│
├── uploads/                       ← Uploaded files
├── .env                          ← Environment variables
├── package.json
└── tsconfig.json
```

---

## 5. Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with initial data
npx prisma db seed

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api/docs`

---

## 6. Database Schema

### Core Models

| Model | Description |
|-------|-------------|
| **User** | Clients and administrators with authentication data |
| **Vehicle** | Cars in the fleet with specifications and pricing |
| **VehicleImage** | Multiple images per vehicle |
| **Booking** | Reservations with pricing and status |
| **Payment** | Transaction records for bookings |
| **MaintenanceRecord** | Vehicle maintenance history |
| **PriceRule** | Dynamic pricing rules |
| **Notification** | User notifications |
| **Review** | Vehicle reviews |
| **AgencyConfig** | Agency settings and cancellation policy |

### Enums

```prisma
Role { CLIENT, ADMIN }
VehicleCategory { ECONOMY, COMPACT, SEDAN, SUV, LUXURY, VAN }
FuelType { ESSENCE, DIESEL, HYBRID, ELECTRIC }
Transmission { MANUAL, AUTOMATIC }
VehicleStatus { AVAILABLE, RENTED, MAINTENANCE, OUT_OF_SERVICE }
BookingStatus { PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED, NO_SHOW }
PaymentStatus { PENDING, PAID, PARTIAL, REFUNDED, FAILED }
PaymentMethod { PAYMEE, STRIPE, CASH }
MaintenanceType { OIL_CHANGE, TECHNICAL_INSPECTION, INSURANCE, TIRE_CHANGE, BRAKE, CLEANING, ACCIDENT_REPAIR, OTHER }
```

---

## 7. API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new client |
| POST | `/api/v1/auth/login` | Login → tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/verify-email` | Verify email |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Vehicles

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/vehicles` | Public | List vehicles with filters |
| GET | `/api/v1/vehicles/:id` | Public | Vehicle details |
| GET | `/api/v1/vehicles/categories` | Public | List categories |
| GET | `/api/v1/vehicles/:id/availability` | Public | Check availability |
| POST | `/api/v1/vehicles/admin` | Admin | Create vehicle |
| PUT | `/api/v1/vehicles/admin/:id` | Admin | Update vehicle |
| DELETE | `/api/v1/vehicles/admin/:id` | Admin | Delete vehicle |
| PATCH | `/api/v1/vehicles/admin/:id/status` | Admin | Update status |

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/bookings` | Client | Create booking |
| GET | `/api/v1/bookings/my` | Client | My bookings |
| GET | `/api/v1/bookings/my/:id` | Client | Booking details |
| POST | `/api/v1/bookings/my/:id/cancel` | Client | Cancel booking |
| GET | `/api/v1/bookings/admin` | Admin | All bookings |
| POST | `/api/v1/bookings/admin/:id/confirm` | Admin | Confirm booking |
| PATCH | `/api/v1/bookings/admin/:id/status` | Admin | Update status |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/payments/paymee/initiate` | Client | Initiate Paymee payment |
| POST | `/api/v1/payments/stripe/create-intent` | Client | Create Stripe intent |
| POST | `/api/v1/webhooks/paymee` | Public | Paymee webhook |
| POST | `/api/v1/webhooks/stripe` | Public | Stripe webhook |
| GET | `/api/v1/payments/admin` | Admin | All payments |
| POST | `/api/v1/payments/admin/:id/refund` | Admin | Refund payment |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/dashboard/admin/kpis` | Admin | Main KPIs |
| GET | `/api/v1/dashboard/admin/revenue` | Admin | Revenue chart |
| GET | `/api/v1/dashboard/admin/bookings-status` | Admin | Bookings by status |
| GET | `/api/v1/dashboard/admin/fleet-occupation` | Admin | Fleet occupancy |
| GET | `/api/v1/dashboard/admin/top-vehicles` | Admin | Top vehicles |

### Maintenance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/maintenance/admin` | Admin | All records |
| GET | `/api/v1/maintenance/admin/alerts` | Admin | Upcoming alerts |
| GET | `/api/v1/maintenance/admin/vehicle/:id` | Admin | Vehicle history |
| POST | `/api/v1/maintenance/admin` | Admin | Create record |
| PUT | `/api/v1/maintenance/admin/:id` | Admin | Update record |
| DELETE | `/api/v1/maintenance/admin/:id` | Admin | Delete record |

### Pricing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/pricing/rules` | Public | Active rules |
| GET | `/api/v1/pricing/admin/rules` | Admin | All rules |
| POST | `/api/v1/pricing/admin/rules` | Admin | Create rule |
| PUT | `/api/v1/pricing/admin/rules/:id` | Admin | Update rule |
| PATCH | `/api/v1/pricing/admin/rules/:id/toggle` | Admin | Toggle rule |
| DELETE | `/api/v1/pricing/admin/rules/:id` | Admin | Delete rule |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/notifications` | Auth | My notifications |
| PATCH | `/api/v1/notifications/:id/read` | Auth | Mark as read |
| PATCH | `/api/v1/notifications/read-all` | Auth | Mark all read |
| GET | `/api/v1/notifications/unread-count` | Auth | Unread count |

### PDF

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/pdf/contract/:bookingId` | Auth | Download contract |
| GET | `/api/v1/pdf/invoice/:bookingId` | Auth | Download invoice |

### Upload

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/upload/image` | Auth | Upload single image |
| POST | `/api/v1/upload/images` | Auth | Upload multiple images |

---

## 8. Authentication

### JWT Strategy

- **Access Token**: 15 minutes expiry, stored in memory
- **Refresh Token**: 7 days expiry, stored in HttpOnly cookie
- **Password Hashing**: bcrypt with 12 rounds

### Roles

| Role | Description |
|------|-------------|
| **CLIENT** | Regular customers |
| **ADMIN** | Agency administrators |

### Guards

- `@Public()` - Skip authentication
- `@Roles('ADMIN')` - Require specific role

---

## 9. Payment Integration

### Paymee (Tunisia)

- Local payment method for Tunisian cards
- Redirect-based flow
- Webhook for payment confirmation

### Stripe (International)

- International cards support
- Stripe Elements integration
- EUR billing (TND conversion at ~3.3 rate)

### Payment Flow

```
1. Client creates booking → Status: PENDING
2. Client initiates payment → Redirect to payment gateway
3. Gateway processes payment → Webhook notification
4. Webhook confirms → Status: CONFIRMED + PAID
5. Email confirmation sent to client
```

---

## 10. Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Maintenance Alerts | Daily 8AM | Check upcoming maintenance |
| Booking Reminders | Daily 10AM | Send reminders for next-day pickups |
| Expired Bookings | Daily Midnight | Mark completed rentals |

---

## 11. Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM="Car Rental <noreply@agency.tn>"

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paymee
PAYMEE_VENDOR_TOKEN=your_token
PAYMEE_API_URL=https://app.paymee.tn/api/v2
PAYMEE_WEBHOOK_SECRET=your_secret

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# URLs
API_URL=http://localhost:3000
APP_URL=http://localhost:4200
```

---

## 12. Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npx prisma migrate dev    # Create and apply migrations
npx prisma generate       # Generate Prisma client
npx prisma db seed        # Seed database
npx prisma studio         # Open Prisma Studio

# Linting
npm run lint              # Run ESLint
npm run lint:fix           # Fix linting issues
```

---

## 13. API Documentation

Swagger documentation is available at `/api/docs` when the server is running.

### Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100 },
  "timestamp": "2025-01-15T14:32:00.000Z"
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  },
  "timestamp": "2025-01-15T14:32:00.000Z"
}
```

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 👤 Author

Built with ❤️ using NestJS and PostgreSQL
