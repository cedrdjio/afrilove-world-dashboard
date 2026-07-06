import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BadgePercent,
  Ban,
  Crown,
  Layers,
  LoaderCircle,
  LucideAngularModule,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';
import {
  SUBSCRIPTION_STATUS_LABEL,
  formatEuros,
  type Coupon,
  type PremiumPlan,
  type SubscriptionItem,
  type SubscriptionStatus,
} from '../../models/premium.model';
import { Avatar } from '../../shared/ui/avatar/avatar';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { SUBS_PAGE_SIZE, PremiumService } from './premium.service';

const DEBOUNCE_MS = 300;
const TABS: (SubscriptionStatus | '')[] = ['active', 'expired', 'canceled', ''];

type PageTab = 'subscribers' | 'plans' | 'coupons';

/** Module Premium : abonnés, plans/tarifs, coupons et statistiques de revenus. */
@Component({
  selector: 'app-premium-page',
  imports: [Avatar, LucideAngularModule, RelativeTimePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './premium-page.html',
})
export class PremiumPage {
  protected readonly premium = inject(PremiumService);
  private readonly toast = inject(ToastService);

  protected readonly SearchIcon = Search;
  protected readonly CrownIcon = Crown;
  protected readonly WalletIcon = Wallet;
  protected readonly TrendingIcon = TrendingUp;
  protected readonly UsersIcon = Users;
  protected readonly PlanIcon = Layers;
  protected readonly CouponIcon = BadgePercent;
  protected readonly EditIcon = Pencil;
  protected readonly PlusIcon = Plus;
  protected readonly DeleteIcon = Trash2;
  protected readonly CancelIcon = Ban;
  protected readonly RefreshIcon = RefreshCw;
  protected readonly LoaderIcon = LoaderCircle;

  protected readonly formatEuros = formatEuros;
  protected readonly statusTabs = TABS;
  protected readonly pageSize = SUBS_PAGE_SIZE;

  protected readonly statsQuery = this.premium.statsQuery;
  protected readonly subscriptionsQuery = this.premium.subscriptionsQuery;
  protected readonly plansQuery = this.premium.plansQuery;
  protected readonly couponsQuery = this.premium.couponsQuery;

  protected readonly stats = computed(() => this.statsQuery.data());
  protected readonly subscriptions = computed(() => this.subscriptionsQuery.data());
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.subscriptions()?.total ?? 0) / SUBS_PAGE_SIZE)),
  );

  protected readonly tab = signal<PageTab>('subscribers');

  // Dialogues
  protected readonly cancelTarget = signal<SubscriptionItem | null>(null);
  protected readonly planTarget = signal<Partial<PremiumPlan> | null>(null);
  protected readonly planEditing = signal(false);
  protected readonly couponTarget = signal<Partial<Coupon> | null>(null);
  protected readonly busy = signal(false);

  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  protected statusLabel(status: SubscriptionStatus | ''): string {
    return status === '' ? 'Tous' : SUBSCRIPTION_STATUS_LABEL[status];
  }

  protected countOf(status: SubscriptionStatus | ''): number {
    const counts = this.subscriptions()?.counts;
    if (!counts) {
      return 0;
    }
    return status === ''
      ? Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0)
      : (counts[status] ?? 0);
  }

  protected subStatusClasses(status: SubscriptionStatus): string {
    switch (status) {
      case 'active':
        return 'bg-success/12 text-success';
      case 'expired':
        return 'bg-warning/15 text-warning';
      case 'canceled':
        return 'bg-danger/12 text-danger';
      default:
        return 'bg-ink-faint/15 text-ink-faint dark:bg-white/10 dark:text-cream-bezel2/70';
    }
  }

  protected onSearch(value: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.premium.query.set(value);
      this.premium.page.set(0);
    }, DEBOUNCE_MS);
  }

  // ── Plans ──
  protected newPlan(): void {
    this.planEditing.set(false);
    this.planTarget.set({ key: '', label: '', price_cents: 0, currency: 'EUR', duration_days: 30, is_active: true, sort_order: 99 });
  }

  protected editPlan(plan: PremiumPlan): void {
    this.planEditing.set(true);
    this.planTarget.set({ ...plan });
  }

  protected async savePlan(): Promise<void> {
    const plan = this.planTarget();
    if (!plan?.key) {
      this.toast.warning('La clé du plan est obligatoire');
      return;
    }
    await this.run(async () => {
      await this.premium.upsertPlan(plan.key!, {
        label: plan.label,
        price_cents: plan.price_cents,
        currency: plan.currency,
        duration_days: plan.duration_days,
        description: plan.description,
        is_active: plan.is_active,
        sort_order: plan.sort_order,
      });
      this.planTarget.set(null);
      this.toast.success('Plan enregistré');
    });
  }

  protected async togglePlan(plan: PremiumPlan): Promise<void> {
    await this.run(async () => {
      await this.premium.upsertPlan(plan.key, { is_active: !plan.is_active });
      this.toast.success(plan.is_active ? 'Plan désactivé' : 'Plan activé');
    });
  }

  // ── Coupons ──
  protected newCoupon(): void {
    this.couponTarget.set({ code: '', discount_percent: 10, is_active: true });
  }

  protected editCoupon(coupon: Coupon): void {
    this.couponTarget.set({ ...coupon });
  }

  protected async saveCoupon(): Promise<void> {
    const coupon = this.couponTarget();
    if (!coupon?.code) {
      this.toast.warning('Le code du coupon est obligatoire');
      return;
    }
    await this.run(async () => {
      await this.premium.upsertCoupon(coupon.code!, {
        description: coupon.description,
        discount_percent: coupon.discount_percent,
        plan_key: coupon.plan_key ?? '',
        max_redemptions: coupon.max_redemptions ?? '',
        valid_until: coupon.valid_until ?? '',
        is_active: coupon.is_active,
      });
      this.couponTarget.set(null);
      this.toast.success('Coupon enregistré');
    });
  }

  protected async removeCoupon(code: string): Promise<void> {
    await this.run(async () => {
      await this.premium.deleteCoupon(code);
      this.toast.success('Coupon supprimé');
    });
  }

  // ── Abonnements ──
  protected async confirmCancel(refund: boolean): Promise<void> {
    const sub = this.cancelTarget();
    if (!sub) {
      return;
    }
    await this.run(async () => {
      await this.premium.cancelSubscription(sub.id, refund);
      this.cancelTarget.set(null);
      this.toast.success(refund ? 'Abonnement remboursé et annulé' : 'Abonnement annulé');
    });
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

  // Setters pour les champs de dialogue (mise à jour immuable des signals).
  protected patchPlan(patch: Partial<PremiumPlan>): void {
    this.planTarget.update((p) => (p ? { ...p, ...patch } : p));
  }

  protected patchCoupon(patch: Partial<Coupon>): void {
    this.couponTarget.update((c) => (c ? { ...c, ...patch } : c));
  }

  /** Convertit un timestamp ISO en valeur d'input date (YYYY-MM-DD). */
  protected dateInput(value: string | null | undefined): string {
    return value ? value.slice(0, 10) : '';
  }
}
