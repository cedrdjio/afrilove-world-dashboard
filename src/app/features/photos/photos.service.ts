import { Injectable, inject, signal } from '@angular/core';
import { QueryClient, injectQuery } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type {
  PhotoListResult,
  PhotoModerationAction,
  PhotoStatus,
} from '../../models/photo-moderation.model';

export const PHOTOS_PAGE_SIZE = 24;

/** Contrôleur du module Modération d'images : file des photos + actions. */
@Injectable({ providedIn: 'root' })
export class PhotosService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);
  private readonly queryClient = inject(QueryClient);

  // '' = toutes les photos ; sinon un statut précis.
  readonly status = signal<PhotoStatus | ''>('flagged');
  readonly query = signal('');
  readonly page = signal(0);

  readonly listQuery = injectQuery(() => ({
    queryKey: ['admin-photos', this.status(), this.query(), this.page()],
    queryFn: () => this.fetchList(),
    enabled: this.auth.isAuthenticated(),
    staleTime: 10_000,
    placeholderData: (previous: PhotoListResult | undefined) => previous,
  }));

  setStatus(status: PhotoStatus | ''): void {
    this.status.set(status);
    this.page.set(0);
  }

  async moderate(photoId: string, action: PhotoModerationAction, note?: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_moderate_photo', {
      p_photo_id: photoId,
      p_action: action,
      p_note: note || undefined,
    });
    if (error) {
      throw new Error(error.message);
    }
    this.invalidate();
  }

  private invalidate(): void {
    void this.queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
    void this.queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
  }

  private async fetchList(): Promise<PhotoListResult> {
    const { data, error } = await this.supabase.rpc('admin_list_photos', {
      p_status: this.status() || undefined,
      p_query: this.query() || undefined,
      p_limit: PHOTOS_PAGE_SIZE,
      p_offset: this.page() * PHOTOS_PAGE_SIZE,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as PhotoListResult;
  }
}
