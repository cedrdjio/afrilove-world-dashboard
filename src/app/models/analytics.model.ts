/** Sprint A8 — analytique. */
export interface TopEntry {
  label: string;
  count: number;
}

export interface ActiveUserEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  activity: number;
}

export interface HeatCell {
  dow: number;
  hour: number;
  count: number;
}

export interface Analytics {
  dau: number;
  mau: number;
  total_users: number;
  new_users: number;
  verified_users: number;
  premium_users: number;
  conversion_rate: number;
  retention_7d: number;
  revenue_period_cents: number;
  top_countries: TopEntry[];
  top_cities: TopEntry[];
  top_interests: TopEntry[];
  most_active_users: ActiveUserEntry[];
  heatmap: HeatCell[];
}
