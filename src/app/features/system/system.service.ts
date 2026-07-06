import { Injectable, inject } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { Json } from '../../models/database.types';

export interface AppSettings {
  maintenance_mode?: { enabled: boolean; message: string };
  feature_flags?: Record<string, boolean>;
  general?: { app_name: string; support_email: string; min_app_version: string };
}

export interface MessageTemplate {
  id: string;
  key: string;
  channel: 'email' | 'push';
  name: string;
  subject: string | null;
  body: string;
  is_active: boolean;
  updated_at: string;
}

/** Sprint A9 — réglages système et modèles de messages. */
@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  readonly settingsQuery = injectQuery(() => ({
    queryKey: ['admin-settings'],
    queryFn: () => this.fetchSettings(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 30_000,
  }));

  readonly templatesQuery = injectQuery(() => ({
    queryKey: ['admin-templates'],
    queryFn: () => this.fetchTemplates(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 30_000,
  }));

  async updateSetting(key: string, value: unknown): Promise<void> {
    const { error } = await this.supabase.rpc('admin_update_setting', {
      p_key: key,
      p_value: value as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
    void this.queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
  }

  async upsertTemplate(id: string | null, patch: Record<string, unknown>): Promise<void> {
    const { error } = await this.supabase.rpc('admin_upsert_template', {
      p_id: id as string,
      p_patch: patch as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
    void this.queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
  }

  private async fetchSettings(): Promise<AppSettings> {
    const { data, error } = await this.supabase.rpc('admin_get_settings');
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? {}) as unknown as AppSettings;
  }

  private async fetchTemplates(): Promise<MessageTemplate[]> {
    const { data, error } = await this.supabase.rpc('admin_list_templates');
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as MessageTemplate[];
  }
}
