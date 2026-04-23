# Requirements Document

## Introduction

This document defines the requirements for completing the car rental platform frontend. The application is built with Angular 17+, TypeScript, SCSS, Signals, and Standalone Components. Approximately 58% of the frontend is already implemented — this spec covers the remaining 42%: shared UI components, admin dashboard, payment integration, static pages, and polish/hardening tasks.

The design system follows Apple-inspired aesthetics (glass morphism navigation, SF Pro typography, Apple Blue `#0071e3` as the sole accent, alternating black/`#f5f5f7` section backgrounds). All new components must be visually consistent with existing components.

The backend NestJS API runs at `http://localhost:3000`. The Angular dev server runs at `http://localhost:41577`.

---

## Glossary

- **Application**: The Angular 17+ car rental frontend SPA.
- **Admin**: An authenticated user with the `ADMIN` role.
- **Client**: An authenticated user with the `CLIENT` role.
- **Guest**: An unauthenticated visitor.
- **Booking Wizard**: The existing 5-step booking flow at `/booking/wizard`.
- **Design System**: The Apple-inspired component library defined in `DESIGN.md`.
- **API**: The NestJS backend at `http://localhost:3000`.
- **Signal**: An Angular reactive primitive (`signal()`, `computed()`) used for local state.
- **Standalone Component**: An Angular component declared with `standalone: true`, no NgModules.
- **Lazy Module**: A feature route group loaded via `loadComponent` or `loadChildren` for code splitting.
- **Toast**: A transient notification message rendered by the existing `ToastComponent`.
- **Guard**: An Angular route guard function (`CanActivateFn`).
- **adminGuard**: The existing route guard that allows only `ADMIN`-role users.
- **authGuard**: The existing route guard that requires any authenticated user.
- **Paymee**: A Tunisian payment gateway using a redirect-based flow.
- **Stripe**: A card payment gateway using Stripe Elements (client-side SDK).
- **KPI**: Key Performance Indicator — a numeric metric displayed on the admin dashboard.
- **WCAG**: Web Content Accessibility Guidelines 2.1 Level AA.
- **SEO**: Search Engine Optimization via Angular `Title` and `Meta` services.
- **Skeleton**: A placeholder loading animation that mimics the shape of content before it loads.

---

## Requirements

---

### Requirement 1: Notification Service and Wiring

**User Story:** As a Client, I want to see my notifications in the dashboard so that I stay informed about booking updates and system messages.

#### Acceptance Criteria

1. THE `NotificationService` SHALL expose `getNotifications()`, `markAsRead(id)`, `markAllAsRead()`, and `getUnreadCount()` methods that call the corresponding API endpoints.
2. WHEN the `NotificationsComponent` initialises, THE `NotificationsComponent` SHALL call `NotificationService.getNotifications()` and render the returned notification items.
3. WHEN a Client marks a notification as read, THE `NotificationService` SHALL call `PATCH /notifications/:id/read` and update the local notifications Signal.
4. WHEN a Client clicks "Mark all as read", THE `NotificationService` SHALL call `PATCH /notifications/read-all` and set all local notifications to read.
5. THE `NavComponent` SHALL display an unread-count badge on the notification icon, sourced from `NotificationService.getUnreadCount()`.
6. IF the API returns an error, THEN THE `NotificationsComponent` SHALL display an error Toast and show the `EmptyStateComponent`.

---

### Requirement 2: Missing Routes Registration

**User Story:** As a user, I want all application URLs to resolve to the correct page so that I never encounter a blank screen or routing error.

#### Acceptance Criteria

1. THE `app.routes.ts` SHALL register `/payment/success` mapped to `PaymentSuccessComponent`.
2. THE `app.routes.ts` SHALL register `/payment/failed` mapped to `PaymentFailedComponent`.
3. THE `app.routes.ts` SHALL register `/dashboard/history` (under the authenticated `dashboard` route group) mapped to `RentalHistoryComponent`.
4. THE `app.routes.ts` SHALL register a wildcard route `**` mapped to `NotFoundComponent` as the last entry in the routes array.
5. WHEN a Guest navigates to any unregistered URL, THE Application SHALL render `NotFoundComponent` without redirecting.

---

### Requirement 3: 404 Not Found Page

