// ═══════════════════════════════════════════════════════════════════════════
// AVATAR COMPONENT — Image + Initials Fallback with Size Variants
// ═══════════════════════════════════════════════════════════════════════════

import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar" [class.avatar--xs]="size() === 'xs'" [class.avatar--sm]="size() === 'sm'" [class.avatar--lg]="size() === 'lg'" [class.avatar--xl]="size() === 'xl'">
      @if (imageUrl()) {
        <img [src]="imageUrl()" [alt]="alt()" class="avatar__image" (error)="onImageError()" loading="lazy" />
      } @else {
        <div class="avatar__initials" [style.background-color]="backgroundColor()">
          {{ initials() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-circle);
      overflow: hidden;
      background: var(--bg-secondary);
      font-family: var(--font-display);
      font-weight: var(--weight-semibold);
      color: #ffffff;
      flex-shrink: 0;
    }

    .avatar--xs {
      width: 24px;
      height: 24px;
      font-size: 0.625rem;
    }

    .avatar--sm {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
    }

    .avatar--md {
      width: 40px;
      height: 40px;
      font-size: 0.875rem;
    }

    .avatar--lg {
      width: 48px;
      height: 48px;
      font-size: 1rem;
    }

    .avatar--xl {
      width: 64px;
      height: 64px;
      font-size: 1.25rem;
    }

    .avatar__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar__initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
    }

    :host-context([data-theme="light"]) .avatar {
      background: rgba(0, 0, 0, 0.05);
    }
  `]
})
export class AvatarComponent {
  readonly imageUrl = input<string | null>(null);
  readonly alt = input('Avatar');
  readonly name = input('');
  readonly size = input<AvatarSize>('md');

  private readonly _hasError = signal(false);

  readonly initials = computed(() => {
    if (this.name()) {
      return this.name()
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '';
  });

  readonly backgroundColor = computed(() => {
    const colors = [
      '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
      '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA'
    ];
    const index = this.initials().charCodeAt(0) % colors.length;
    return colors[index];
  });

  onImageError(): void {
    this._hasError.set(true);
  }
}
