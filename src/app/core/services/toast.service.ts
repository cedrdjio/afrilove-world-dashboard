import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  /** Passe à true le temps de l'animation de sortie. */
  leaving?: boolean;
}

const AUTO_DISMISS_MS = 4500;
const LEAVE_MS = 220;

/** Notifications applicatives (toasts de verre, coin bas droit). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  success(title: string, message?: string): void {
    this.push('success', title, message);
  }

  error(title: string, message?: string): void {
    this.push('error', title, message);
  }

  info(title: string, message?: string): void {
    this.push('info', title, message);
  }

  warning(title: string, message?: string): void {
    this.push('warning', title, message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) =>
      list.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    );
    setTimeout(() => {
      this.toasts.update((list) => list.filter((toast) => toast.id !== id));
    }, LEAVE_MS);
  }

  private push(kind: ToastKind, title: string, message?: string): void {
    const toast: Toast = { id: this.nextId++, kind, title, message };
    this.toasts.update((list) => [...list.slice(-3), toast]);
    setTimeout(() => this.dismiss(toast.id), AUTO_DISMISS_MS);
  }
}