**User Story:** As a user, I want a clear 404 page when I navigate to a non-existent URL so that I understand the page does not exist and can return to the application.

#### Acceptance Criteria

1. THE `NotFoundComponent` SHALL display a headline indicating the page was not found.
2. THE `NotFoundComponent` SHALL display a link that navigates the user to `/` (home).
3. THE `NotFoundComponent` SHALL follow the Design System: Apple-inspired layout, `#f5f5f7` background, `#1d1d1f` text, Apple Blue `#0071e3` for the home link.
4. THE `NotFoundComponent` SHALL be a Standalone Component with no external data dependencies.

---

### Requirement 4: Landing Page — Fleet Preview

**User Story:** As a Guest, I want to see featured vehicles on the landing page so that I can quickly discover available cars and be encouraged to browse the catalog.

#### Acceptance Criteria

1. WHEN the landing page loads, THE `FleetPreviewComponent` SHALL call `VehicleService` to fetch 4–6 featured vehicles.
2. THE `FleetPreviewComponent` SHALL render each vehicle using the existing `VehicleCardComponent`.
3. THE `FleetPreviewComponent` SHALL display a "View all vehicles" link that navigates to `/vehicles`.
4. WHILE vehicles are loading, THE `FleetPreviewComponent` SHALL display skeleton placeholders matching the `VehicleCardComponent` dimensions.
5. IF the API returns an error, THEN THE `FleetPreviewComponent` SHALL display the `EmptyStateComponent` with a retry action.
6. THE `FleetPreviewComponent` SHALL be responsive: 3 columns on desktop (≥1024px), 2 columns on tablet (640–1023px), 1 column on mobile (<640px).

---

### Requirement 5: Landing Page — Testimonials

**User Story:** As a Guest, I want to read client testimonials on the landing page so that I can build trust in the service before booking.

#### Acceptance Criteria

1. THE `TestimonialsComponent` SHALL display at least 4 static testimonial entries, each containing a client name, rating (1–5 stars), and review text.
2. THE `TestimonialsComponent` SHALL render testimonials in a horizontally scrollable carousel on mobile (<640px) and a grid on desktop (≥640px).
3. THE `TestimonialsComponent` SHALL follow the Design System: dark section background (`#000000`), white text, star icons in Apple Blue `#0071e3`.
4. THE `TestimonialsComponent` SHALL be a Standalone Component with no API dependency (static data).

---

### Requirement 6: Shared UI — Badge Component

**User Story:** As a developer, I want a reusable `BadgeComponent` so that booking statuses, vehicle categories, and priority labels are displayed consistently across the application.

#### Acceptance Criteria

1. THE `BadgeComponent` SHALL accept `label` (string), `color` (enum: `default | success | warning | danger | info`), and `size` (enum: `sm | md`) inputs.
2. THE `BadgeComponent` SHALL render the label text inside a pill-shaped container with the appropriate background and text color for each `color` variant.
3. THE `BadgeComponent` SHALL be a Standalone Component importable by any feature component.
4. THE `BadgeComponent` SHALL meet WCAG 2.1 AA color contrast requirements for all color variants.

---

### Requirement 7: Shared UI — Loader Component

**User Story:** As a developer, I want a reusable `LoaderComponent` so that loading states are communicated consistently to users across all data-fetching scenarios.

#### Acceptance Criteria

1. THE `LoaderComponent` SHALL support three variants via a `variant` input: `spinner`, `skeleton`, and `progress`.
2. WHEN `variant` is `skeleton`, THE `LoaderComponent` SHALL accept `width`, `height`, and `borderRadius` inputs to render a shimmer placeholder of the specified dimensions.
3. THE `LoaderComponent` SHALL be a Standalone Component.
4. THE `LoaderComponent` SHALL include an `aria-label="Loading"` attribute for screen reader accessibility.

---

### Requirement 8: Shared UI — Empty State Component

**User Story:** As a developer, I want a reusable `EmptyStateComponent` so that empty lists and error states are communicated clearly and consistently.

#### Acceptance Criteria

1. THE `EmptyStateComponent` SHALL accept `icon` (string, Lucide icon name), `title` (string), `description` (string), and an optional `actionLabel` (string) with an `action` output event.
2. WHEN `actionLabel` is provided, THE `EmptyStateComponent` SHALL render a `ButtonComponent` that emits the `action` event when clicked.
3. THE `EmptyStateComponent` SHALL be a Standalone Component.
4. THE `EmptyStateComponent` SHALL follow the Design System typography and spacing.

