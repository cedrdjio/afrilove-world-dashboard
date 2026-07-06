import { Injectable, inject } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { Json } from '../../models/database.types';
import type { Audience, BroadcastItem, SendResult } from '../../models/notification.model';

/** Sprint A7 — composition et envoi de notifications diffusées. */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly historyQuery = injectQuery(() => ({
    queryKey: ['admin-notification-history'],
    queryFn: () => this.fetchHistory(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 15_000,
  }));

  /** Nombre de destinataires réels pour une audience (aperçu avant envoi). */
  async audienceCount(audience: Audience): Promise<number> {
    const { data, error } = await this.supabase.rpc('admin_audience_count', {
      p_audience: audience as unknown as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data ?? 0;
  }

  async send(
    title: string,
    body: string,
    audience: Audience,
    scheduledFor: string | null,
  ): Promise<SendResult> {
    const { data, error } = await this.supabase.rpc('admin_send_notification', {
      p_title: title,
      p_body: body,
      p_audience: audience as unknown as Json,
      p_scheduled_for: scheduledFor ?? undefined,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
    return data as unknown as SendResult;
  }

  async cancel(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_cancel_broadcast', { p_id: id });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  private invalidate(): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-notification-history'] });
  }

  private async fetchHistory(): Promise<BroadcastItem[]> {
    const { data, error } = await this.supabase.rpc('admin_notification_history', { p_limit: 40 });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as BroadcastItem[];
  }
}
