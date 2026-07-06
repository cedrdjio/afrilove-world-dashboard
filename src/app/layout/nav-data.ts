import {
  BadgeCheck,
  BellRing,
  ChartColumn,
  Crown,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldUser,
  Users,
} from 'lucide-angular';
import type { NavSection } from '../models/nav.model';

/** Plan de navigation du back-office — une entrée par module/sprint. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Pilotage',
    items: [
      { label: "Vue d'ensemble", path: '/', icon: LayoutDashboard },
      { label: 'Analytics', path: '/analytics', icon: ChartColumn, sprint: 'A8' },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { label: 'Utilisateurs', path: '/users', icon: Users, minRole: 'support' },
      {
        label: 'Vérification KYC',
        path: '/kyc',
        icon: BadgeCheck,
        minRole: 'moderator',
        badge: (stats) => stats.kyc_pending,
      },
      {
        label: 'Modération',
        path: '/moderation',
        icon: ShieldAlert,
        minRole: 'moderator',
        badge: (stats) => stats.reports_pending,
      },
      { label: 'Contenu', path: '/content', icon: Layers, minRole: 'admin' },
    ],
  },
  {
    label: 'Revenus',
    items: [
      { label: 'Abonnements', path: '/subscriptions', icon: Crown, minRole: 'admin' },
    ],
  },
  {
    label: 'Système',
    items: [
      {
        label: 'Notifications',
        path: '/notifications',
        icon: BellRing,
        minRole: 'admin',
      },
      {
        label: 'Rôles & accès',
        path: '/roles',
        icon: ShieldUser,
        minRole: 'super_admin',
        sprint: 'A10',
      },
      { label: 'Audit', path: '/audit', icon: ScrollText, minRole: 'admin', sprint: 'A11' },
      { label: 'Support', path: '/support', icon: LifeBuoy, minRole: 'support', sprint: 'A12' },
      { label: 'Réglages', path: '/settings', icon: Settings, minRole: 'admin', sprint: 'A9' },
    ],
  },
];
