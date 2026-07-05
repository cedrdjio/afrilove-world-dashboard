import { Injectable, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import {
  CHART_PERIODS,
  type ActivityItem,
  type ChartPeriod,
  type DashboardCharts,
} from '../../models/dashboard.model';
import { AuthService } from '../auth/auth.service';
import { SupabaseClientService } from './supabase-client.service';

const PERIOD_KEY = 'alw-admin-period';
const CHARTS_REFRESH_MS = 60_000;
const ACTIVITY_REFRESH_MS = 30_000;

/**
 * Données analytiques du dashboard (Sprint A1) : séries temporelles sur la
 * période choisie (persistée) et flux d'activité récente.
 */
@Injectable({ providedIn: 'root' })
export class DashboardChartsService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  /** Fenêtre d'analyse (7/30/90 jours), persistée entre sessions. */
  readonly period = signal<ChartPeriod>(this.readPeriod());

  readonly chartsQuery = injectQuery(() => ({
    queryKey: ['admin-dashboard-charts', this.period()],
    queryFn: () => this.fetchCharts(this.period()),
    enabled: this.auth.isAuthenticated(),
    refetchInterval: CHARTS_REFRESH_MS,
    staleTime: 30_000,
    placeholderData: (previous: DashboardCharts | undefined) => previous,
  }));

  readonly activityQuery = injectQuery(() => ({
    queryKey: ['admin-recent-activity'],
    queryFn: () => this.fetchActivity(),
    enabled: this.auth.isAuthenticated(),
    refetchInterval: ACTIVITY_REFRESH_MS,
    staleTime: 15_000,
  }));

  setPeriod(period: ChartPeriod): void {
    this.period.set(period);
    try {
      localStorage.setItem(PERIOD_KEY, String(period));
    } catch {
      // Persistance facultative.
    }
  }

  private async fetchCharts(days: ChartPeriod): Promise<DashboardCharts> {
    const { data, error } = await this.supabase.rpc('admin_dashboard_charts', { p_days: days });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as DashboardCharts;
  }

  private async fetchActivity(): Promise<ActivityItem[]> {
    const { data, error } = await this.supabase.rpc('admin_recent_activity', { p_limit: 12 });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as ActivityItem[];
  }

  private readPeriod(): ChartPeriod {
    try {
      const stored = Number(localStorage.getItem(PERIOD_KEY));
      return (CHART_PERIODS as number[]).includes(stored) ? (stored as ChartPeriod) : 30;
    } catch {
      return 30;
    }
  }
}
