import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { QueryClient } from '@tanstack/angular-query-experimental';
import {
  Check,
  LoaderCircle,
  LucideAngularModule,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { hasRoleLevel } from '../../models/admin.model';
import type { CatalogDef, CatalogItem } from '../../models/content.model';
import { CATALOG_DEFS } from './catalog-defs';
import { ContentService } from './content.service';

/** Sprint A6 — gestion des catalogues de contenu (données réelles Supabase). */
@Component({
  selector: 'app-content-page',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-page.html',
})
export class ContentPage {
  private readonly content = inject(ContentService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly queryClient = inject(QueryClient);

  protected readonly SearchIcon = Search;
  protected readonly PlusIcon = Plus;
  protected readonly EditIcon = Pencil;
  protected readonly DeleteIcon = Trash2;
  protected readonly CheckIcon = Check;
  protected readonly CloseIcon = X;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly catalogs = CATALOG_DEFS;
  protected readonly active = signal<CatalogDef>(CATALOG_DEFS[0]);
  protected readonly search = signal('');
  protected readonly canEdit = computed(() => hasRoleLevel(this.auth.role(), 'admin'));

  protected readonly listQuery = injectQuery(() => ({
    queryKey: ['admin-catalog', this.active().key],
    queryFn: () => this.content.list(this.active().key),
    enabled: this.auth.isAuthenticated(),
    staleTime: 15_000,
  }));

  protected readonly items = computed(() => {
    const needle = this.search().trim().toLowerCase();
    const rows = this.listQuery.data() ?? [];
    return needle
      ? rows.filter(
          (item) =>
            item.label.toLowerCase().includes(needle) || item.key.toLowerCase().includes(needle),
        )
      : rows;
  });

  // Dialogue d'édition.
  protected readonly editTarget = signal<Partial<CatalogItem> | null>(null);
  protected readonly editing = signal(false);
  protected readonly deleteTarget = signal<CatalogItem | null>(null);
  protected readonly busy = signal(false);

  protected selectCatalog(def: CatalogDef): void {
    this.active.set(def);
    this.search.set('');
  }

  protected newItem(): void {
    this.editing.set(false);
    this.editTarget.set({ key: '', label: '', sort_order: 0, is_active: true });
  }

  protected editItem(item: CatalogItem): void {
    this.editing.set(true);
    this.editTarget.set({ ...item });
  }

  protected patch(patch: Partial<CatalogItem>): void {
    this.editTarget.update((t) => (t ? { ...t, ...patch } : t));
  }

  /** Patch d'un champ dynamique (colonne spécifique au catalogue). */
  protected patchField(name: keyof CatalogItem, value: string): void {
    this.editTarget.update((t) => (t ? { ...t, [name]: value } : t));
  }

  protected async save(): Promise<void> {
    const item = this.editTarget();
    if (!item?.key || !item?.label) {
      this.toast.warning('La clé et le libellé sont obligatoires');
      return;
    }
    await this.run(async () => {
      // On n'envoie que les colonnes pertinentes pour ce catalogue.
      const row: Partial<CatalogItem> = {
        key: item.key,
        label: item.label,
        sort_order: Number(item.sort_order ?? 0),
        is_active: item.is_active ?? true,
      };
      if (item.id) {
        row.id = item.id;
      }
      for (const field of this.active().extraFields) {
        (row as Record<string, unknown>)[field.name] = item[field.name] ?? null;
      }
      await this.content.upsert(this.active().key, row);
      this.editTarget.set(null);
      this.invalidate();
      this.toast.success('Élément enregistré');
    });
  }

  protected async toggleActive(item: CatalogItem): Promise<void> {
    await this.run(async () => {
      await this.content.upsert(this.active().key, {
        id: item.id,
        key: item.key,
        label: item.label,
        sort_order: item.sort_order,
        is_active: !item.is_active,
      });
      this.invalidate();
    });
  }

  protected async confirmDelete(): Promise<void> {
    const item = this.deleteTarget();
    if (!item) {
      return;
    }
    await this.run(async () => {
      await this.content.remove(this.active().key, item.id);
      this.deleteTarget.set(null);
      this.invalidate();
      this.toast.success('Élément supprimé');
    });
  }

  private invalidate(): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-catalog', this.active().key] });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      this.toast.error('Action impossible', error instanceof Error ? error.message : undefined);
    } finally {
      this.busy.set(false);
    }
  }
}
