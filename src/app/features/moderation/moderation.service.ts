import { Injectable, inject, signal } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type {
  ModerationStats,
  ReportListResult,
  ReportStatus,
} from '../../models/moderation.model';

export const REPORTS_PAGE_SIZE = 15;

/** Contrôleur du module Modération : file des signalements + actions. */
@Injectable({ providedIn: 'root' })
export class ModerationService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly status = signal<ReportStatus>('pending');
  readonly query = signal('');
  readonly page = signal(0);

  readonly listQuery = injectQuery(() => ({
    queryKey: ['admin-reports', this.status(), this.query(), this.page()],
    queryFn: () => this.fetchList(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 10_000,
    placeholderData: (previous: ReportListResult | undefined) => previous,
  }));

  readonly statsQuery = injectQuery(() => ({
    queryKey: ['admin-moderation-stats'],
    queryFn: () => this.fetchStats(),
    enabled: this.auth.isAuthenticated(),
    refetchInterval: 60_000,
  }));

  setStatus(status: ReportStatus): void {
    this.status.set(status);
    this.page.set(0);
  }

  async reviewReports(ids: string[], status: ReportStatus): Promise<number> {
    const { data, error } = await this.supabase.rpc('admin_review_reports', {
      p_ids: ids,
      p_status: status,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
    return data ?? 0;
  }

  async warnUser(userId: string, message: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_warn_user', {
      p_user_id: userId,
      p_message: message,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  async tempBan(userId: string, days: number, reason: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_temp_ban', {
      p_user_id: userId,
      p_days: days,
      p_reason: reason,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  async setStatusOnUser(userId: string, status: 'active' | 'suspended' | 'banned', reason: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_set_account_status', {
      p_user_id: userId,
      p_status: status,
      p_reason: reason || undefined,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  private invalidate(): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-moderation-stats'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  }

  private async fetchList(): Promise<ReportListResult> {
    const { data, error } = await this.supabase.rpc('admin_list_reports', {
      p_status: this.status(),
      p_query: this.query() || undefined,
      p_limit: REPORTS_PAGE_SIZE,
      p_offset: this.page() * REPORTS_PAGE_SIZE,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as ReportListResult;
  }

  private async fetchStats(): Promise<ModerationStats> {
    const { data, error } = await this.supabase.rpc('admin_moderation_stats');
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as ModerationStats;
  }
}
