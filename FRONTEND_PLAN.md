# 🎨 Plan Frontend Complet — Car Rental Platform

> **Stack:** Angular 17+ · TypeScript · SCSS · Signals · Standalone Components
> **UI Library:** Custom Design System (Apple-inspired) + Angular CDK
> **State:** RxJS + Angular Signals (no NgRx complexity needed)
> **Icons:** Lucide Angular

---

## 📑 Table des Matières

1. [Architecture Générale](#1-architecture-générale)
2. [Structure des dossiers](#2-structure-des-dossiers)
3. [Pages Publiques (Landing)](#3-pages-publiques-landing)
4. [Authentification](#4-authentification)
5. [Espace Client](#5-espace-client)
6. [Espace Admin](#6-espace-admin)
7. [Composants UI Réutilisables](#7-composants-ui-réutilisables)
8. [Services & State Management](#8-services--state-management)
9. [Guards & Interceptors](#9-guards--interceptors)
10. [Routes Angular](#10-routes-angular)

---

## 1. Architecture Générale

### Philosophy
- **Mobile-first responsive** (375px, 768px, 1024px, 1440px)
- **Standalone components** - No NgModules
- **Signals for local state** - RxJS for async operations
- **Lazy loading** for all feature modules
- **SSR-friendly** - No direct DOM manipulation

### Core Dependencies
```typescript
// Angular Core
@angular/core, @angular/router, @angular/forms, @angular/common/http

// Angular CDK (accessibility + overlays)
@angular/cdk/a11y, @angular/cdk/overlay, @angular/cdk/portal

// Third-party
lucide-angular          // Icons
chart.js + ng2-charts   // Dashboard graphs
date-fns               // Date manipulation
ngx-stripe             // Stripe Elements
```

---

## 2. Structure des Dossiers

```
src/app/
├── core/                          # Singleton services, interceptors, guards
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── vehicle.service.ts
│   │   ├── booking.service.ts
│   │   ├── payment.service.ts
│   │   ├── notification.service.ts
│   │   ├── toast.service.ts
│   │   └── loading.service.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   └── loading.interceptor.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── guest.guard.ts
│   │   └── admin.guard.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── vehicle.model.ts
│   │   ├── booking.model.ts
│   │   ├── payment.model.ts
│   │   └── api-response.model.ts
│   └── utils/
│       ├── date.utils.ts
│       ├── currency.utils.ts
│       └── validators.ts
│
├── layout/                        # Shell components
│   ├── nav/
│   │   └── nav.component.ts       # Main navigation
│   ├── footer/
│   │   └── footer.component.ts
│   └── admin-layout/
│       ├── admin-layout.component.ts
│       ├── admin-sidebar.component.ts
│       └── admin-header.component.ts
│
├── features/                      # Feature modules (lazy loaded)
│   ├── landing/                   # Public pages
│   │   ├── landing.component.ts
│   │   └── sections/
│   │       ├── hero.component.ts
│   │       ├── features-section.component.ts
│   │       ├── categories-section.component.ts
│   │       ├── how-it-works-section.component.ts
│   │       ├── fleet-preview.component.ts
│   │       ├── testimonials.component.ts
│   │       └── cta-section.component.ts
│   │
│   ├── auth/                      # Authentication
│   │   ├── auth-layout.component.ts
│   │   ├── login.component.ts
│   │   ├── register.component.ts
│   │   ├── forgot-password.component.ts
│   │   ├── reset-password.component.ts
│   │   └── verify-email.component.ts
│   │
│   ├── vehicles/                  # Vehicle catalog
│   │   ├── vehicle-list/
│   │   │   ├── vehicle-list.component.ts
│   │   │   ├── vehicle-filters.component.ts
│   │   │   ├── vehicle-card.component.ts
│   │   │   └── vehicle-grid.component.ts
│   │   ├── vehicle-detail/
│   │   │   ├── vehicle-detail.component.ts
│   │   │   ├── vehicle-gallery.component.ts
│   │   │   ├── vehicle-specs.component.ts
│   │   │   ├── vehicle-calendar.component.ts
│   │   │   └── booking-form.component.ts
│   │   └── vehicle-compare/
│   │       └── vehicle-compare.component.ts
│   │
│   ├── booking/                   # Booking flow
│   │   ├── booking-wizard/
│   │   │   ├── booking-wizard.component.ts
│   │   │   ├── step-dates.component.ts
│   │   │   ├── step-vehicle.component.ts
│   │   │   ├── step-extras.component.ts
│   │   │   ├── step-payment.component.ts
│   │   │   └── step-summary.component.ts
│   │   ├── booking-confirmation/
│   │   │   └── booking-confirmation.component.ts
│   │   └── my-bookings/
│   │       ├── my-bookings.component.ts
│   │       ├── booking-card.component.ts
│   │       └── booking-detail.component.ts
│   │
│   ├── payment/                   # Payment handling
│   │   ├── payment-method/
│   │   │   ├── payment-method.component.ts
│   │   │   ├── stripe-payment.component.ts
│   │   │   └── paymee-payment.component.ts
│   │   └── payment-status/
│   │       ├── payment-success.component.ts
│   │       └── payment-failed.component.ts
│   │
│   ├── client-dashboard/          # Client space
│   │   ├── dashboard.component.ts
│   │   ├── profile/
│   │   │   ├── profile.component.ts
│   │   │   ├── profile-form.component.ts
│   │   │   ├── password-change.component.ts
│   │   │   └── avatar-upload.component.ts
│   │   ├── notifications/
│   │   │   ├── notifications.component.ts
│   │   │   └── notification-item.component.ts
│   │   └── history/
│   │       └── rental-history.component.ts
│   │
│   ├── admin/                     # Admin dashboard
│   │   ├── dashboard/
│   │   │   ├── admin-dashboard.component.ts
│   │   │   ├── stat-cards.component.ts
│   │   │   ├── revenue-chart.component.ts
│   │   │   ├── occupancy-chart.component.ts
│   │   │   ├── recent-bookings.component.ts
│   │   │   └── alerts.component.ts
│   │   ├── vehicles/
│   │   │   ├── vehicle-management.component.ts
│   │   │   ├── vehicle-form.component.ts
│   │   │   ├── vehicle-status.component.ts
│   │   │   ├── maintenance-calendar.component.ts
│   │   │   └── maintenance-form.component.ts
│   │   ├── bookings/
│   │   │   ├── booking-management.component.ts
│   │   │   ├── booking-table.component.ts
│   │   │   ├── booking-detail-admin.component.ts
│   │   │   └── status-update.component.ts
│   │   ├── clients/
│   │   │   ├── client-management.component.ts
│   │   │   ├── client-table.component.ts
│   │   │   └── client-detail.component.ts
│   │   ├── pricing/
│   │   │   ├── pricing-management.component.ts
│   │   │   ├── price-rule-form.component.ts
│   │   │   └── seasonal-rules.component.ts
│   │   ├── payments/
│   │   │   ├── payment-management.component.ts
│   │   │   ├── refund-dialog.component.ts
│   │   │   └── transaction-log.component.ts
│   │   └── settings/
│   │       ├── agency-settings.component.ts
│   │       ├── cancellation-policy.component.ts
│   │       └── opening-hours.component.ts
│   │
│   └── pages/                     # Static pages
│       ├── about.component.ts
│       ├── contact.component.ts
│       ├── faq.component.ts
│       ├── terms.component.ts
│       └── privacy.component.ts
│
├── shared/                        # Shared components
│   ├── components/
│   │   ├── button/
│   │   │   └── button.component.ts
│   │   ├── input/
│   │   │   └── input.component.ts
│   │   ├── select/
│   │   │   └── select.component.ts
│   │   ├── date-picker/
│   │   │   └── date-picker.component.ts
│   │   ├── modal/
│   │   │   └── modal.component.ts
│   │   ├── toast/
│   │   │   └── toast.component.ts
│   │   ├── loader/
│   │   │   └── loader.component.ts
│   │   ├── empty-state/
│   │   │   └── empty-state.component.ts
│   │   ├── pagination/
│   │   │   └── pagination.component.ts
│   │   ├── badge/
│   │   │   └── badge.component.ts
│   │   ├── avatar/
│   │   │   └── avatar.component.ts
│   │   └── breadcrumbs/
│   │       └── breadcrumbs.component.ts
│   └── directives/
│       ├── click-outside.directive.ts
│       └── auto-focus.directive.ts
│
└── app.routes.ts                  # Main routing config
```

---

## 3. Pages Publiques (Landing)

### 3.1 Landing Page (`/`) — **18 composants**
| Composant | Description | Props/Features |
|-----------|-------------|----------------|
| `HeroComponent` | Bannière principale avec recherche | Background video, search form, stats counter |
| `FeaturesSectionComponent` | 4 features avec icônes | Grid layout, hover animations |
| `CategoriesSectionComponent` | 6 catégories de véhicules | Cards avec compteur véhicules |
| `HowItWorksSectionComponent` | 3 étapes (réservation) | Step indicators, connectors |
| `FleetPreviewComponent` | 4-6 véhicules en vedette | Carousel/grid, quick view modal |
| `TestimonialsComponent` | Avis clients | Carousel avec rating stars |
| `CtaSectionComponent` | Call-to-action final | Gradient background, dual buttons |
| `NavComponent` | Navigation principale | Mobile hamburger, scroll effects |
| `FooterComponent` | Pied de page | Links, newsletter, social icons |

**UI/UX Components Used:**
- `ButtonComponent` (primary, secondary, outline variants)
- `InputComponent` (search, date)
- `SelectComponent` (category filter)
- `VehicleCardComponent` (preview)
- `BadgeComponent` (category tags)
- `LoaderComponent` (skeleton loading)

---

## 4. Authentification

### 4.1 Auth Routes — **7 pages, 15+ composants**

| Page | URL | Composants Clés |
|------|-----|------------------|
| Login | `/auth/login` | LoginForm, SocialLogin, RememberMe |
| Register | `/auth/register` | Multi-step form, PasswordStrength, TermsCheckbox |
| Forgot Password | `/auth/forgot-password` | EmailInput, SuccessMessage |
| Reset Password | `/auth/reset-password` | NewPasswordForm, TokenValidation |
| Verify Email | `/auth/verify-email` | StatusIcon, ResendButton |

**Composants UI:**
- `AuthLayoutComponent` — Background gradient, centered card
- `LoginComponent` — Email/password form, error handling
- `RegisterComponent` — 2-step wizard (personal + license info)
- `PasswordStrengthComponent` — Visual strength indicator
- `ForgotPasswordComponent` — Email validation, success state
- `ResetPasswordComponent` — Token validation, new password
- `VerifyEmailComponent` — Success/error states

---

## 5. Espace Client

### 5.1 Vehicle Catalog — **12 composants**

| Composant | Description | Interactions |
|-----------|-------------|--------------|
| `VehicleListComponent` | Page principale catalogue | Filters, sorting, pagination |
| `VehicleFiltersComponent` | Sidebar filtres | Category, price, fuel, transmission |
| `VehicleCardComponent` | Carte véhicule | Hover effects, quick actions |
| `VehicleGridComponent` | Layout responsive | Masonry/grid switch |
| `VehicleDetailComponent` | Page détail véhicule | Full specs, gallery, calendar |
| `VehicleGalleryComponent` | Galerie photos | Thumbnails, fullscreen, zoom |
| `VehicleSpecsComponent` | Spécifications techniques | Icon grid, feature list |
| `VehicleCalendarComponent` | Calendrier disponibilités | FullCalendar integration, date selection |
| `BookingFormComponent` | Formulaire réservation rapide | Date pickers, price preview |
| `VehicleCompareComponent` | Comparaison véhicules | Side-by-side specs, sticky header |

### 5.2 Booking Flow — **10 composants**

| Composant | Description | Features |
|-----------|-------------|----------|
| `BookingWizardComponent` | Wizard multi-étapes | Stepper, navigation guards |
| `StepDatesComponent` | Sélection dates | Calendar, availability check |
| `StepVehicleComponent` | Choix véhicule | Filters, comparison |
| `StepExtrasComponent` | Options additionnelles | Insurance, GPS, child seat |
| `StepPaymentComponent` | Paiement | Stripe/Paymee integration |
| `StepSummaryComponent` | Récapitulatif | Price breakdown, terms |
| `BookingConfirmationComponent` | Page confirmation | Reference number, email sent |
| `MyBookingsComponent` | Liste réservations | Status badges, actions |
| `BookingCardComponent` | Carte réservation | Timeline, quick actions |
| `BookingDetailComponent` | Détail réservation | Full info, download contract |

### 5.3 Client Dashboard — **8 composants**

| Composant | Description | Features |
|-----------|-------------|----------|
| `DashboardComponent` | Accueil client | Stats, upcoming rentals, notifications |
| `ProfileComponent` | Profil utilisateur | Form sections, validation |
| `ProfileFormComponent` | Formulaire profil | Avatar, personal info, license |
| `PasswordChangeComponent` | Changement mot de passe | Current + new password |
| `AvatarUploadComponent` | Upload photo | Crop, preview, size validation |
| `NotificationsComponent` | Centre notifications | Mark read, delete, filter |
| `NotificationItemComponent` | Item notification | Icon, title, time, actions |
| `RentalHistoryComponent` | Historique locations | Table, filters, reviews |

---

## 6. Espace Admin

### 6.1 Admin Dashboard — **15+ composants**

| Section | Composants | Description |
|---------|------------|-------------|
| **Overview** | `AdminDashboardComponent` | Layout principal |
| | `StatCardsComponent` | 4-6 KPI cards (revenue, bookings, occupancy) |
| | `RevenueChartComponent` | Line chart (Chart.js) |
| | `OccupancyChartComponent` | Bar/pie chart |
| | `RecentBookingsComponent` | Table dernières réservations |
| | `AlertsComponent` | Maintenance alerts, low inventory |
| **Vehicles** | `VehicleManagementComponent` | CRUD véhicules |
| | `VehicleFormComponent` | Create/edit vehicle |
| | `VehicleStatusComponent` | Quick status toggle |
| | `MaintenanceCalendarComponent` | FullCalendar maintenance |
| | `MaintenanceFormComponent` | Add maintenance record |
| **Bookings** | `BookingManagementComponent` | Liste toutes réservations |
| | `BookingTableComponent` | Data table with filters |
| | `BookingDetailAdminComponent` | Full booking info |
| | `StatusUpdateComponent` | Status workflow (PENDING→CONFIRMED→ACTIVE...) |
| **Clients** | `ClientManagementComponent` | Liste clients |
| | `ClientTableComponent` | Table with search |
| | `ClientDetailComponent` | Profile + history |
| **Pricing** | `PricingManagementComponent` | Règles tarifaires |
| | `PriceRuleFormComponent` | Create/edit rules |
| | `SeasonalRulesComponent` | Calendar view rules |
| **Payments** | `PaymentManagementComponent` | Transactions |
| | `RefundDialogComponent` | Process refunds |
| | `TransactionLogComponent` | Payment history |
| **Settings** | `AgencySettingsComponent` | Config agence |
| | `CancellationPolicyComponent` | Policy editor |
| | `OpeningHoursComponent` | Horaires JSON editor |

---

## 7. Composants UI Réutilisables

### 7.1 Design System Components

| Component | Variants | Props |
|-----------|----------|-------|
| `ButtonComponent` | primary, secondary, danger, ghost, outline | size, loading, disabled, iconLeft, iconRight |
| `InputComponent` | text, password, email, number, textarea | label, error, hint, prefix, suffix, icon |
| `SelectComponent` | single, multi, searchable | options, placeholder, clearable |
| `DatePickerComponent` | single, range | minDate, maxDate, disabledDates |
| `ModalComponent` | default, confirm, full-screen | title, footer, closeable, size |
| `ToastComponent` | success, error, warning, info | message, duration, action |
| `LoaderComponent` | spinner, skeleton, progress | size, color |
| `EmptyStateComponent` | default | icon, title, description, action |
| `PaginationComponent` | default | page, total, perPage |
| `BadgeComponent` | status, category, priority | color, size |
| `AvatarComponent` | image, initials | size, fallback |
| `BreadcrumbsComponent` | default | items, separator |

### 7.2 Custom Directives

| Directive | Purpose |
|-----------|---------|
| `ClickOutsideDirective` | Close dropdowns/modals on outside click |
| `AutoFocusDirective` | Auto-focus input on mount |
| `TooltipDirective` | Show tooltip on hover |
| `InfiniteScrollDirective` | Load more on scroll |

---

## 8. Services & State Management

### 8.1 Core Services

```typescript
// API Services
ApiService          // HTTP wrapper, error handling
AuthService         // Login, register, token management
VehicleService      // CRUD vehicles, filters
BookingService      // Create, update, cancel bookings
PaymentService      // Stripe/Paymee integration
NotificationService // CRUD notifications

// UI Services  
ToastService        // Global toast notifications
LoadingService      // Global loading state
ModalService        // Programmatic modals
```

### 8.2 State Pattern (Signals)

```typescript
// Auth State
authService.user()           // Signal<User | null>
authService.isAuthenticated() // Signal<boolean>
authService.isAdmin()        // Signal<boolean>

// Vehicle State  
vehicleService.vehicles()    // Signal<Vehicle[]>
vehicleService.filters()     // Signal<FilterState>
vehicleService.loading()     // Signal<boolean>

// Booking State
bookingService.currentBooking() // Signal<Booking | null>
bookingService.myBookings()     // Signal<Booking[]>
```

---

## 9. Guards & Interceptors

### 9.1 Route Guards

```typescript
authGuard      // Protect client routes (redirect to login)
guestGuard     // Prevent logged users from auth pages
adminGuard     // Protect admin routes
bookingGuard   // Prevent incomplete booking access
```

### 9.2 HTTP Interceptors

```typescript
authInterceptor    // Add JWT token to requests
errorInterceptor   // Handle 401 refresh, global errors
loadingInterceptor // Auto show/hide loading indicator
```

---

## 10. Routes Angular

```typescript
export const routes: Routes = [
  // Public
  { path: '', component: LandingComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'faq', component: FaqComponent },
  
  // Auth (guest only)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'verify-email', component: VerifyEmailComponent },
    ]
  },
  
  // Vehicles (public)
  {
    path: 'vehicles',
    children: [
      { path: '', component: VehicleListComponent },
      { path: ':id', component: VehicleDetailComponent },
      { path: 'compare', component: VehicleCompareComponent },
    ]
  },
  
  // Booking Flow (client only)
  {
    path: 'booking',
    canActivate: [authGuard],
    children: [
      { path: 'wizard', component: BookingWizardComponent },
      { path: 'confirmation/:id', component: BookingConfirmationComponent },
    ]
  },
  
  // Client Dashboard
  {
    path: 'dashboard',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ClientDashboardComponent },
      { path: 'bookings', component: MyBookingsComponent },
      { path: 'bookings/:id', component: BookingDetailComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'history', component: RentalHistoryComponent },
    ]
  },
  
  // Admin Dashboard
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'vehicles', component: VehicleManagementComponent },
      { path: 'vehicles/:id/edit', component: VehicleFormComponent },
      { path: 'bookings', component: BookingManagementComponent },
      { path: 'bookings/:id', component: BookingDetailAdminComponent },
      { path: 'clients', component: ClientManagementComponent },
      { path: 'clients/:id', component: ClientDetailComponent },
      { path: 'pricing', component: PricingManagementComponent },
      { path: 'payments', component: PaymentManagementComponent },
      { path: 'settings', component: AgencySettingsComponent },
    ]
  },
  
  // Payment callbacks
  { path: 'payment/success', component: PaymentSuccessComponent },
  { path: 'payment/failed', component: PaymentFailedComponent },
  
  // 404
  { path: '**', component: NotFoundComponent }
];
```

---

## 📊 Résumé par Module

| Module | Pages | Composants | Complexité |
|--------|-------|------------|------------|
| **Landing** | 1 | 9 | ⭐⭐ |
| **Auth** | 5 | 8 | ⭐⭐⭐ |
| **Vehicles** | 3 | 12 | ⭐⭐⭐⭐ |
| **Booking** | 4 | 11 | ⭐⭐⭐⭐⭐ |
| **Client Dashboard** | 5 | 9 | ⭐⭐⭐ |
| **Admin** | 7 | 25+ | ⭐⭐⭐⭐⭐ |
| **Shared/UI** | — | 15+ | ⭐⭐⭐ |
| **TOTAL** | **25+** | **90+** | — |

---

## 🎯 Implementation Priority

### Phase 1 (MVP)
1. Landing page + Vehicle catalog
2. Auth (login/register)
3. Vehicle detail + Booking form
4. Client dashboard (my bookings, profile)

### Phase 2
5. Admin dashboard (vehicles, bookings)
6. Payment integration (Stripe/Paymee)
7. Notifications system

### Phase 3
8. Advanced admin features (pricing, maintenance)
9. Reviews system
10. Analytics dashboard
