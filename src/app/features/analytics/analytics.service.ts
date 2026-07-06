import { Injectable, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { ChartPeriod } from '../../models/dashboard.model';
import type { Analytics } from '../../models/analytics.model';

/** Sprint A8 — données analytiques (RPC admin_analytics). */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  readonly period = signal<ChartPeriod>(30);

  readonly analyticsQuery = injectQuery(() => ({
    queryKey: ['admin-analytics', this.period()],
    queryFn: () => this.fetch(this.period()),
    enabled: this.auth.isAuthenticated(),
    staleTime: 30_000,
  }));

  setPeriod(period: ChartPeriod): void {
    this.period.set(period);
  }

  private async fetch(days: ChartPeriod): Promise<Analytics> {
    const { data, error } = await this.supabase.rpc('admin_analytics', { p_days: days });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as Analytics;
  }
}
