import { Injectable, inject, signal } from '@angular/core';
import type { ProfileSearchResult } from '../../models/dashboard.model';
import { SupabaseClientService } from './supabase-client.service';

/** État de la palette de recherche globale (⌘K) + recherche instantanée de profils. */
@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly supabase = inject(SupabaseClientService).client;

  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  /** Recherche par prénom, nom, e-mail ou ville (RPC admin, gated is_admin). */
  async searchProfiles(query: string): Promise<ProfileSearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return [];
    }
    const { data, error } = await this.supabase.rpc('admin_search_profiles', {
      p_query: trimmed,
      p_limit: 6,
    });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as ProfileSearchResult[];
  }
}
