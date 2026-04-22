# 🎯 Implementation Plan — Car Rental Frontend

> **Current Status:** Auth + Landing foundation complete
> **Design System:** Apple-inspired (see DESIGN.md)
> **Backend:** NestJS API with all endpoints ready

---

## 📊 What's Already Implemented

### ✅ Core Infrastructure
| Module | Status | Files |
|--------|--------|-------|
| **Services** | ✅ Complete | api, auth, vehicles, bookings, toast, loading |
| **Interceptors** | ✅ Complete | auth, error, loading (withCredentials: true) |
| **Guards** | ✅ Complete | authGuard, guestGuard |
| **Models** | ✅ Complete | Full TypeScript interfaces matching Prisma schema |
| **Routes** | ⚠️ Partial | Landing + Auth routes only |

### ✅ Layout Components
| Component | Status | Location |
|-----------|--------|----------|
| Nav | ✅ | layout/nav/nav.component.ts |
| Footer | ✅ | layout/footer/footer.component.ts |

### ✅ Auth Flow
| Component | Status | Location |
|-----------|--------|----------|
| Auth Layout | ✅ | features/auth/auth-layout.component.ts |
| Login | ✅ | features/auth/login.component.ts |
| Register | ✅ | features/auth/register.component.ts |
| Forgot Password | ✅ | features/auth/forgot-password.component.ts |
| Reset Password | ✅ | features/auth/reset-password.component.ts |
| Verify Email | ✅ | features/auth/verify-email.component.ts |

### ✅ Landing Page
| Component | Status | Location |
|-----------|--------|----------|
| Landing Main | ✅ | landing/landing.component.ts |
| Hero Section | ✅ | features/landing/sections/hero.component.ts |
| Features Section | ✅ | features/landing/sections/features-section.component.ts |
| Categories Section | ✅ | features/landing/sections/categories-section.component.ts |
| How It Works | ✅ | features/landing/sections/how-it-works.component.ts |
| CTA Section | ✅ | features/landing/sections/cta-section.component.ts |
| Vehicle Card | ✅ | features/landing/components/vehicle-card.component.ts |

---

## 🎨 Design System Reference (from DESIGN.md)

### Colors
```scss
--color-black: #000000;
--color-light-gray: #f5f5f7;
--color-near-black: #1d1d1f;
--color-apple-blue: #0071e3;
--color-link-light: #0066cc;
--color-link-dark: #2997ff;
--color-white: #ffffff;
--color-text-primary: rgba(0, 0, 0, 0.8);
--color-text-secondary: rgba(0, 0, 0, 0.48);
--color-error: #ff3b30;
--color-success: #34c759;
--color-warning: #ff9500;
```

