/** Retour de la RPC `admin_dashboard_stats` (voir migration admin_roles_foundation). */
export interface DashboardStats {
  total_users: number;
  online_users: number;
  new_users_today: number;
  active_subscriptions: number;
  revenue_cents: number;
  matches_today: number;
  messages_today: number;
  reports_pending: number;
  kyc_pending: number;
  registrations_14d: RegistrationPoint[];
}

export interface RegistrationPoint {
  day: string; // 'YYYY-MM-DD'
  count: number;
}

/** Retour de la RPC `admin_dashboard_charts` (Sprint A1). */
export interface DashboardCharts {
  series: ChartDayPoint[];
  countries: CountryStat[];
  genders: GenderStat[];
}

export interface ChartDayPoint {
  day: string; // 'YYYY-MM-DD'
  new_users: number;
  total_users: number;
  revenue_cents: number;
  active_users: number;
  matches: number;
  messages: number;
  subscriptions: number;
}

export interface CountryStat {
  country: string | null;
  count: number;
}

export interface GenderStat {
  gender: string | null;
  count: number;
}

/** Ligne de la RPC `admin_recent_activity`. */
export interface ActivityItem {
  kind: 'signup' | 'match' | 'kyc' | 'report' | 'subscription' | string;
  label: string;
  detail: string | null;
  happened_at: string;
}

/** Fenêtres d'analyse proposées par le dashboard. */
export type ChartPeriod = 7 | 30 | 90;
export const CHART_PERIODS: ChartPeriod[] = [7, 30, 90];

/** Résultat de la RPC `admin_search_profiles` (recherche globale). */
export interface ProfileSearchResult {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  account_status: string;
  is_verified: boolean;
}
