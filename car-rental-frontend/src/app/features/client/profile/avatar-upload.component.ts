// ═══════════════════════════════════════════════════════════════════════════
// AVATAR UPLOAD COMPONENT — Image Upload with Preview
// ═══════════════════════════════════════════════════════════════════════════

import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hidden File Input -->
    <input
      #fileInput
      type="file"
      accept="image/jpeg,image/png,image/webp"
      (change)="onFileSelected($event)"
      style="display: none"
    />

    <!-- Preview Modal -->
    @if (previewUrl()) {
      <div class="modal-overlay" (click)="cancelUpload()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h2 class="modal__title">Aperçu de la photo</h2>
            <button class="modal__close" (click)="cancelUpload()" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="preview">
              <img [src]="previewUrl()" alt="Preview" class="preview__image" />
            </div>
            <p class="preview__info">
              {{ selectedFile()?.name }} ({{ formatFileSize(selectedFile()?.size || 0) }})
            </p>
          </div>
          <div class="modal__footer">
            <button class="modal__btn modal__btn--secondary" (click)="cancelUpload()" type="button">
              Annuler
            </button>
            <button
              class="modal__btn modal__btn--primary"
              (click)="confirmUpload()"
              [disabled]="isUploading()"
              type="button"
            >
              @if (isUploading()) {
                <svg class="modal__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                </svg>
              }
              Télécharger
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ── Modal Overlay ── */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }

    .modal {
      background: #f5f5f7;
      border-radius: 12px;
      max-width: 500px;
      width: 100%;
      box-shadow: rgba(0, 0, 0, 0.22) 3px 5px 30px 0px;
      animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ── Modal Header ── */
    .modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .modal__title {
      font-family: var(--font-display);
      font-size: 21px;
      font-weight: 700;
      line-height: 1.19;
      letter-spacing: 0.231px;
      color: #1d1d1f;
      margin: 0;
    }

    .modal__close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: rgba(0, 0, 0, 0.8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .modal__close svg {
      width: 20px;
      height: 20px;
    }
    .modal__close:hover {
      background: rgba(0, 0, 0, 0.08);
    }

    /* ── Modal Body ── */
    .modal__body {
      padding: var(--space-6);
    }

    .preview {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-3);
    }

    .preview__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview__info {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.29;
      letter-spacing: -0.224px;
      color: rgba(0, 0, 0, 0.8);
      text-align: center;
      margin: 0;
    }

    /* ── Modal Footer ── */
    .modal__footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-5);
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .modal__btn {
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

    .modal__btn--primary {
      background: #0071e3;
      color: #ffffff;
    }
    .modal__btn--primary:hover:not(:disabled) {
      background: #0077ed;
    }
    .modal__btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal__btn--secondary {
      background: transparent;
      color: #0071e3;
      border-color: rgba(0, 0, 0, 0.1);
    }
    .modal__btn--secondary:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    .modal__spinner {
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
export class AvatarUploadComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isUploading = signal(false);

  uploadSuccess = output<string>();
  uploadError = output<string>();

  openFilePicker(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.toastService.error('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error('La taille du fichier ne doit pas dépasser 5 MB.');
      return;
    }

    this.selectedFile.set(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async confirmUpload() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('http://localhost:3000/api/v1/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authService.token()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update user in AuthService
      const currentUser = this.authService.user();
      if (currentUser) {
        this.authService.user.set({
          ...currentUser,
          avatarUrl: data.avatarUrl
        });
      }

      this.toastService.success('Photo de profil mise à jour avec succès');
      this.uploadSuccess.emit(data.avatarUrl);
      this.cancelUpload();
    } catch (error) {
      console.error('Upload error:', error);
      this.toastService.error('Erreur lors du téléchargement de la photo');
      this.uploadError.emit('Upload failed');
    } finally {
      this.isUploading.set(false);
    }
  }

  cancelUpload() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