### Typography
```scss
--font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
--font-text: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Button Styles
- **Primary:** Apple Blue (#0071e3), white text, 8px radius, 8px 15px padding
- **Secondary:** #1d1d1f background, white text, 8px radius
- **Pill Link:** Transparent, border, 980px radius (full pill)
- **Filter:** #fafafc background, 11px radius

### Spacing
- Base unit: 8px
- Card radius: 5px-8px
- Navigation height: 48px
- Max content width: 980px

---

## 🚀 Next Phase Implementation Plan

### Phase 1: Vehicle Catalog (Priority: HIGH)
**Backend Endpoints:**
- `GET /api/v1/vehicles` — List with filters
- `GET /api/v1/vehicles/:id` — Detail
- `GET /api/v1/vehicles/:id/availability` — Calendar

**Components to Create:**
1. `VehicleListComponent` — Main catalog page
2. `VehicleFiltersComponent` — Sidebar filters
3. `VehicleDetailComponent` — Single vehicle page
4. `VehicleGalleryComponent` — Image gallery
5. `VehicleSpecsComponent` — Specs display
6. `VehicleCalendarComponent` — Availability calendar
7. `BookingFormComponent` — Quick booking form

---

### Phase 2: Booking Flow (Priority: HIGH)
**Backend Endpoints:**
- `POST /api/v1/bookings/calculate` — Price calculation
- `POST /api/v1/bookings/validate` — Date validation
- `POST /api/v1/bookings` — Create booking
- `POST /api/v1/bookings/:id/cancel` — Cancel booking

**Components to Create:**
1. `BookingWizardComponent` — Multi-step wizard container
2. `StepDatesComponent` — Date selection
3. `StepVehicleComponent` — Vehicle selection
4. `StepExtrasComponent` — Options (insurance, GPS)
5. `StepPaymentComponent` — Payment method selection
6. `StepSummaryComponent` — Final review
7. `BookingConfirmationComponent` — Success page

---

### Phase 3: Shared UI Components (Priority: MEDIUM)
**Components to Create:**
1. `ButtonComponent` — All button variants
2. `InputComponent` — Text, password, email
3. `SelectComponent` — Dropdown select
4. `DatePickerComponent` — Date picker
5. `ModalComponent` — Modal dialog
6. `ToastComponent` — Toast notifications
7. `LoaderComponent` — Loading states
8. `EmptyStateComponent` — Empty state display
9. `PaginationComponent` — Pagination controls
10. `BadgeComponent` — Status badges
11. `AvatarComponent` — User avatar
12. `BreadcrumbsComponent` — Navigation breadcrumbs

---

### Phase 4: Client Dashboard (Priority: MEDIUM)
**Backend Endpoints:**
- `GET /api/v1/bookings/my` — My bookings
- `GET /api/v1/bookings/my/:id` — Booking detail
- `GET /api/v1/users/me` — Profile
- `PUT /api/v1/users/me` — Update profile
- `PUT /api/v1/users/me/password` — Change password

**Components to Create:**
1. `ClientLayoutComponent` — Dashboard layout shell
2. `ClientDashboardComponent` — Dashboard home
3. `MyBookingsComponent` — Booking list
4. `BookingCardComponent` — Booking card
5. `BookingDetailComponent` — Booking detail view
6. `ProfileComponent` — Profile management
7. `ProfileFormComponent` — Profile form
8. `PasswordChangeComponent` — Password change form
9. `AvatarUploadComponent` — Avatar upload
10. `NotificationsComponent` — Notifications center
11. `NotificationItemComponent` — Notification item
12. `RentalHistoryComponent` — Rental history

---

### Phase 5: Admin Dashboard (Priority: MEDIUM)
**Backend Endpoints:**
- `GET /api/v1/dashboard` — KPIs
- `GET /api/v1/vehicles` (admin) — Full vehicle management
- `POST /api/v1/vehicles` — Create vehicle
- `PUT /api/v1/vehicles/:id` — Update vehicle
- `GET /api/v1/bookings` (admin) — All bookings
- `GET /api/v1/users` — Client list
- `GET /api/v1/pricing` — Price rules
- `GET /api/v1/payments` — Payment transactions

**Components to Create:**
1. `AdminLayoutComponent` — Admin layout shell
2. `AdminSidebarComponent` — Sidebar navigation
3. `AdminHeaderComponent` — Header with user menu
4. `AdminDashboardComponent` — Dashboard home
5. `StatCardsComponent` — KPI cards
6. `RevenueChartComponent` — Revenue chart (Chart.js)
7. `OccupancyChartComponent` — Occupancy chart
8. `RecentBookingsComponent` — Recent bookings table
9. `AlertsComponent` — Maintenance alerts
10. `VehicleManagementComponent` — Vehicle CRUD
11. `VehicleFormComponent` — Create/edit vehicle
12. `VehicleStatusComponent` — Quick status toggle
13. `MaintenanceCalendarComponent` — Maintenance calendar
14. `MaintenanceFormComponent` — Add maintenance
15. `BookingManagementComponent` — Booking list (admin)
16. `BookingTableComponent` — Data table
17. `BookingDetailAdminComponent` — Admin booking detail
18. `StatusUpdateComponent` — Status workflow
19. `ClientManagementComponent` — Client list
20. `ClientTableComponent` — Client table
21. `ClientDetailComponent` — Client detail
22. `PricingManagementComponent` — Pricing rules
23. `PriceRuleFormComponent` — Create/edit rule
24. `SeasonalRulesComponent` — Calendar view
25. `PaymentManagementComponent` — Payment transactions
26. `RefundDialogComponent` — Refund process
27. `TransactionLogComponent` — Transaction history
28. `AgencySettingsComponent` — Agency config
29. `CancellationPolicyComponent` — Policy editor
30. `OpeningHoursComponent` — Hours editor

---

### Phase 6: Payment Integration (Priority: LOW)
**Backend Endpoints:**
- `POST /api/v1/payments/paymee/initiate` — Paymee payment
- `POST /api/v1/payments/stripe/intent` — Stripe intent
- `POST /api/v1/payments/webhooks/paymee` — Paymee webhook
- `POST /api/v1/payments/webhooks/stripe` — Stripe webhook

**Components to Create:**
1. `PaymentMethodComponent` — Payment method selection
2. `StripePaymentComponent` — Stripe Elements integration
3. `PaymeePaymentComponent` — Paymee redirect/integration
4. `PaymentSuccessComponent` — Success page
5. `PaymentFailedComponent` — Failed page

---

## 📝 Detailed Implementation Prompts

### Prompt 1: Shared UI Components (Foundation)

```
Create a comprehensive set of reusable UI components following the Apple-inspired design system specified in DESIGN.md. All components must be standalone Angular 17+ components with proper TypeScript typing.

