import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, ShieldOff } from 'lucide-angular';

/** 403 — rôle insuffisant (cible du roleGuard). */
@Component({
  selector: 'app-forbidden',
  imports: [LucideAngularModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-[60vh] items-center justify-center animate-fade-up">
      <div class="glass-card flex w-full max-w-xl flex-col items-center gap-5 px-8 py-14 text-center">
        <span class="inline-flex size-16 items-center justify-center rounded-3xl bg-danger/12 text-danger">
          <lucide-icon [img]="ShieldOffIcon" [size]="30" />
        </span>
        <div>
          <p class="font-display text-5xl font-extrabold text-ink dark:text-cream">403</p>
          <h1 class="mt-2 font-display text-xl font-bold text-ink dark:text-cream">Accès refusé</h1>
          <p class="mt-2 text-sm leading-relaxed text-ink-muted dark:text-cream-bezel2">
            Votre rôle ne permet pas d'ouvrir cette page. Contactez un super admin
            si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>
        <a routerLink="/" class="btn-brand">
          <lucide-icon [img]="ArrowLeftIcon" [size]="16" />
          Retour au tableau de bord
        </a>
      </div>
    </section>
  `,
})
export class Forbidden {
  protected readonly ShieldOffIcon = ShieldOff;
  protected readonly ArrowLeftIcon = ArrowLeft;
}
