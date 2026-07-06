import { Injectable, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';

export const AUDIT_PAGE_SIZE = 30;

export interface AuditEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  admin_name: string | null;
  admin_email: string | null;
}

export interface LoginLog {
  action: string;
  actor: string | null;
  ip: string | null;
  created_at: string;
}

/** Sprint A11 — journaux d'audit et de connexion. */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  readonly query = signal('');
  readonly targetType = signal('');
  readonly page = signal(0);

  readonly auditQuery = injectQuery(() => ({
    queryKey: ['admin-audit', this.query(), this.targetType(), this.page()],
    queryFn: () => this.fetchAudit(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 10_000,
    placeholderData: (p: { total: number; items: AuditEntry[] } | undefined) => p,
  }));

  readonly loginQuery = injectQuery(() => ({
    queryKey: ['admin-login-logs'],
    queryFn: () => this.fetchLogins(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 30_000,
  }));

  private async fetchAudit(): Promise<{ total: number; items: AuditEntry[] }> {
    const { data, error } = await this.supabase.rpc('admin_audit_list', {
      p_query: this.query() || undefined,
      p_target_type: this.targetType() || undefined,
      p_limit: AUDIT_PAGE_SIZE,
      p_offset: this.page() * AUDIT_PAGE_SIZE,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as { total: number; items: AuditEntry[] };
  }

  private async fetchLogins(): Promise<LoginLog[]> {
    const { data, error } = await this.supabase.rpc('admin_login_logs', { p_limit: 50 });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as LoginLog[];
  }
}
