import { Injectable, inject } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { AdminRole } from '../../models/admin.model';

export interface AdminMember {
  /** null pour une invitation encore en attente (pas encore de compte). */
  user_id: string | null;
  role: AdminRole;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  email: string | null;
  last_sign_in_at: string | null;
  /** true = invitation en attente : l'accès sera actif à la 1re connexion. */
  pending: boolean;
}

/** Sprint A10 — gestion des accès back-office (super admin). */
@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly adminsQuery = injectQuery(() => ({
    queryKey: ['admin-admins'],
    queryFn: () => this.fetchAdmins(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 15_000,
  }));

  async grant(email: string, role: AdminRole, displayName?: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_grant_role', {
      p_email: email,
      p_role: role,
      p_display_name: displayName || undefined,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  async setActive(userId: string, active: boolean): Promise<void> {
    const { error } = await this.supabase.rpc('admin_set_admin_active', {
      p_user_id: userId,
      p_active: active,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  async revoke(userId: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_revoke_role', { p_user_id: userId });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  /** Annule une invitation encore en attente (pas de compte à révoquer). */
  async cancelInvite(email: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_cancel_invite', { p_email: email });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  private invalidate(): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
  }

  private async fetchAdmins(): Promise<AdminMember[]> {
    const { data, error } = await this.supabase.rpc('admin_list_admins');
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as AdminMember[];
  }
}
