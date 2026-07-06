import type { LucideIconData } from 'lucide-angular';

/** Sprint A6 — catalogues de contenu. */
export interface CatalogItem {
  id: string;
  key: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  // Colonnes optionnelles selon le catalogue.
  icon?: string | null;
  subtitle?: string | null;
  emoji?: string | null;
  category?: string | null;
  country_key?: string | null;
}

/** Nom de table côté SQL (whitelist admin_catalog_allowed). */
export type CatalogKey =
  | 'interests'
  | 'languages'
  | 'religions'
  | 'relationship_goals'
  | 'education_levels'
  | 'countries'
  | 'cities'
  | 'lifestyle_options'
  | 'occupations';

export interface CatalogField {
  name: keyof CatalogItem;
  label: string;
  type: 'text' | 'number' | 'emoji';
  optional?: boolean;
}

export interface CatalogDef {
  key: CatalogKey;
  label: string;
  singular: string;
  icon: LucideIconData;
  /** Champs éditables spécifiques au-delà de key/label/sort_order/is_active. */
  extraFields: CatalogField[];
}
