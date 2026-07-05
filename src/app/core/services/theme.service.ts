import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

const STORAGE_KEY = 'alw-admin-theme';

export type Theme = 'light' | 'dark';

/**
 * Mode sombre natif : classe `.dark` sur <html>, persistance locale et
 * préférence système en valeur par défaut (pré-appliquée dans index.html).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly theme = signal<Theme>(
    this.document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.classList.toggle('dark', theme === 'dark');
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Stockage indisponible (navigation privée) : le choix vaut pour la session.
      }
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }
}
