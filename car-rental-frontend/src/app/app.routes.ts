import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { AuthLayoutComponent } from './features/auth/auth-layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password.component';
import { VerifyEmailComponent } from './features/auth/verify-email.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { VehicleListComponent } from './features/vehicles/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './features/vehicles/vehicle-detail/vehicle-detail.component';
import { ClientLayoutComponent } from './features/client/client-layout.component';
import { ClientDashboardComponent } from './features/client/dashboard/dashboard.component';
import { ProfileComponent } from './features/client/profile/profile.component';
import { MyBookingsComponent } from './features/client/my-bookings/my-bookings.component';
import { BookingDetailComponent } from './features/client/my-bookings/booking-detail.component';
import { NotificationsComponent } from './features/client/notifications/notifications.component';
import { BookingWizardComponent } from './features/booking/booking-wizard/booking-wizard.component';
import { BookingConfirmationComponent } from './features/booking/booking-confirmation/booking-confirmation.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'vehicles', component: VehicleListComponent },
  { path: 'vehicles/:id', component: VehicleDetailComponent },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
      { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'verify-email', component: VerifyEmailComponent },
    ]
  },
  {
    path: 'dashboard',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ClientDashboardComponent },
      { path: 'bookings', component: MyBookingsComponent },
      { path: 'bookings/:id', component: BookingDetailComponent },
      { path: 'history', component: MyBookingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'notifications', component: NotificationsComponent },
    ]
  },
  {
    path: 'booking',
    canActivate: [authGuard],
    children: [
      { path: 'wizard', component: BookingWizardComponent },
      { path: 'confirmation/:id', component: BookingConfirmationComponent },
    ]
  },
  { path: 'payment/success', component: BookingConfirmationComponent },
  { path: 'payment/failed', component: BookingConfirmationComponent },
  { path: '**', component: NotFoundComponent },
];
