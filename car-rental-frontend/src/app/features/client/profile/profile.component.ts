// ═══════════════════════════════════════════════════════════════════════════
// PROFILE PAGE — Client Profile Management
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, ProfileUpdateRequest } from '../../../core/models';
import { AvatarUploadComponent } from './avatar-upload.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarUploadComponent],
  template: `
    <div class="profile">
      <!-- Page Header -->
      <div class="profile__header">
        <h1 class="profile__title">Mon profil</h1>
        <p class="profile__subtitle">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <!-- Avatar Upload Component -->
      <app-avatar-upload
        #avatarUpload
        (uploadSuccess)="onAvatarUploaded($event)"
      />

      <!-- Avatar Card -->
      <div class="profile__card">
        <div class="profile__card-header">
          <h2 class="profile__card-title">Photo de profil</h2>
        </div>
        <div class="profile__avatar-section">
          <div class="profile__avatar">
            @if (authService.user()?.avatarUrl) {
              <img [src]="authService.user()!.avatarUrl" [alt]="authService.fullName()" />
            } @else {
              <span class="profile__avatar-initials">{{ getInitials() }}</span>
            }
          </div>
          <div class="profile__avatar-info">
            <p class="profile__avatar-name">{{ authService.fullName() }}</p>
            <p class="profile__avatar-email">{{ authService.user()?.email }}</p>
            <div class="profile__avatar-actions">
              <button class="profile__avatar-btn" type="button" (click)="onChangePhoto()" [disabled]="isDeletingAvatar()">
                Changer la photo
              </button>
              <button
                class="profile__avatar-btn profile__avatar-btn--danger"
                type="button"
                [disabled]="!authService.user()?.avatarUrl || isDeletingAvatar()"
                (click)="onDeleteAvatar()"
              >
                @if (isDeletingAvatar()) {
                  <svg class="profile__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                  </svg>
                }
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Info Card -->
      <form class="profile__card" (ngSubmit)="onSaveProfile()" #profileForm="ngForm">
        <div class="profile__card-header">
          <h2 class="profile__card-title">Informations personnelles</h2>
        </div>
        <div class="profile__card-body">
          <div class="profile__grid">
            <div class="profile__field">
              <label class="profile__label" for="firstName">Prénom</label>
              <input id="firstName" type="text" class="profile__input" [(ngModel)]="form.firstName" name="firstName" required />
            </div>
            <div class="profile__field">
              <label class="profile__label" for="lastName">Nom</label>
              <input id="lastName" type="text" class="profile__input" [(ngModel)]="form.lastName" name="lastName" required />
            </div>
            <div class="profile__field">
              <label class="profile__label" for="email">Email</label>
              <input id="email" type="email" class="profile__input" [(ngModel)]="form.email" name="email" required email />
            </div>
            <div class="profile__field">
              <label class="profile__label" for="phone">Téléphone</label>
              <input id="phone" type="tel" class="profile__input" [(ngModel)]="form.phone" name="phone" placeholder="+216 XX XXX XXX" />
            </div>
          </div>
        </div>
        @if (saveError()) {
          <div class="profile__alert profile__alert--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ saveError() }}
          </div>
        }
        <div class="profile__card-footer">
          <button type="button" class="profile__btn profile__btn--secondary" (click)="resetForm()">Annuler</button>
          <button type="submit" class="profile__btn profile__btn--primary" [disabled]="isSaving()">
            @if (isSaving()) {
              <svg class="profile__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
              </svg>
            }
            Enregistrer les modifications
          </button>
        </div>
      </form>

      <!-- Driver License Card -->
      <form class="profile__card" (ngSubmit)="onSaveProfile()" #licenseForm="ngForm">
        <div class="profile__card-header">
          <h2 class="profile__card-title">Permis de conduire</h2>
          <p class="profile__card-description">Ces informations sont requises pour la location de véhicules.</p>
        </div>
        <div class="profile__card-body">
          <div class="profile__grid">
            <div class="profile__field">
              <label class="profile__label" for="cin">CIN</label>
              <input id="cin" type="text" class="profile__input" [(ngModel)]="form.cin" name="cin" placeholder="12345678" />
            </div>
            <div class="profile__field">
              <label class="profile__label" for="drivingLicense">Numéro de permis</label>
              <input id="drivingLicense" type="text" class="profile__input" [(ngModel)]="form.drivingLicense" name="drivingLicense" placeholder="ABC123456" />
            </div>
            <div class="profile__field profile__field--full">
              <label class="profile__label" for="licenseExpiry">Date d'expiration du permis</label>
              <input id="licenseExpiry" type="date" class="profile__input" [(ngModel)]="form.licenseExpiry" name="licenseExpiry" />
            </div>
          </div>
        </div>
      </form>

      <!-- Password Change Card -->
      <div class="profile__card">
        <div class="profile__card-header">
          <h2 class="profile__card-title">Sécurité</h2>
          <p class="profile__card-description">Modifiez votre mot de passe pour sécuriser votre compte.</p>
        </div>
        <form class="profile__card-body" (ngSubmit)="onChangePassword()" #passwordNgForm="ngForm">
          <div class="profile__field">
            <label class="profile__label" for="currentPassword">Mot de passe actuel</label>
            <input id="currentPassword" type="password" class="profile__input" [(ngModel)]="passwordData.currentPassword" name="currentPassword" required />
          </div>
          <div class="profile__grid">
            <div class="profile__field">
              <label class="profile__label" for="newPassword">Nouveau mot de passe</label>
              <input id="newPassword" type="password" class="profile__input" [(ngModel)]="passwordData.newPassword" name="newPassword" required minlength="8" placeholder="Min. 8 caractères" />
            </div>
            <div class="profile__field">
              <label class="profile__label" for="confirmPassword">Confirmer le mot de passe</label>
              <input id="confirmPassword" type="password" class="profile__input" [(ngModel)]="passwordData.confirmPassword" name="confirmPassword" required />
            </div>
          </div>
          @if (passwordError()) {
            <div class="profile__alert profile__alert--error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {{ passwordError() }}
            </div>
          }
          @if (passwordSuccess()) {
            <div class="profile__alert profile__alert--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {{ passwordSuccess() }}
            </div>
          }
          <div class="profile__card-footer">
            <button type="submit" class="profile__btn profile__btn--primary" [disabled]="isChangingPassword()">
              @if (isChangingPassword()) {
                <svg class="profile__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                </svg>
              }
              Changer le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile {
      max-width: 800px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .profile__header {
      margin-bottom: var(--space-8);
    }

    .profile__title {
      font-family: var(--font-display);
      font-size: 40px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: normal;
      line-height: 1.10;
      margin: 0;
    }

    .profile__subtitle {
      font-family: var(--font-body);
      font-size: 17px;
      font-weight: 400;
      line-height: 1.47;
      letter-spacing: -0.374px;
      color: rgba(0, 0, 0, 0.8);
      margin-top: var(--space-2);
    }

    /* ── Card Layout ── */
    .profile__card {
      background: #f5f5f7;
      border-radius: 8px;
      padding: var(--space-6);
      margin-bottom: var(--space-5);
      border: none;
    }

    .profile__card-header {
      margin-bottom: var(--space-5);
    }

    .profile__card-title {
      font-family: var(--font-display);
      font-size: 21px;
      font-weight: 700;
      line-height: 1.19;
      letter-spacing: 0.231px;
      color: #1d1d1f;
      margin: 0;
    }

    .profile__card-description {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.29;
      letter-spacing: -0.224px;
      color: rgba(0, 0, 0, 0.8);
      margin-top: var(--space-2);
      margin-bottom: 0;
    }

    .profile__card-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .profile__card-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-5);
      padding-top: var(--space-5);
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    /* ── Avatar Section ── */
    .profile__avatar-section {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .profile__avatar {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: #0071e3;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px;
    }
    .profile__avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .profile__avatar-initials {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 600;
      color: #ffffff;
    }

    .profile__avatar-info {
      flex: 1;
    }

    .profile__avatar-name {
      font-family: var(--font-display);
      font-size: 21px;
      font-weight: 600;
      line-height: 1.19;
      letter-spacing: 0.231px;
      color: #1d1d1f;
      margin: 0 0 var(--space-1) 0;
    }

    .profile__avatar-email {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.29;
      letter-spacing: -0.224px;
      color: rgba(0, 0, 0, 0.8);
      margin: 0 0 var(--space-3) 0;
    }

    .profile__avatar-actions {
      display: flex;
      gap: var(--space-2);
    }

    .profile__avatar-btn {
      padding: 8px 15px;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: #ffffff;
      color: #1d1d1f;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 400;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .profile__avatar-btn:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.04);
    }
    .profile__avatar-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .profile__avatar-btn--danger {
      color: #ff3b30;
      border-color: rgba(255, 59, 48, 0.3);
    }
    .profile__avatar-btn--danger:hover:not(:disabled) {
      background: rgba(255, 59, 48, 0.08);
    }

    /* ── Grid ── */
    .profile__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
    }

    .profile__field--full {
      grid-column: 1 / -1;
    }

    @media (max-width: 640px) {
      .profile__grid {
        grid-template-columns: 1fr;
      }
      .profile__avatar-section {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    /* ── Fields ── */
    .profile__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .profile__label {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 600;
      line-height: 1.33;
      letter-spacing: -0.12px;
      color: rgba(0, 0, 0, 0.8);
      text-transform: uppercase;
    }

    .profile__input {
      padding: 11px 14px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background: #ffffff;
      font-family: var(--font-body);
      font-size: 17px;
      font-weight: 400;
      line-height: 1.47;
      letter-spacing: -0.374px;
      color: #1d1d1f;
      outline: none;
      transition: all 0.2s ease;
    }
    .profile__input:focus {
      border-color: #0071e3;
      box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.15);
    }
    .profile__input::placeholder {
      color: rgba(0, 0, 0, 0.48);
    }

    /* ── Alerts ── */
    .profile__alert {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: 8px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.29;
      letter-spacing: -0.224px;
      margin-top: var(--space-4);
    }
    .profile__alert svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .profile__alert--error {
      background: rgba(255, 59, 48, 0.1);
      color: #ff3b30;
    }
    .profile__alert--success {
      background: rgba(52, 199, 89, 0.1);
      color: #34c759;
    }

    /* ── Buttons ── */
    .profile__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: 8px 15px;
      border-radius: 8px;
      font-family: var(--font-body);
      font-size: 17px;
      font-weight: 400;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .profile__btn--primary {
      background: #0071e3;
      color: #ffffff;
    }
    .profile__btn--primary:hover:not(:disabled) {
      background: #0077ed;
    }
    .profile__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .profile__btn--secondary {
      background: transparent;
      color: #0071e3;
      border-color: rgba(0, 0, 0, 0.1);
    }
    .profile__btn--secondary:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .profile__spinner {
      width: 16px;
      height: 16px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  @ViewChild('avatarUpload') avatarUpload!: AvatarUploadComponent;

  readonly isSaving = signal(false);
  readonly isChangingPassword = signal(false);
  readonly isDeletingAvatar = signal(false);
  readonly saveError = signal('');
  readonly passwordError = signal('');
  readonly passwordSuccess = signal('');

  form: ProfileUpdateRequest = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cin: '',
    drivingLicense: '',
    licenseExpiry: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    this.resetForm();
  }

  getInitials(): string {
    const user = this.authService.user();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  resetForm(): void {
    const user = this.authService.user();
    if (user) {
      this.form = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        cin: user.cin || '',
        drivingLicense: user.drivingLicense || '',
        licenseExpiry: user.licenseExpiry || ''
      };
    }
    this.saveError.set('');
  }

  onSaveProfile(): void {
    this.saveError.set('');
    this.isSaving.set(true);

    this.authService.updateProfile(this.form).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastService.success('Profil mis à jour avec succès.');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.saveError.set(err.error?.message || 'Erreur lors de la mise à jour.');
      }
    });
  }

  onChangePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas.');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      this.passwordError.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    this.isChangingPassword.set(true);

    this.authService.changePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordSuccess.set('Mot de passe changé avec succès.');
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.passwordError.set(err.error?.message || 'Erreur lors du changement de mot de passe.');
      }
    });
  }

  onChangePhoto(): void {
    // Trigger the file picker in the avatar upload component
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/webp';
    fileInput.onchange = (e: Event) => {
      this.avatarUpload.onFileSelected(e);
    };
    fileInput.click();
  }

  onAvatarUploaded(avatarUrl: string): void {
    // Avatar is already updated in AuthService by the upload component
    // Just show a success message
    console.log('Avatar uploaded successfully:', avatarUrl);
  }

  async onDeleteAvatar(): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return;
    }

    this.isDeletingAvatar.set(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/users/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authService.token()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Update user in AuthService
      const currentUser = this.authService.user();
      if (currentUser) {
        this.authService.user.set({
          ...currentUser,
          avatarUrl: null
        });
      }

      this.toastService.success('Photo de profil supprimée avec succès');
    } catch (error) {
      console.error('Delete error:', error);
      this.toastService.error('Erreur lors de la suppression de la photo');
    } finally {
      this.isDeletingAvatar.set(false);
    }
  }
}