---

### Requirement 9: Shared UI — Pagination Component

**User Story:** As a developer, I want a reusable `PaginationComponent` so that all paginated data tables share consistent navigation controls.

#### Acceptance Criteria

1. THE `PaginationComponent` SHALL accept `currentPage` (number), `totalItems` (number), and `pageSize` (number) inputs.
2. THE `PaginationComponent` SHALL emit a `pageChange` output event with the new page number when a page control is clicked.
3. THE `PaginationComponent` SHALL display "Previous" and "Next" controls, disabling "Previous" on page 1 and "Next" on the last page.
4. THE `PaginationComponent` SHALL display the current page range (e.g., "Showing 1–10 of 47").
5. THE `PaginationComponent` SHALL be a Standalone Component.

---

### Requirement 10: Shared UI — Select Component

**User Story:** As a developer, I want a reusable `SelectComponent` so that all dropdown selections in forms and filters are consistent and accessible.

#### Acceptance Criteria

1. THE `SelectComponent` SHALL accept `options` (array of `{label, value}`), `placeholder` (string), `multiple` (boolean), and `searchable` (boolean) inputs.
2. THE `SelectComponent` SHALL implement `ControlValueAccessor` to integrate with Angular Reactive Forms.
3. WHEN `searchable` is `true`, THE `SelectComponent` SHALL render a text input that filters the options list in real time.
4. WHEN the dropdown is open and the user clicks outside the component, THE `SelectComponent` SHALL close the dropdown using `ClickOutsideDirective`.
5. THE `SelectComponent` SHALL be keyboard navigable (arrow keys to move, Enter to select, Escape to close).
6. THE `SelectComponent` SHALL be a Standalone Component.

---

### Requirement 11: Shared UI — Avatar Component

**User Story:** As a developer, I want a reusable `AvatarComponent` so that user profile images are displayed consistently with a graceful fallback.

#### Acceptance Criteria

1. THE `AvatarComponent` SHALL accept `src` (string | null), `name` (string), and `size` (enum: `xs | sm | md | lg | xl`) inputs.
2. WHEN `src` is null or the image fails to load, THE `AvatarComponent` SHALL display the user's initials derived from `name` on a colored background.
3. THE `AvatarComponent` SHALL be a Standalone Component.

---

### Requirement 12: Shared UI — Breadcrumbs Component

**User Story:** As a developer, I want a reusable `BreadcrumbsComponent` so that users always know their location within the application hierarchy.

#### Acceptance Criteria

1. THE `BreadcrumbsComponent` SHALL accept an `items` input of type `Array<{label: string, route?: string}>`.
2. THE `BreadcrumbsComponent` SHALL render each item as a link when `route` is provided, and as plain text for the last (current) item.
3. THE `BreadcrumbsComponent` SHALL separate items with a chevron (`›`) separator.
4. THE `BreadcrumbsComponent` SHALL render a `<nav aria-label="Breadcrumb">` wrapper for accessibility.
5. THE `BreadcrumbsComponent` SHALL be a Standalone Component.

---

### Requirement 13: Shared UI — Date Picker Component

**User Story:** As a developer, I want a reusable `DatePickerComponent` so that date selection in booking forms and admin filters is consistent and accessible.

#### Acceptance Criteria

1. THE `DatePickerComponent` SHALL support `mode` input (enum: `single | range`) for single-date and date-range selection.
2. THE `DatePickerComponent` SHALL accept `minDate`, `maxDate`, and `disabledDates` (array of Date) inputs.
3. THE `DatePickerComponent` SHALL implement `ControlValueAccessor` to integrate with Angular Reactive Forms.
4. WHEN `mode` is `range`, THE `DatePickerComponent` SHALL emit a `{start: Date, end: Date}` value.
5. THE `DatePickerComponent` SHALL open in a CDK overlay positioned below the trigger input.
6. THE `DatePickerComponent` SHALL be a Standalone Component.

---

### Requirement 14: Shared UI — Directives

**User Story:** As a developer, I want `ClickOutsideDirective` and `AutoFocusDirective` so that dropdown and modal interactions behave correctly without duplicating logic.

