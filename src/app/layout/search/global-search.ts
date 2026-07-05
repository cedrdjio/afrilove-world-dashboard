import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ArrowRight,
  BadgeCheck,
  CornerDownLeft,
  LoaderCircle,
  LucideAngularModule,
  Search,
  UserRound,
  type LucideIconData,
} from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { GlobalSearchService } from '../../core/services/global-search.service';
import { hasRoleLevel } from '../../models/admin.model';
import type { ProfileSearchResult } from '../../models/dashboard.model';
import { NAV_SECTIONS } from '../nav-data';

interface SearchEntry {
  kind: 'page' | 'user';
  label: string;
  detail: string;
  icon: LucideIconData;
  path: string;
  verified?: boolean;
}

const DEBOUNCE_MS = 250;

/**
 * Palette de commande (⌘K / Ctrl+K) : navigation instantanée vers les pages
 * du back-office + recherche de membres via la RPC admin_search_profiles.
 */
@Component({
  selector: 'app-global-search',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKeydown($event)' },
  templateUrl: './global-search.html',
})
export class GlobalSearch {
  private readonly searchService = inject(GlobalSearchService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly SearchIcon = Search;
  protected readonly LoaderIcon = LoaderCircle;
  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly EnterIcon = CornerDownLeft;
  protected readonly UserIcon = UserRound;
  protected readonly VerifiedIcon = BadgeCheck;

  protected readonly isOpen = this.searchService.isOpen;
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);
  protected readonly searching = signal(false);

  private readonly userResults = signal<ProfileSearchResult[]>([]);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private searchSeq = 0;

  /** Pages accessibles au rôle courant, filtrées par le texte saisi. */
  protected readonly pageEntries = computed<SearchEntry[]>(() => {
    const role = this.auth.role();
    const needle = this.query().trim().toLowerCase();
    return NAV_SECTIONS.flatMap((section) => section.items)
      .filter((item) => !item.minRole || hasRoleLevel(role, item.minRole))
      .filter((item) => needle === '' || item.label.toLowerCase().includes(needle))
      .slice(0, needle === '' ? 6 : 12)
      .map((item) => ({
        kind: 'page' as const,
        label: item.label,
        detail: item.sprint ? `Module · Sprint ${item.sprint}` : 'Page',
        icon: item.icon,
        path: item.path,
      }));
  });

  protected readonly userEntries = computed<SearchEntry[]>(() =>
    this.userResults().map((profile) => ({
      kind: 'user' as const,
      label:
        [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
        profile.email ||
        'Profil sans nom',
      detail: [profile.email, profile.city].filter(Boolean).join(' · '),
      icon: UserRound,
      path: `/users/${profile.id}`,
      verified: profile.is_verified,
    })),
  );

  protected readonly entries = computed<SearchEntry[]>(() => [
    ...this.pageEntries(),
    ...this.userEntries(),
  ]);

  constructor() {
    // Focus + remise à zéro à chaque ouverture.
    effect(() => {
      if (this.isOpen()) {
        this.query.set('');
        this.userResults.set([]);
        this.activeIndex.set(0);
        setTimeout(() => this.input()?.nativeElement.focus());
      }
    });

    // Recherche de membres, avec anti-rebond et garde anti-réponses croisées.
    effect(() => {
      const text = this.query().trim();
      clearTimeout(this.debounceTimer);
      const seq = ++this.searchSeq;
      if (text.length < 2) {
        this.userResults.set([]);
        this.searching.set(false);
        return;
      }
      this.searching.set(true);
      this.debounceTimer = setTimeout(async () => {
        try {
          const results = await this.searchService.searchProfiles(text);
          if (seq === this.searchSeq) {
            this.userResults.set(results);
          }
        } catch {
          if (seq === this.searchSeq) {
            this.userResults.set([]);
          }
        } finally {
          if (seq === this.searchSeq) {
            this.searching.set(false);
          }
        }
      }, DEBOUNCE_MS);
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchService.toggle();
      return;
    }
    if (!this.isOpen()) {
      return;
    }
    switch (event.key) {
      case 'Escape':
        this.searchService.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Enter': {
        const entry = this.entries()[this.activeIndex()];
        if (entry) {
          this.select(entry);
        }
        break;
      }
    }
  }

  protected select(entry: SearchEntry): void {
    this.searchService.close();
    void this.router.navigateByUrl(entry.path);
  }

  protected onQueryInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  private moveActive(delta: number): void {
    const count = this.entries().length;
    if (count === 0) {
      return;
    }
    this.activeIndex.update((index) => (index + delta + count) % count);
  }
}
