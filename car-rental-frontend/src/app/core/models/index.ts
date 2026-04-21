// ═════════════════════════════════════════════════════════════════════════════════════════
// CORE MODELS — Car Rental Platform
// TypeScript interfaces matching backend Prisma schema
// ═════════════════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// User & Authentication
// ──────��──────────────────────────────────────────────────────────────────

export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  cin?: string;
  drivingLicense?: string;
  licenseExpiry?: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  cin?: string;
  drivingLicense?: string;
  licenseExpiry?: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  cin?: string;
  drivingLicense?: string;
  licenseExpiry?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Vehicle
// ─────────────────────────────────────────────────────────────────────────

export type VehicleCategory = 'ECONOMY' | 'COMPACT' | 'SEDAN' | 'SUV' | 'LUXURY' | 'VAN';
export type TransmissionType = 'MANUAL' | 'AUTOMATIC';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface VehicleImage {
  id: number;
  vehicleId: number;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
}

export interface Vehicle {
  id: number;
  registration: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: TransmissionType;
  fuel: FuelType;
  seats: number;
  doors: number;
  color?: string;
  mileage: number;
  status: VehicleStatus;
  dailyRate: number;
  depositAmount: number;
  description?: string;
  features: string[];
  mainImageUrl?: string;
  images?: VehicleImage[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListResponse {
  data: Vehicle[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: VehicleCategory;
  fuel?: FuelType;
  transmission?: TransmissionType;
  minSeats?: number;
  maxSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  status?: VehicleStatus;
}

// ─────────────────────────────────────────────────────────────────────────
// Booking
// ─────────────────────────────────────────────────────────────────────────

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED';

export interface Booking {
  id: number;
  bookingReference: string;
  clientId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  pickupTime: string;
  returnTime: string;
  durationDays: number;
  dailyRate: number;
  subtotal: number;
  discountAmount: number;
  depositAmount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'PAYMEE' | 'STRIPE' | 'CASH';
  pickupLocation?: string;
  returnLocation?: string;
  notes?: string;
  contractPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  client?: Partial<User>;
  payments?: Payment[];
}

export interface BookingListResponse {
  data: Booking[];
  meta: PaginationMeta;
}

export interface CreateBookingRequest {
  vehicleId: number;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  notes?: string;
}

export interface AvailabilityCheck {
  startDate: string;
  endDate: string;
  vehicleId?: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Payment
// ─────────────────────────────────────────────────────────────────────────

export type PaymentMethod = 'PAYMEE' | 'STRIPE' | 'CASH';
export type TransactionType = 'CHARGE' | 'REFUND';

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gatewayPaymentId?: string;
  transactionType: TransactionType;
  paidAt?: string;
  createdAt: string;
}

export interface PaymeeInitiateRequest {
  bookingId: number;
}

export interface PaymeeInitiateResponse {
  token: string;
  paymentUrl: string;
}

export interface StripeIntentRequest {
  bookingId: number;
}

export interface StripeIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Dashboard (Admin)
// ─────────────────────────────────────────────────────────────────────────

export interface DashboardKPI {
  revenue: {
    value: number;
    change: number;
  };
  bookings: {
    value: number;
    change: number;
  };
  fleet: {
    total: number;
    rented: number;
    available: number;
  };
  clients: {
    total: number;
    newThisMonth: number;
  };
}

export interface RevenueChart {
  month: string;
  revenue: number;
}

export interface BookingsByStatus {
  status: BookingStatus;
  count: number;
}

export interface FleetOccupation {
  date: string;
  rented: number;
  available: number;
  occupationRate: number;
}

export interface TopVehicle {
  vehicle: Vehicle;
  bookingCount: number;
  totalRevenue: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Maintenance
// ─────────────────────────────────────────────────────────────────────────

export type MaintenanceType = 'OIL_CHANGE' | 'TECHNICAL_INSPECTION' | 'INSURANCE' | 'TIRE_CHANGE' | 'BRAKE' | 'CLEANING' | 'ACCIDENT_REPAIR' | 'OTHER';

export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  type: MaintenanceType;
  title: string;
  description?: string;
  cost?: number;
  mileageAt?: number;
  doneDate?: string;
  nextDueDate?: string;
  provider?: string;
  documentUrl?: string;
  createdAt: string;
}

export interface MaintenanceAlert extends MaintenanceRecord {
  urgency: 'EXPIRED' | 'CRITICAL' | 'WARNING';
  vehicle: {
    brand: string;
    model: string;
    registration: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────────────────

export type PriceRuleType = 'SEASONAL' | 'WEEKEND' | 'LONG_TERM' | 'PROMO';

export interface PriceRule {
  id: number;
  vehicleId?: number;
  category?: string;
  name: string;
  type: PriceRuleType;
  discountPct?: number;
  extraPct?: number;
  minDays: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCount {
  unread: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Common
// ─────────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Agency Config
// ─────────────────────────────────────────────────────────────────────────

export interface AgencyConfig {
  id: number;
  agencyName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  slogan?: string;
  openingHours: {
    [key: string]: {
      open: string;
      close: string;
    } | null;
  };
  freeCancelHours: number;
  cancelFee24to48: number;
  cancelFeeLess24: number;
  cancelFeeNoShow: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Form DTOs
// ─────────────────────────────────────────────────────────────────────────

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SearchParams {
  pickupLocation?: string;
  returnLocation?: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  category?: VehicleCategory;
}