#### Acceptance Criteria

1. THE `ClickOutsideDirective` SHALL emit a `clickOutside` output event when a click occurs outside the host element.
2. THE `AutoFocusDirective` SHALL call `focus()` on the host element after the view initialises (`ngAfterViewInit`).
3. BOTH directives SHALL be Standalone and importable by any component.

---

### Requirement 15: Admin Layout Shell

**User Story:** As an Admin, I want a consistent admin layout with a sidebar and header so that I can navigate between all admin sections efficiently.

#### Acceptance Criteria

1. THE `AdminLayoutComponent` SHALL render `AdminSidebarComponent`, `AdminHeaderComponent`, and a `<router-outlet>` for child routes.
2. THE `AdminSidebarComponent` SHALL display navigation links for: Dashboard, Vehicles, Bookings, Clients, Pricing, Payments, and Settings.
3. THE `AdminSidebarComponent` SHALL highlight the active route link using Angular's `routerLinkActive` directive.
4. THE `AdminSidebarComponent` SHALL collapse to an icon-only rail on tablet (640–1023px) and hide behind a hamburger toggle on mobile (<640px).
5. THE `AdminHeaderComponent` SHALL display the current page title, a notifications bell with unread count, and a user menu with logout.
6. ALL admin routes SHALL be protected by `adminGuard`.
7. THE `AdminLayoutComponent` SHALL be lazy-loaded via `loadComponent` in `app.routes.ts`.

---

### Requirement 16: Admin Dashboard Overview

**User Story:** As an Admin, I want a dashboard overview page with KPIs and charts so that I can monitor the business at a glance.

#### Acceptance Criteria

1. WHEN the admin dashboard loads, THE `AdminDashboardComponent` SHALL call `DashboardService.getKPIs()` and display the results in `StatCardsComponent`.
2. THE `StatCardsComponent` SHALL display at minimum 4 KPI cards: total revenue, total bookings, fleet occupancy rate, and total active clients.
3. EACH KPI card SHALL display a trend indicator (up/down arrow with percentage change vs. previous period).
4. THE `RevenueChartComponent` SHALL render a Chart.js line chart of monthly revenue for the selected year, sourced from `DashboardService.getRevenueChart()`.
5. THE `OccupancyChartComponent` SHALL render a Chart.js bar chart of fleet occupancy rate per month, sourced from `DashboardService.getOccupancyChart()`.
6. THE `RecentBookingsComponent` SHALL display the 10 most recent bookings in a table with columns: reference, client name, vehicle, dates, status badge, and a link to the booking detail.
7. THE `AlertsComponent` SHALL display active maintenance alerts and low-availability warnings, each dismissable by the Admin.
8. WHILE any data section is loading, THE `AdminDashboardComponent` SHALL display `LoaderComponent` skeleton placeholders.

---

### Requirement 17: Admin Vehicle Management

**User Story:** As an Admin, I want to create, edit, and manage vehicles so that the fleet catalog stays accurate and up to date.

#### Acceptance Criteria

1. THE `VehicleManagementComponent` SHALL display all vehicles in a paginated table using `PaginationComponent`, with columns: image thumbnail, name, category, status badge, daily rate, and action buttons (edit, toggle status).
2. THE `VehicleManagementComponent` SHALL include a search input that filters vehicles by name or category in real time (debounced 300ms).
3. WHEN an Admin clicks "Add Vehicle", THE Application SHALL navigate to `/admin/vehicles/new` and render `VehicleFormComponent` in create mode.
4. WHEN an Admin clicks "Edit" on a vehicle row, THE Application SHALL navigate to `/admin/vehicles/:id/edit` and render `VehicleFormComponent` in edit mode pre-populated with the vehicle's data.
5. THE `VehicleFormComponent` SHALL include fields for: name, brand, model, year, category, fuel type, transmission, seats, daily rate, description, features, and image upload.
6. WHEN an Admin submits a valid `VehicleFormComponent`, THE `VehicleManagementComponent` SHALL call the API and display a success Toast on completion.
7. IF the API returns a validation error, THEN THE `VehicleFormComponent` SHALL display field-level error messages.
8. THE `VehicleStatusComponent` SHALL render a dropdown allowing the Admin to change a vehicle's status to `AVAILABLE`, `RENTED`, `MAINTENANCE`, or `OUT_OF_SERVICE`.
9. THE `MaintenanceCalendarComponent` SHALL display scheduled maintenance periods for all vehicles in a calendar view.
10. THE `MaintenanceFormComponent` SHALL allow an Admin to create or edit a maintenance record with fields: vehicle, start date, end date, type, and notes.

