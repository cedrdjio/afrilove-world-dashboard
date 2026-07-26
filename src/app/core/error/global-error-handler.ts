import { ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { isChunkLoadError, scheduleShellReload } from '../chunk-loader';
import { ToastService } from '../services/toast.service';

/**
 * Filet de sécurité global : toute erreur non gérée est journalisée et
 * signalée à l'utilisateur par un toast, sans casser l'application.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  // Injector différé pour éviter un cycle ErrorHandler → ToastService au bootstrap.
  private readonly injector = inject(Injector);
  private lastMessage = '';
  private lastShownAt = 0;

  handleError(error: unknown): void {
    console.error(error);

    // Échec de chargement d'un module lazy (souvent une coquille périmée après
    // déploiement) : on répare en rechargeant plutôt que d'afficher une erreur.
    if (isChunkLoadError(error)) {
      scheduleShellReload();
      return;
    }

    const message = this.extractMessage(error);
    const now = Date.now();
    // Anti-rafale : la même erreur répétée n'empile pas les toasts.
    if (message === this.lastMessage && now - this.lastShownAt < 3000) {
      return;
    }
    this.lastMessage = message;
    this.lastShownAt = now;

    try {
      this.injector.get(ToastService).error('Une erreur est survenue', message);
    } catch {
      // ToastService indisponible (erreur au bootstrap) : la console suffit.
    }
  }

  private extractMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Erreur inattendue. Consultez la console pour le détail.';
  }
}
