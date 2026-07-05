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