Components to create:

1. ButtonComponent (src/app/shared/components/button/)
   - Variants: primary, secondary, danger, ghost, outline
   - Sizes: small, medium, large
   - Props: size, variant, loading, disabled, iconLeft, iconRight
   - Styles per DESIGN.md:
     * Primary: Apple Blue (#0071e3), white text, 8px radius, 8px 15px padding
     * Secondary: #1d1d1f bg, white text, 8px radius
     * Pill: 980px radius for "Learn more" style links
     * Filter: #fafafc bg, 11px radius

2. InputComponent (src/app/shared/components/input/)
   - Types: text, password, email, number, textarea
   - Props: label, error, hint, prefix, suffix, icon, disabled
   - Styles: 8px radius, #fafafc background for filter inputs

3. SelectComponent (src/app/shared/components/select/)
   - Props: options, placeholder, clearable, searchable, disabled
   - Styles: Match input component

4. DatePickerComponent (src/app/shared/components/date-picker/)
   - Types: single, range
   - Props: minDate, maxDate, disabledDates, placeholder
   - Integration: Use Angular CDK overlay for dropdown

5. ModalComponent (src/app/shared/components/modal/)
   - Props: title, footer, closeable, size (sm, md, lg, xl)
   - Styles: Backdrop blur, dark translucent overlay
   - Animation: Fade in/scale up

6. ToastComponent (src/app/shared/components/toast/)
   - Types: success, error, warning, info
   - Props: message, duration, action
   - Position: Top-right with animation

7. LoaderComponent (src/app/shared/components/loader/)
   - Types: spinner, skeleton, progress
   - Props: size, color, progress (for progress type)

8. EmptyStateComponent (src/app/shared/components/empty-state/)
   - Props: icon, title, description, action
   - Styles: Centered, generous spacing

9. PaginationComponent (src/app/shared/components/pagination/)
   - Props: page, total, perPage, onPageChange
   - Styles: Minimal, pill-shaped active state

10. BadgeComponent (src/app/shared/components/badge/)
    - Types: status, category, priority
    - Props: color, size, text
    - Styles: Pill-shaped, small radius

11. AvatarComponent (src/app/shared/components/avatar/)
    - Types: image, initials
    - Props: src, name, size, fallback
    - Styles: Circular, fallback to initials

12. BreadcrumbsComponent (src/app/shared/components/breadcrumbs/)
    - Props: items, separator
    - Styles: Minimal, chevron separators

All components must:
- Use standalone component architecture
- Follow Angular 17+ best practices
- Implement proper accessibility (ARIA attributes)
- Include proper TypeScript interfaces for props
- Use CSS custom properties from DESIGN.md
- Include responsive behavior
- Be testable and reusable
```

---

### Prompt 2: Vehicle Catalog Page

```
Create the vehicle catalog feature with filtering, search, and vehicle detail pages. This is Phase 1 of the implementation.

Directory structure:
src/app/features/vehicles/
  ├── vehicle-list/
  │   ├── vehicle-list.component.ts
  │   ├── vehicle-filters.component.ts
  │   ├── vehicle-card.component.ts (reuse existing)
  │   └── vehicle-grid.component.ts
  ├── vehicle-detail/
  │   ├── vehicle-detail.component.ts
  │   ├── vehicle-gallery.component.ts
  │   ├── vehicle-specs.component.ts
  │   ├── vehicle-calendar.component.ts
  │   └── booking-form.component.ts
  └── vehicles.routes.ts

Components to implement:

1. VehicleListComponent
   - URL: /vehicles
   - Layout: Sidebar filters + main grid
   - Features:
     * Search bar (filter button style per DESIGN.md)
     * Category filter (chips)
     * Price range slider
     * Fuel type, transmission filters
     * Sort dropdown (price, popularity, newest)
     * Pagination
     * Loading skeletons
     * Empty state
   - Use VehiclesService (already implemented)
   - Responsive: Sidebar collapses on mobile

2. VehicleFiltersComponent
   - Sidebar with filter controls
   - Filters: category, price, fuel, transmission, seats, features
   - Clear all button
   - Active filter count badge
   - Collapsible sections

3. VehicleGridComponent
   - Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
   - Uses VehicleCardComponent (existing)
   - Skeleton loading state
   - Infinite scroll option

4. VehicleDetailComponent
   - URL: /vehicles/:id
   - Layout:
     * Full-width hero gallery
     * Specs and features sections
     * Availability calendar
     * Booking form
   - Uses VehiclesService.getVehicle(id)
   - Related vehicles section
   - Breadcrumb navigation

5. VehicleGalleryComponent
   - Main image + thumbnails
   - Fullscreen lightbox
   - Image zoom on hover
   - Smooth transitions

6. VehicleSpecsComponent
   - Specs in icon grid format
   - Features list with icons
   - Apple-style clean layout
   - Grouped by category (comfort, safety, technology)

7. VehicleCalendarComponent
   - FullCalendar integration
   - Shows booked periods (red)
   - Shows maintenance periods (yellow)
   - Date selection for booking
   - Legend for color coding

8. BookingFormComponent
   - Date pickers (pickup/return)
   - Time pickers
   - Location inputs
   - Real-time price calculation
   - Book now button
   - Use BookingsService.calculatePrice()

Routes to add:
- /vehicles → VehicleListComponent
- /vehicles/:id → VehicleDetailComponent

All components must:
- Follow DESIGN.md styling (Apple-inspired)
- Use shared UI components from Prompt 1
- Implement proper loading states
- Handle errors gracefully
- Be fully responsive
- Include proper SEO meta tags
```

---

### Prompt 3: Booking Wizard Flow

```
Create a multi-step booking wizard for the reservation process. This is Phase 2.

Directory structure:
src/app/features/booking/
  ├── booking-wizard/
  │   ├── booking-wizard.component.ts
  │   ├── step-dates.component.ts
  │   ├── step-vehicle.component.ts
  │   ├── step-extras.component.ts
  │   ├── step-payment.component.ts
  │   └── step-summary.component.ts
  └── booking-confirmation/
      └── booking-confirmation.component.ts

Components to implement:

1. BookingWizardComponent
   - URL: /booking/wizard
   - Layout: Stepper + content area
   - Features:
     * Progress indicator (steps)
     * Navigation (back/next)
     * Step validation guards
     * State persistence (can close and resume)
     * Auto-save draft
   - Steps: Dates → Vehicle → Extras → Payment → Summary
   - Use BookingsService (already implemented)

2. StepDatesComponent
   - Date range picker
   - Time pickers (pickup/return)
   - Location inputs
   - Duration display
   - Real-time validation with BookingsService.validateDates()
   - Minimum duration warning

3. StepVehicleComponent
   - Vehicle selection grid
   - Pre-selected vehicle from URL param
   - Vehicle comparison
   - Price per day display
   - Filter options

4. StepExtrasComponent
   - Insurance options (checkboxes)
   - GPS addon
   - Child seat
   - Additional driver
   - Real-time price update
   - Terms checkbox

5. StepPaymentComponent
   - Payment method selection (Paymee/Stripe/Cash)
   - Stripe Elements integration
   - Paymee redirect
   - Card input validation
   - Save card option

6. StepSummaryComponent
   - Final review
   - Price breakdown
   - Cancellation policy display
   - Terms agreement
   - Submit button

7. BookingConfirmationComponent
   - URL: /booking/confirmation/:id
   - Success message
   - Booking reference
   - Next steps
   - Download contract button
   - Email sent confirmation

Routes to add:
- /booking/wizard → BookingWizardComponent
- /booking/confirmation/:id → BookingConfirmationComponent

All components must:
- Follow DESIGN.md styling
- Use shared UI components
- Implement proper form validation
- Handle payment errors
- Show loading states during API calls
- Be mobile-friendly
- Support browser back/forward navigation
```

---

### Prompt 4: Client Dashboard

```
Create the client dashboard for logged-in users. This is Phase 4.

Directory structure:
src/app/features/client-dashboard/
  ├── client-layout.component.ts
  ├── dashboard/
  │   └── dashboard.component.ts
  ├── profile/
  │   ├── profile.component.ts
  │   ├── profile-form.component.ts
  │   ├── password-change.component.ts
  │   └── avatar-upload.component.ts
  ├── bookings/
  │   ├── my-bookings.component.ts
  │   ├── booking-card.component.ts
  │   └── booking-detail.component.ts
  ├── notifications/
  │   ├── notifications.component.ts
  │   └── notification-item.component.ts
  └── history/
      └── rental-history.component.ts

Components to implement:

1. ClientLayoutComponent
   - Sidebar navigation
   - Header with user menu
   - Mobile hamburger menu
   - Active route highlighting
   - Logout functionality

2. DashboardComponent
   - URL: /dashboard
   - Quick stats (active bookings, total spent)
   - Upcoming bookings list
   - Recent activity
   - Quick actions (new booking, profile)

3. ProfileComponent
   - URL: /dashboard/profile
   - Profile form sections
   - Avatar with upload
   - Personal info, contact, license
   - Save with loading state
   - Use AuthService (already implemented)

4. ProfileFormComponent
   - Form with validation
   - Fields: firstName, lastName, email, phone, cin, drivingLicense, licenseExpiry
   - Real-time validation
   - Success toast

5. PasswordChangeComponent
   - Current password
   - New password
   - Confirm password
   - Strength indicator
   - Use AuthService.updatePassword()

6. AvatarUploadComponent
   - Image upload with crop
   - Preview
   - Size validation (max 5MB)
   - File type validation
   - Use AuthService.updateAvatar()

7. MyBookingsComponent
   - URL: /dashboard/bookings
   - Tabbed view (active, past, cancelled)
   - Filter by status
   - Search
   - Use BookingsService.getMyBookings()

8. BookingCardComponent
   - Booking details
   - Status badge
   - Vehicle preview
   - Dates
   - Action buttons (cancel, view, download contract)
   - Use BookingsService.getStatusLabel/getStatusColor()

9. BookingDetailComponent
   - URL: /dashboard/bookings/:id
   - Full booking info
   - Payment status
   - Timeline of events
   - Download contract/invoice buttons
   - Leave review (if completed)

10. NotificationsComponent
    - URL: /dashboard/notifications
    - List of notifications
    - Mark as read
    - Delete
    - Filter by type
    - Mark all as read button

11. NotificationItemComponent
    - Icon based on type
    - Title and message
    - Time ago
    - Read/unread indicator
    - Click action

12. RentalHistoryComponent
    - URL: /dashboard/history
    - Table of past rentals
    - Filter by date range
    - Export option
    - Review status

Routes to add (protected by authGuard):
- /dashboard → DashboardComponent
- /dashboard/profile → ProfileComponent
- /dashboard/bookings → MyBookingsComponent
- /dashboard/bookings/:id → BookingDetailComponent
- /dashboard/notifications → NotificationsComponent
- /dashboard/history → RentalHistoryComponent

All components must:
- Follow DESIGN.md styling
- Use shared UI components
- Implement proper loading states
- Handle errors gracefully
- Be fully responsive
- Include proper guards (authGuard)
```

---

### Prompt 5: Admin Dashboard

```
Create the comprehensive admin dashboard for agency management. This is Phase 5.

Directory structure:
src/app/features/admin/
  ├── admin-layout.component.ts
  ├── admin-sidebar.component.ts
  ├── admin-header.component.ts
  ├── dashboard/
  │   ├── admin-dashboard.component.ts
  │   ├── stat-cards.component.ts
  │   ├── revenue-chart.component.ts
  │   ├── occupancy-chart.component.ts
  │   ├── recent-bookings.component.ts
  │   └── alerts.component.ts
  ├── vehicles/
  │   ├── vehicle-management.component.ts
  │   ├── vehicle-form.component.ts
  │   ├── vehicle-status.component.ts
  │   ├── maintenance-calendar.component.ts
  │   └── maintenance-form.component.ts
  ├── bookings/
  │   ├── booking-management.component.ts
  │   ├── booking-table.component.ts
  │   ├── booking-detail-admin.component.ts
  │   └── status-update.component.ts
  ├── clients/
  │   ├── client-management.component.ts
  │   ├── client-table.component.ts
  │   └── client-detail.component.ts
  ├── pricing/
  │   ├── pricing-management.component.ts
  │   ├── price-rule-form.component.ts
  │   └── seasonal-rules.component.ts
  ├── payments/
  │   ├── payment-management.component.ts
  │   ├── refund-dialog.component.ts
  │   └── transaction-log.component.ts
  └── settings/
      ├── agency-settings.component.ts
      ├── cancellation-policy.component.ts
      └── opening-hours.component.ts

Components to implement:

1. AdminLayoutComponent
   - Sidebar navigation
   - Header with notifications
   - Mobile responsive
   - Active route highlighting

2. AdminDashboardComponent
   - URL: /admin
   - KPI cards (revenue, bookings, fleet, clients)
   - Revenue chart (Chart.js)
   - Occupancy chart
   - Recent bookings table
   - Maintenance alerts

3. StatCardsComponent
   - 4 KPI cards
   - Value + change indicator
   - Trend icon
   - Hover effect

4. RevenueChartComponent
   - Line chart (Chart.js)
   - Monthly revenue
   - Year selector
   - Responsive

5. OccupancyChartComponent
   - Bar/pie chart
   - Fleet occupation rate
   - By category breakdown

6. RecentBookingsComponent
   - Table of recent bookings
   - Status badges
   - Quick actions
   - View all link

7. AlertsComponent
   - Maintenance alerts
   - Low inventory
   - Expired documents
   - Dismissable

8. VehicleManagementComponent
   - URL: /admin/vehicles
   - Data table with filters
   - Search
   - Add vehicle button
   - Bulk actions
   - Use VehiclesService

9. VehicleFormComponent
   - Create/edit form
   - Image upload
   - Specs inputs
   - Price configuration
   - Features selection
   - Validation

10. VehicleStatusComponent
    - Quick status toggle
    - Dropdown (AVAILABLE, RENTED, MAINTENANCE, OUT_OF_SERVICE)
    - Confirm dialog

11. MaintenanceCalendarComponent
    - FullCalendar
    - Maintenance records
    - Add maintenance button
    - Color-coded by urgency

12. MaintenanceFormComponent
    - Type selector
    - Cost, mileage
    - Provider
    - Document upload
    - Due date

13. BookingManagementComponent
    - URL: /admin/bookings
    - Data table
    - Filters (status, date range)
    - Search
    - Export
    - Use BookingsService

14. BookingTableComponent
    - Sortable columns
    - Status badges
    - Quick actions
    - Pagination

15. BookingDetailAdminComponent
    - Full booking info
    - Client details
    - Payment status
    - Status workflow
    - Admin notes

16. StatusUpdateComponent
    - Status dropdown
    - Reason input (for cancellation)
    - Confirm dialog
    - Use BookingsService

17. ClientManagementComponent
    - URL: /admin/clients
    - Client table
    - Search
    - Filter by status
    - View detail

18. ClientTableComponent
    - Sortable columns
    - Status indicator
    - Quick actions
    - Pagination

19. ClientDetailComponent
    - Profile info
    - Booking history
    - Payment history
    - Notes
    - Account actions (activate/deactivate)

20. PricingManagementComponent
    - URL: /admin/pricing
    - Price rules list
    - Active/inactive toggle
    - Add rule button
    - Calendar view

21. PriceRuleFormComponent
    - Type selector
    - Percentage input
    - Date range
    - Min days
    - Vehicle/category selector

22. SeasonalRulesComponent
    - Calendar view
    - Rule markers
    - Add/edit on click
    - Legend

23. PaymentManagementComponent
    - URL: /admin/payments
    - Transaction table
    - Filters (method, status, date)
    - Search
    - Refund action

24. RefundDialogComponent
    - Amount input
    - Reason
    - Confirm
    - Use PaymentService

25. TransactionLogComponent
    - Transaction history
    - Gateway response viewer
    - Status timeline

26. AgencySettingsComponent
    - URL: /admin/settings
    - Agency info form
    - Logo upload
    - Contact details
    - Save with loading

27. CancellationPolicyComponent
    - Free cancel hours input
    - Fee percentages
    - Policy preview
    - Save

28. OpeningHoursComponent
    - Day-by-day hours
    - Closed checkbox
    - JSON editor
    - Save

Routes to add (protected by adminGuard):
- /admin → AdminDashboardComponent
- /admin/vehicles → VehicleManagementComponent
- /admin/vehicles/:id/edit → VehicleFormComponent
- /admin/bookings → BookingManagementComponent
- /admin/bookings/:id → BookingDetailAdminComponent
- /admin/clients → ClientManagementComponent
- /admin/clients/:id → ClientDetailComponent
- /admin/pricing → PricingManagementComponent
- /admin/payments → PaymentManagementComponent
- /admin/settings → AgencySettingsComponent

All components must:
- Follow DESIGN.md styling
- Use shared UI components
- Implement proper loading states
- Handle errors gracefully
- Be fully responsive
- Include proper guards (adminGuard)
- Use Chart.js for graphs
- Implement proper data tables with sorting/filtering
```

---

### Prompt 6: Payment Integration

```
Create payment integration components for Stripe and Paymee. This is Phase 6.

Directory structure:
src/app/features/payment/
  ├── payment-method/
  │   ├── payment-method.component.ts
  │   ├── stripe-payment.component.ts
  │   └── paymee-payment.component.ts
  └── payment-status/
      ├── payment-success.component.ts
      └── payment-failed.component.ts

Components to implement:

1. PaymentMethodComponent
   - Method selection cards
   - Stripe (card)
   - Paymee (Tunisian payment)
   - Cash (in-person)
   - Radio selection
   - Icons and descriptions

2. StripePaymentComponent
   - Stripe Elements integration
   - Card input fields
   - Validation
   - Pay button with loading
   - Error handling
   - Use BookingsService for Stripe intent

3. PaymeePaymentComponent
   - Paymee redirect
   - Payment URL generation
   - Loading state during redirect
   - Success/failure handling
   - Use BookingsService for Paymee initiate

4. PaymentSuccessComponent
   - URL: /payment/success
   - Success message
   - Booking reference
   - Email confirmation note
   - Continue to dashboard button

5. PaymentFailedComponent
   - URL: /payment/failed
   - Error message
   - Retry button
   - Try different method
   - Contact support link

Routes to add:
- /payment/success → PaymentSuccessComponent
- /payment/failed → PaymentFailedComponent

All components must:
- Follow DESIGN.md styling
- Use shared UI components
- Handle payment errors gracefully
- Show loading states
- Be secure (PCI compliance for Stripe)
- Handle webhooks properly
```

---

## 🔧 Additional Requirements

### Services to Create
- `PaymentService` — Payment method handling
- `NotificationService` — CRUD notifications
- `DashboardService` — Admin dashboard data
- `MaintenanceService` — Maintenance CRUD
- `PricingService` — Price rules CRUD
- `UserService` — User profile management

### Guards to Create
- `adminGuard` — Protect admin routes (check role === 'ADMIN')

### Directives to Create
- `ClickOutsideDirective` — Close dropdowns on outside click
- `AutoFocusDirective` — Auto-focus input on mount
- `TooltipDirective` — Show tooltip on hover

### Utilities to Create
- `date.utils.ts` — Date formatting helpers
- `currency.utils.ts` — Currency formatting
- `validators.ts` — Custom form validators

---

## 📋 Implementation Order

1. **Week 1:** Shared UI Components (Prompt 1)
2. **Week 2:** Vehicle Catalog (Prompt 2)
3. **Week 3:** Booking Wizard (Prompt 3)
4. **Week 4:** Client Dashboard (Prompt 4)
5. **Week 5:** Admin Dashboard (Prompt 5)
6. **Week 6:** Payment Integration (Prompt 6)

---

## ✅ Success Criteria

- All components follow DESIGN.md styling
- All components are standalone Angular 17+ components
- All components are fully responsive
- All components have proper TypeScript typing
- All components handle loading and error states
- All routes have proper guards
- All API calls use existing services
- All forms have proper validation
- All pages are accessible (ARIA attributes)
