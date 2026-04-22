import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageKey = 'theme-preference';
  
  private readonly _isDarkMode = signal<boolean>(true); // Default to dark mode
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
    
    effect(() => {
      if (this.isBrowser) {
        this.applyTheme(this._isDarkMode());
        this.saveTheme(this._isDarkMode());
      }
    });
  }

  toggleTheme(): void {
    this._isDarkMode.update(dark => !dark);
  }

  setTheme(isDark: boolean): void {
    this._isDarkMode.set(isDark);
  }

  private loadTheme(): void {
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved !== null) {
        this._isDarkMode.set(saved === 'dark');
      }
    }
  }

  private saveTheme(isDark: boolean): void {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
    }
  }

  private applyTheme(isDark: boolean): void {
    if (this.isBrowser) {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }
}
