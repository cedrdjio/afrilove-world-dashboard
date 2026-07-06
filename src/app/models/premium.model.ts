import type { Tables } from './database.types';

/** Sprint A5 — premium. */
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'canceled';

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  pending: 'En attente',
  active: 'Actifs',
  expired: 'Expirés',
  canceled: 'Annulés',
};

export interface SubscriptionItem {
  id: string;
  profile: { id: string; name: string | null; email: string | null; avatar: string | null };
  plan_key: string;
  plan_label: string;
  price_cents: number;
  currency: string;
  status: SubscriptionStatus;
  provider: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface SubscriptionListResult {
  total: number;
  counts: Partial<Record<SubscriptionStatus, number>>;
  items: SubscriptionItem[];
}

export interface PremiumStats {
  active: number;
  expired: number;
  canceled: number;
  revenue_total_cents: number;
  mrr_cents: number;
  by_plan: PlanStat[];
}

export interface PlanStat {
  plan_key: string;
  label: string;
  price_cents: number;
  active_count: number;
}

export type PremiumPlan = Tables<'premium_plans'>;
export type Coupon = Tables<'coupons'>;

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