---

### Requirement 18: Admin Booking Management

**User Story:** As an Admin, I want to view and manage all bookings so that I can handle status updates, disputes, and client requests.

#### Acceptance Criteria

1. THE `BookingManagementComponent` SHALL display all bookings in a paginated, sortable table using `BookingTableComponent` and `PaginationComponent`.
2. THE `BookingTableComponent` SHALL support filtering by status, date range, and client name.
3. WHEN an Admin clicks a booking row, THE Application SHALL navigate to `/admin/bookings/:id` and render `BookingDetailAdminComponent`.
4. THE `BookingDetailAdminComponent` SHALL display full booking information: client details, vehicle details, rental period, price breakdown, payment status, and admin notes field.
5. THE `StatusUpdateComponent` SHALL render a dropdown of valid next statuses for the booking's current state and require confirmation before applying the change.
6. WHEN an Admin updates a booking status, THE `BookingManagementComponent` SHALL call the API and display a success Toast.

---

### Requirement 19: Admin Client Management

**User Story:** As an Admin, I want to view and manage client accounts so that I can assist clients and monitor account activity.

#### Acceptance Criteria

1. THE `ClientManagementComponent` SHALL display all clients in a paginated, searchable table using `ClientTableComponent`.
2. THE `ClientTableComponent` SHALL display columns: avatar, full name, email, phone, registration date, booking count, and account status.
3. WHEN an Admin clicks a client row, THE Application SHALL navigate to `/admin/clients/:id` and render `ClientDetailComponent`.
4. THE `ClientDetailComponent` SHALL display the client's profile information and their full booking history.
5. THE `ClientDetailComponent` SHALL allow the Admin to deactivate or reactivate the client's account with a confirmation dialog.

---

### Requirement 20: Admin Pricing Management

**User Story:** As an Admin, I want to create and manage pricing rules so that seasonal rates and promotions are applied automatically to bookings.

#### Acceptance Criteria

1. THE `PricingManagementComponent` SHALL display all price rules in a list with columns: name, type, adjustment percentage, date range, and active toggle.
2. WHEN an Admin clicks "Add Rule", THE `PricingManagementComponent` SHALL open `PriceRuleFormComponent` in a modal.
3. THE `PriceRuleFormComponent` SHALL include fields for: rule name, type (seasonal/promotional/weekend), adjustment percentage, start date, end date, and minimum rental days.
4. THE `SeasonalRulesComponent` SHALL display active price rules on a calendar view so the Admin can visualise overlapping rules.
5. WHEN an Admin toggles a rule's active state, THE `PricingService` SHALL call the API and update the list.

---

### Requirement 21: Admin Payment Management

**User Story:** As an Admin, I want to view transactions and process refunds so that payment issues are resolved efficiently.

#### Acceptance Criteria

1. THE `PaymentManagementComponent` SHALL display all transactions in a paginated table with columns: booking reference, client, amount, payment method, status badge, and date.
2. THE `PaymentManagementComponent` SHALL support filtering by payment method (Stripe/Paymee/Cash) and status.
3. WHEN an Admin clicks "Refund" on a transaction, THE `RefundDialogComponent` SHALL open in a modal with fields for refund amount and reason.
4. WHEN an Admin confirms a refund, THE `PaymentService` SHALL call the API and display a success Toast.
5. THE `TransactionLogComponent` SHALL display the raw gateway response for each transaction, expandable on click.

---

### Requirement 22: Admin Settings

**User Story:** As an Admin, I want to configure agency settings, cancellation policies, and opening hours so that the platform reflects the agency's operational rules.

#### Acceptance Criteria

1. THE `AgencySettingsComponent` SHALL display a form with fields for: agency name, address, phone, email, and logo upload.
2. WHEN an Admin submits the `AgencySettingsComponent` form, THE Application SHALL call `PUT /settings/agency` and display a success Toast.
3. THE `CancellationPolicyComponent` SHALL display editable fee percentages for each cancellation window (e.g., >48h: 0%, 24–48h: 25%, <24h: 50%).
4. THE `OpeningHoursComponent` SHALL display a day-by-day schedule editor where each day can be toggled open/closed with configurable open and close times.

