import { Injectable, inject, signal } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { KycListResult, KycStatus } from '../../models/users.model';

export const KYC_PAGE_SIZE = 12;
const KYC_BUCKET = 'kyc-documents';
const SIGNED_URL_TTL_S = 3600;

/** Contrôleur du module KYC : file par statut, revue (bulk), URLs signées. */
@Injectable({ providedIn: 'root' })
export class KycService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  private readonly signedUrlCache = new Map<string, string>();

  readonly status = signal<KycStatus>('pending');
  readonly query = signal('');
  readonly page = signal(0);

  readonly listQuery = injectQuery(() => ({
    queryKey: ['admin-kyc', this.status(), this.query(), this.page()],
    queryFn: () => this.fetchList(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 10_000,
    placeholderData: (previous: KycListResult | undefined) => previous,
  }));

  setStatus(status: KycStatus): void {
    this.status.set(status);
    this.page.set(0);
  }

  async review(ids: string[], status: 'approved' | 'rejected', reason?: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('admin_review_kyc', {
      p_ids: ids,
      p_status: status,
      p_reason: reason,
    });
    if (error) {
      throw new Error(error.message);
    }
    void this.queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    return data ?? 0;
  }

  /** URL signée (1 h) d'un document du bucket privé kyc-documents. */
  async signedUrl(path: string): Promise<string | null> {
    const cached = this.signedUrlCache.get(path);
    if (cached) {
      return cached;
    }
    const { data, error } = await this.supabase.storage
      .from(KYC_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_S);
    if (error || !data?.signedUrl) {
      return null;
    }
    this.signedUrlCache.set(path, data.signedUrl);
    return data.signedUrl;
  }

  private async fetchList(): Promise<KycListResult> {
    const { data, error } = await this.supabase.rpc('admin_list_kyc', {
      p_status: this.status(),
      p_query: this.query() || undefined,
      p_limit: KYC_PAGE_SIZE,
      p_offset: this.page() * KYC_PAGE_SIZE,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as KycListResult;
  }
}
