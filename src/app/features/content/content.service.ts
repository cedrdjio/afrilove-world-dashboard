import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from '../../core/services/supabase-client.service';
import type { CatalogItem, CatalogKey } from '../../models/content.model';
import type { Json } from '../../models/database.types';

/** Accès aux catalogues de contenu (RPC génériques whitelistées). */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly supabase = inject(SupabaseClientService).client;

  async list(catalog: CatalogKey): Promise<CatalogItem[]> {
    const { data, error } = await this.supabase.rpc('admin_catalog_list', { p_catalog: catalog });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as CatalogItem[];
  }

  async upsert(catalog: CatalogKey, row: Partial<CatalogItem>): Promise<void> {
    const { error } = await this.supabase.rpc('admin_catalog_upsert', {
      p_catalog: catalog,
      p_row: row as Json,
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  async remove(catalog: CatalogKey, id: string): Promise<void> {
    const { error } = await this.supabase.rpc('admin_catalog_delete', {
      p_catalog: catalog,
      p_id: id,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}