---

### Requirement 23: Payment Service

**User Story:** As a developer, I want a `PaymentService` so that payment gateway interactions are encapsulated and reusable across the booking wizard and admin dashboard.

#### Acceptance Criteria

1. THE `PaymentService` SHALL expose `initiatePaymee(bookingId: string)` that calls `POST /payments/paymee/initiate` and returns the redirect URL.
2. THE `PaymentService` SHALL expose `createStripeIntent(bookingId: string)` that calls `POST /payments/stripe/create-intent` and returns the `clientSecret`.
3. THE `PaymentService` SHALL expose `getTransactions(params)` for admin use, calling `GET /payments` with filter parameters.
4. THE `PaymentService` SHALL expose `processRefund(transactionId, amount, reason)` calling `POST /payments/:id/refund`.
5. IF any payment API call returns an error, THEN THE `PaymentService` SHALL propagate the error so the calling component can display a Toast.

---

### Requirement 24: Payment Components

**User Story:** As a Client, I want to pay for my booking using Stripe or Paymee so that I can complete my reservation securely.

#### Acceptance Criteria

1. THE `PaymentMethodComponent` SHALL display selectable payment method cards: Stripe (card), Paymee (redirect), and Cash on pickup.
2. WHEN a Client selects Stripe, THE `StepPaymentComponent` SHALL render `StripePaymentComponent` with a Stripe Elements card input.
3. WHEN a Client selects Paymee, THE `StepPaymentComponent` SHALL render `PaymeePaymentComponent` which calls `PaymentService.initiatePaymee()` and redirects the browser to the returned URL.
4. WHEN a Client selects Cash, THE `StepPaymentComponent` SHALL display a confirmation message that payment is due at pickup.
5. WHEN Stripe payment succeeds, THE Application SHALL navigate to `/payment/success` with the booking reference as a query parameter.
6. WHEN Stripe payment fails, THE Application SHALL navigate to `/payment/failed` with an error code as a query parameter.

---

### Requirement 25: Payment Success and Failed Pages

**User Story:** As a Client, I want clear feedback after a payment attempt so that I know whether my booking is confirmed or if I need to retry.

#### Acceptance Criteria

1. THE `PaymentSuccessComponent` SHALL display a success icon, a confirmation message, and the booking reference number read from the `bookingRef` query parameter.
2. THE `PaymentSuccessComponent` SHALL display a link to `/dashboard/bookings` and a note that a confirmation email has been sent.
3. THE `PaymentFailedComponent` SHALL display an error icon, an error message, and a "Try again" button that navigates back to the booking wizard.
4. THE `PaymentFailedComponent` SHALL display a contact support link.
5. BOTH components SHALL follow the Design System and be Standalone Components.

---

### Requirement 26: Client Avatar Upload

**User Story:** As a Client, I want to upload a profile photo so that my account feels personalised.

#### Acceptance Criteria

1. THE `AvatarUploadComponent` SHALL render a circular image preview of the current avatar (or initials fallback via `AvatarComponent`).
2. WHEN a Client clicks the avatar, THE `AvatarUploadComponent` SHALL open a file picker accepting `image/jpeg` and `image/png` files up to 5MB.
3. IF the selected file exceeds 5MB or is not a supported image type, THEN THE `AvatarUploadComponent` SHALL display an inline error message and SHALL NOT upload the file.
4. WHEN a valid file is selected, THE `AvatarUploadComponent` SHALL call `POST /upload/image` and update the user's avatar URL via `AuthService`.
5. WHILE the upload is in progress, THE `AvatarUploadComponent` SHALL display a loading spinner over the avatar preview.

---

### Requirement 27: Client Rental History

**User Story:** As a Client, I want to view my complete rental history so that I can track past bookings and download receipts.

#### Acceptance Criteria

