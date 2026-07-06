import { Injectable, inject, signal } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { Json } from '../../models/database.types';
import type {
  Coupon,
  PremiumPlan,
  PremiumStats,
  SubscriptionListResult,
  SubscriptionStatus,
} from '../../models/premium.model';

export const SUBS_PAGE_SIZE = 15;

/** Contrôleur du module Premium : abonnements, plans, coupons, stats. */
@Injectable({ providedIn: 'root' })
export class PremiumService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly status = signal<SubscriptionStatus | ''>('active');
  readonly query = signal('');
  readonly page = signal(0);

  readonly statsQuery = injectQuery(() => ({
    queryKey: ['admin-premium-stats'],
    queryFn: () => this.fetchStats(),
    enabled: this.auth.isAuthenticated(),
    refetchInterval: 60_000,
  }));

  readonly subscriptionsQuery = injectQuery(() => ({
    queryKey: ['admin-subscriptions', this.status(), this.query(), this.page()],
    queryFn: () => this.fetchSubscriptions(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 10_000,
    placeholderData: (previous: SubscriptionListResult | undefined) => previous,
  }));

  readonly plansQuery = injectQuery(() => ({
    queryKey: ['admin-plans'],
    queryFn: () => this.fetchPlans(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 30_000,
  }));

  readonly couponsQuery = injectQuery(() => ({
    queryKey: ['admin-coupons'],
    queryFn: () => this.fetchCoupons(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 30_000,
  }));

  setStatus(status: SubscriptionStatus | ''): void {
    this.status.set(status);
    this.page.set(0);
  }

  async grantSubscription(userId: string, planKey: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_grant_subscription', {
      p_user_id: userId,
      p_plan_key: planKey,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidateSubscriptions();
  }

  async cancelSubscription(subscriptionId: string, refund: boolean): Promise<void> {
    const { error } = await this.supabase.rpc('admin_cancel_subscription', {
      p_subscription_id: subscriptionId,
      p_refund: refund,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidateSubscriptions();
  }

  async upsertPlan(key: string, patch: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase.rpc('admin_upsert_plan', {
      p_key: key,
      p_patch: patch as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
    void this.queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-premium-stats'] });
  }

  async upsertCoupon(code: string, patch: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase.rpc('admin_upsert_coupon', {
      p_code: code,
      p_patch: patch as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
    void this.queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
  }

  async deleteCoupon(code: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_delete_coupon', { p_code: code });
    if (error) {
      throw new Error(error.message);
    }
    void this.queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
  }

  private invalidateSubscriptions(): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-premium-stats'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
  }

  private async fetchStats(): Promise<PremiumStats> {
    const { data, error } = await this.supabase.rpc('admin_premium_stats');
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as PremiumStats;
  }

  private async fetchSubscriptions(): Promise<SubscriptionListResult> {
    const { data, error } = await this.supabase.rpc('admin_list_subscriptions', {
      p_status: this.status() || undefined,
      p_query: this.query() || undefined,
      p_limit: SUBS_PAGE_SIZE,
      p_offset: this.page() * SUBS_PAGE_SIZE,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as SubscriptionListResult;
  }

  private async fetchPlans(): Promise<PremiumPlan[]> {
    const { data, error } = await this.supabase
      .from('premium_plans')
      .select('*')
      .order('sort_order');
    if (error) {
      throw new Error(error.message);
    }
    return data ?? [];
  }

  private async fetchCoupons(): Promise<Coupon[]> {
    const { data, error } = await this.supabase.rpc('admin_list_coupons');
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as Coupon[];
  }
}
