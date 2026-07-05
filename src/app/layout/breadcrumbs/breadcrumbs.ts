import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, type ActivatedRouteSnapshot } from '@angular/router';
import { ChevronRight, House, LucideAngularModule } from 'lucide-angular';
import { filter, map, startWith } from 'rxjs';
import type { Breadcrumb } from '../../models/nav.model';

/** Fil d'Ariane construit depuis `data.breadcrumb` des routes actives. */
@Component({
  selector: 'app-breadcrumbs',
  imports: [LucideAngularModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Fil d'Ariane" class="flex items-center gap-1.5 text-sm">
      <a
        routerLink="/"
        class="inline-flex items-center text-ink-faint transition-colors hover:text-brand-500 dark:text-cream-bezel2/70 dark:hover:text-cream"
        aria-label="Tableau de bord"
      >
        <lucide-icon [img]="HouseIcon" [size]="15" />
      </a>
      @for (crumb of breadcrumbs(); track crumb.url; let last = $last) {
        <lucide-icon [img]="ChevronRightIcon" [size]="13" class="text-ink-faint/60 dark:text-cream-bezel2/40" />
        @if (last) {
          <span class="font-display font-semibold text-ink dark:text-cream" aria-current="page">
            {{ crumb.label }}
          </span>
        } @else {
          <a
            [routerLink]="crumb.url"
            class="text-ink-muted transition-colors hover:text-brand-500 dark:text-cream-bezel2 dark:hover:text-cream"
          >
            {{ crumb.label }}
          </a>
        }
      }
    </nav>
  `,
})
export class Breadcrumbs {
  private readonly router = inject(Router);

  protected readonly HouseIcon = House;
  protected readonly ChevronRightIcon = ChevronRight;

  protected readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.build(this.router.routerState.snapshot.root)),
    ),
    { initialValue: [] as Breadcrumb[] },
  );

  private build(root: ActivatedRouteSnapshot): Breadcrumb[] {
    const crumbs: Breadcrumb[] = [];
    let url = '';
    let node: ActivatedRouteSnapshot | null = root;
    while (node) {
      const segment = node.url.map((part) => part.path).join('/');
      if (segment) {
        url += `/${segment}`;
      }
      const label = node.data['breadcrumb'] as string | undefined;
      if (label && url !== '' && crumbs.at(-1)?.label !== label) {
        crumbs.push({ label, url });
      }
      node = node.firstChild;
    }
    return crumbs;
  }
}