1. WHEN the `RentalHistoryComponent` loads, THE `RentalHistoryComponent` SHALL call `BookingService` to fetch all completed bookings for the current user.
2. THE `RentalHistoryComponent` SHALL display bookings in a table with columns: vehicle name, rental period, total amount, payment method, and status badge.
3. THE `RentalHistoryComponent` SHALL support filtering by date range using `DatePickerComponent` in range mode.
4. THE `RentalHistoryComponent` SHALL support pagination using `PaginationComponent`.
5. WHILE data is loading, THE `RentalHistoryComponent` SHALL display `LoaderComponent` skeleton rows.
6. IF no completed bookings exist, THEN THE `RentalHistoryComponent` SHALL display `EmptyStateComponent` with the message "No rental history yet".

---

### Requirement 28: Static Pages

**User Story:** As a Guest or Client, I want to access informational pages (About, Contact, FAQ, Terms, Privacy) so that I can learn about the agency and understand the service terms.

#### Acceptance Criteria

1. THE Application SHALL register routes `/about`, `/contact`, `/faq`, `/terms`, and `/privacy` in `app.routes.ts`.
2. THE `AboutComponent` SHALL display agency information including a description, team section, and values.
3. THE `ContactComponent` SHALL display a contact form with fields for name, email, subject, and message, and SHALL call `POST /contact` on submission.
4. THE `FaqComponent` SHALL display a list of FAQ items in an accordion pattern where clicking a question expands/collapses the answer.
5. THE `TermsComponent` and `PrivacyComponent` SHALL display static legal text with section headings.
6. ALL static page components SHALL be Standalone Components following the Design System.

---

### Requirement 29: Lazy Loading and Code Splitting

**User Story:** As a user, I want the application to load quickly so that I can start browsing without waiting for unnecessary code to download.

#### Acceptance Criteria

1. THE `admin` route group SHALL be lazy-loaded using `loadComponent` or `loadChildren` so that admin code is not included in the initial bundle.
2. THE `booking` route group SHALL be lazy-loaded so that booking wizard code is not included in the initial bundle.
3. THE `payment` route group SHALL be lazy-loaded so that payment gateway SDKs are not included in the initial bundle.
4. THE Application SHALL use Angular's `@defer` blocks for below-the-fold landing page sections (`FleetPreviewComponent`, `TestimonialsComponent`).

---

### Requirement 30: SEO and Meta Tags

**User Story:** As a product owner, I want each page to have appropriate title and meta tags so that the application is discoverable by search engines and shares correctly on social media.

#### Acceptance Criteria

1. WHEN a user navigates to any page, THE Application SHALL update the browser `<title>` using Angular's `Title` service with the format `[Page Name] — Car Rental`.
2. THE Application SHALL set `<meta name="description">` on each public page using Angular's `Meta` service.
3. THE landing page (`/`) SHALL have a title of `Car Rental — Premium Vehicle Rental` and a descriptive meta description.
4. THE `NotFoundComponent` SHALL set the title to `Page Not Found — Car Rental`.

---

### Requirement 31: Accessibility

**User Story:** As a user with a disability, I want the application to be navigable with a keyboard and screen reader so that I can use the service independently.

#### Acceptance Criteria

1. ALL interactive elements (buttons, links, form inputs, dropdowns) SHALL have visible focus indicators using the Design System focus ring (`2px solid #0071e3`).
2. ALL modal dialogs SHALL trap keyboard focus within the modal while open and restore focus to the trigger element when closed.
3. ALL images SHALL have descriptive `alt` attributes; decorative images SHALL have `alt=""`.
4. ALL form inputs SHALL have associated `<label>` elements or `aria-label` attributes.
5. THE `AdminSidebarComponent` navigation SHALL include `aria-current="page"` on the active link.
6. THE `PaginationComponent` SHALL include `aria-label` attributes on Previous/Next controls and `aria-current="page"` on the current page button.

---

### Requirement 32: Admin Guard Redirect Fix

**User Story:** As an Admin, I want to be redirected to `/admin` after login so that I land directly in the admin dashboard instead of the client home page.

#### Acceptance Criteria

1. WHEN an authenticated Admin navigates to `/`, THE `guestGuard` (or a dedicated redirect) SHALL redirect the Admin to `/admin`.
2. WHEN an authenticated Admin navigates to any `/auth/*` route, THE `guestGuard` SHALL redirect the Admin to `/admin` instead of `/`.
3. WHEN an unauthenticated user attempts to access any `/admin/*` route, THE `adminGuard` SHALL redirect to `/auth/login` with a `returnUrl` query parameter.
