import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BadgeCheck,
  BadgeX,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  LucideAngularModule,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';
import {
  DOC_TYPE_LABEL,
  KYC_STATUS_LABEL,
  type KycItem,
  type KycStatus,
} from '../../models/users.model';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { SignedImage } from '../../shared/ui/signed-image/signed-image';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { KYC_PAGE_SIZE, KycService } from './kyc.service';

const DEBOUNCE_MS = 300;
const TABS: KycStatus[] = ['pending', 'approved', 'rejected'];

/** File de vérification d'identité : revue unitaire ou en masse, aperçus signés. */
@Component({
  selector: 'app-kyc-page',
  imports: [Avatar, LucideAngularModule, RelativeTimePipe, RouterLink, SignedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kyc-page.html',
})
export class KycPage {
  protected readonly kyc = inject(KycService);
  private readonly toast = inject(ToastService);

  protected readonly SearchIcon = Search;
  protected readonly ApproveIcon = BadgeCheck;
  protected readonly RejectIcon = BadgeX;
  protected readonly ShieldIcon = ShieldCheck;
  protected readonly PrevIcon = ChevronLeft;
  protected readonly NextIcon = ChevronRight;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly CloseIcon = X;
  protected readonly LoaderIcon = LoaderCircle;
  protected readonly OpenIcon = ExternalLink;

  protected readonly tabs = TABS;
  protected readonly listQuery = this.kyc.listQuery;
  protected readonly result = computed(() => this.listQuery.data());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.result()?.total ?? 0) / KYC_PAGE_SIZE)),
  );

  /** Sélection pour les actions en masse (onglet « en attente » uniquement). */
  protected readonly selection = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedCount = computed(() => this.selection().size);

  /** Panneau de revue détaillée. */
  protected readonly current = signal<KycItem | null>(null);
  /** Cible du dialogue de rejet : sélection en masse ou item courant. */
  protected readonly rejectTarget = signal<string[] | null>(null);
  protected readonly rejectReason = signal('');
  protected readonly busy = signal(false);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected countOf(status: KycStatus): number {
    return this.result()?.counts?.[status] ?? 0;
  }

  protected tabLabel(status: KycStatus): string {
    return KYC_STATUS_LABEL[status];
  }

  protected docTypeLabel(docType: string): string {
    return DOC_TYPE_LABEL[docType] ?? docType;
  }

  protected fullName(item: KycItem): string {
    return [item.first_name, item.last_name].filter(Boolean).join(' ') || item.email || 'Sans nom';
  }

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.kyc.query.set(value);
      this.kyc.page.set(0);
    }, DEBOUNCE_MS);
  }

  protected switchTab(status: KycStatus): void {
    this.kyc.setStatus(status);
    this.selection.set(new Set());
    this.current.set(null);
  }

  protected selectionArray(): string[] {
    return [...this.selection()];
  }

  protected toggleSelected(id: string): void {
    const next = new Set(this.selection());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selection.set(next);
  }

  protected toggleAll(): void {
    const items = this.result()?.items ?? [];
    const next =
      this.selection().size === items.length
        ? new Set<string>()
        : new Set(items.map((item) => item.id));
    this.selection.set(next);
  }

  protected async approve(ids: string[]): Promise<void> {
    await this.run(async () => {
      const count = await this.kyc.review(ids, 'approved');
      this.toast.success(`${count} demande(s) approuvée(s)`);
      this.afterReview();
    });
  }

  protected askReject(ids: string[]): void {
    this.rejectReason.set('');
    this.rejectTarget.set(ids);
  }

  protected async confirmReject(): Promise<void> {
    const ids = this.rejectTarget();
    const reason = this.rejectReason().trim();
    if (!ids || !reason) {
      this.toast.warning('Le motif de rejet est obligatoire');
      return;
    }
    await this.run(async () => {
      const count = await this.kyc.review(ids, 'rejected', reason);
      this.toast.success(`${count} demande(s) rejetée(s)`);
      this.rejectTarget.set(null);
      this.afterReview();
    });
  }

  private afterReview(): void {
    this.selection.set(new Set());
    this.current.set(null);
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
