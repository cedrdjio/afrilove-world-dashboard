import { Injectable, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import type { DashboardStats } from '../../models/dashboard.model';
import { AuthService } from '../auth/auth.service';
import { SupabaseClientService } from './supabase-client.service';

const REFRESH_INTERVAL_MS = 30_000;

/**
 * KPIs temps réel du back-office (RPC `admin_dashboard_stats`), partagés entre
 * le dashboard, la sidebar (badges) et le panneau de notifications.
 */
@Injectable({ providedIn: 'root' })
export class DashboardStatsService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  readonly statsQuery = injectQuery(() => ({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => this.fetchStats(),
    enabled: this.auth.isAuthenticated(),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 15_000,
  }));

  private async fetchStats(): Promise<DashboardStats> {
    const { data, error } = await this.supabase.rpc('admin_dashboard_stats');
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as DashboardStats;
  }
}
