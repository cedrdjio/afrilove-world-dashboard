import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, Construction, LucideAngularModule } from 'lucide-angular';

/**
 * Page de module à venir : le squelette des routes est posé dès le Sprint A0,
 * chaque sprint remplace ensuite ce composant par le vrai module.
 */
@Component({
  selector: 'app-coming-soon',
  imports: [LucideAngularModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-[60vh] items-center justify-center animate-fade-up">
      <div class="glass-card flex w-full max-w-xl flex-col items-center gap-5 px-8 py-14 text-center">
        <span
          class="inline-flex size-16 items-center justify-center rounded-3xl bg-brand-500/12 text-brand-600 dark:bg-brand-400/20 dark:text-brand-300"
        >
          <lucide-icon [img]="ConstructionIcon" [size]="30" />
        </span>
        <div>
          <p
            class="mb-3 inline-flex items-center rounded-full bg-lilac/15 px-3 py-1 font-display text-[11px] font-bold tracking-wide text-lilac-dark uppercase dark:bg-lilac/20 dark:text-lilac-light"
          >
            Sprint {{ sprint() }}
          </p>
          <h1 class="font-display text-2xl font-bold text-ink dark:text-cream">{{ title() }}</h1>
          <p class="mt-2 text-sm leading-relaxed text-ink-muted dark:text-cream-bezel2">
            Ce module arrive dans un prochain sprint. La route, la navigation et les
            contrôles d'accès sont déjà en place.
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
export class ComingSoon {
  private readonly route = inject(ActivatedRoute);

  protected readonly ConstructionIcon = Construction;
  protected readonly ArrowLeftIcon = ArrowLeft;

  protected readonly title = computed(() => (this.route.snapshot.data['breadcrumb'] as string) ?? 'Module');
  protected readonly sprint = computed(() => (this.route.snapshot.data['sprint'] as string) ?? '—');
}
