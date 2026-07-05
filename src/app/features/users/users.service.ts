import { Injectable, inject, signal } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import { ToastService } from '../../core/services/toast.service';
import type {
  AccountStatus,
  ConversationMessage,
  UserDetails,
  UserListResult,
} from '../../models/users.model';
import type { Json } from '../../models/database.types';

export const USERS_PAGE_SIZE = 10;

/**
 * Contrôleur du module Utilisateurs : filtres persistants (service root),
 * liste paginée et actions d'administration (RPC gated par rôle côté SQL).
 */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly queryClient = inject(QueryClient);

  // Filtres persistants tant que la session dure (retour depuis une fiche).
  readonly query = signal('');
  readonly status = signal<AccountStatus | ''>('');
  readonly gender = signal<'' | 'homme' | 'femme'>('');
  readonly verified = signal<'' | 'yes' | 'no'>('');
  readonly page = signal(0);

  readonly listQuery = injectQuery(() => ({
    queryKey: [
      'admin-users',
      this.query(),
      this.status(),
      this.gender(),
      this.verified(),
      this.page(),
    ],
    queryFn: () => this.fetchList(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 10_000,
    placeholderData: (previous: UserListResult | undefined) => previous,
  }));

  resetPageAnd<T>(target: { set(value: T): void }, value: T): void {
    target.set(value);
    this.page.set(0);
  }

  async fetchDetails(userId: string): Promise<UserDetails> {
    const { data, error } = await this.supabase.rpc('admin_get_user_details', {
      p_user_id: userId,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as UserDetails;
  }

  async fetchConversation(matchId: string): Promise<ConversationMessage[]> {
    const { data, error } = await this.supabase.rpc('admin_conversation_messages', {
      p_match_id: matchId,
      p_limit: 100,
    });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as ConversationMessage[];
  }

  async setAccountStatus(userId: string, status: AccountStatus, reason: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_set_account_status', {
      p_user_id: userId,
      p_status: status,
      p_reason: reason || undefined,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate(userId);
  }

  async setVerified(userId: string, verified: boolean): Promise<void> {
    const { error } = await this.supabase.rpc('admin_set_profile_verified', {
      p_user_id: userId,
      p_verified: verified,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate(userId);
  }

  async verifyEmail(userId: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_verify_email', { p_user_id: userId });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate(userId);
  }

  async updateProfile(userId: string, patch: Record<string, string>): Promise<void> {
    const { error } = await this.supabase.rpc('admin_update_profile', {
      p_user_id: userId,
      p_patch: patch as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate(userId);
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_delete_user', { p_user_id: userId });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate(userId);
  }

  /** Envoie l'e-mail Supabase de réinitialisation du mot de passe. */
  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
    this.toast.success('E-mail envoyé', `Lien de réinitialisation envoyé à ${email}.`);
  }

  invalidate(userId?: string): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    if (userId) {
      void this.queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
    }
  }

  private async fetchList(): Promise<UserListResult> {
    const verified = this.verified();
    const { data, error } = await this.supabase.rpc('admin_list_users', {
      p_query: this.query() || undefined,
      p_status: this.status() || undefined,
      p_gender: this.gender() || undefined,
      p_verified: verified === '' ? undefined : verified === 'yes',
      p_limit: USERS_PAGE_SIZE,
      p_offset: this.page() * USERS_PAGE_SIZE,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as UserListResult;
  }
}
