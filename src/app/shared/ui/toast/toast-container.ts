import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  CircleAlert,
  CircleCheck,
  Info,
  LucideAngularModule,
  TriangleAlert,
  X,
  type LucideIconData,
} from 'lucide-angular';
import { ToastService, type ToastKind } from '../../../core/services/toast.service';

const KIND_ICON: Record<ToastKind, LucideIconData> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
  warning: TriangleAlert,
};

@Component({
  selector: 'app-toast-container',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed right-4 bottom-4 z-100 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="glass-card pointer-events-auto flex items-start gap-3 p-4 animate-scale-in"
          [class.opacity-0]="toast.leaving"
          [class.translate-y-2]="toast.leaving"
          style="transition: opacity 0.2s, transform 0.2s"
          role="status"
        >
          <lucide-icon
            [img]="icon(toast.kind)"
            [size]="20"
            class="mt-0.5 shrink-0"
            [class.text-success]="toast.kind === 'success'"
            [class.text-danger]="toast.kind === 'error'"
            [class.text-brand-400]="toast.kind === 'info'"
            [class.text-warning]="toast.kind === 'warning'"
          />
          <div class="min-w-0 flex-1">
            <p class="font-display text-sm font-semibold text-ink dark:text-cream">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="mt-0.5 text-xs leading-relaxed text-ink-muted dark:text-cream-bezel2">
                {{ toast.message }}
              </p>
            }
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1 text-ink-faint transition-colors hover:bg-brand-100/60 hover:text-ink dark:hover:bg-white/10 dark:hover:text-cream"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Fermer la notification"
          >
            <lucide-icon [img]="XIcon" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
  protected readonly XIcon = X;

  protected icon(kind: ToastKind): LucideIconData {
    return KIND_ICON[kind];
  }
}
