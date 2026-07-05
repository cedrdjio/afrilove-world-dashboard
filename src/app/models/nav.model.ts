import type { LucideIconData } from 'lucide-angular';
import type { AdminRole } from './admin.model';
import type { DashboardStats } from './dashboard.model';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIconData;
  /** Rôle minimum requis — aligné sur le roleGuard de la route. */
  minRole?: AdminRole;
  /** Sprint à venir (affiché en petit badge tant que le module n'existe pas). */
  sprint?: string;
  /** Compteur temps réel affiché en badge (ex : KYC en attente). */
  badge?: (stats: DashboardStats) => number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface Breadcrumb {
  label: string;
  url: string;
}
