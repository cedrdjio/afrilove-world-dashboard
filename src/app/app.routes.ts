import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

/** Stub « module à venir » partagé par les sprints A2 → A12. */
const comingSoon = () => import('./shared/ui/coming-soon/coming-soon').then((m) => m.ComingSoon);

export const routes: Routes = [
  {
    path: 'login',
    title: 'Connexion',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: "Vue d'ensemble",
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'analytics',
        title: 'Analytics',
        data: { breadcrumb: 'Analytics' },
        loadComponent: () => import('./features/analytics/analytics-page').then((m) => m.AnalyticsPage),
      },
      {
        path: 'users',
        canActivate: [roleGuard('support')],
        data: { breadcrumb: 'Utilisateurs' },
        children: [
          {
            path: '',
            pathMatch: 'full',
            title: 'Utilisateurs',
            loadComponent: () => import('./features/users/user-list').then((m) => m.UserList),
          },
          {
            path: ':id',
            title: 'Fiche membre',
            data: { breadcrumb: 'Fiche membre' },
            loadComponent: () => import('./features/users/user-detail').then((m) => m.UserDetail),
          },
        ],
      },
      {
        path: 'kyc',
        title: 'Vérification KYC',
        canActivate: [roleGuard('moderator')],
        data: { breadcrumb: 'Vérification KYC' },
        loadComponent: () => import('./features/kyc/kyc-page').then((m) => m.KycPage),
      },
      {
        path: 'moderation',
        title: 'Modération',
        canActivate: [roleGuard('moderator')],
        data: { breadcrumb: 'Modération' },
        loadComponent: () => import('./features/moderation/moderation-page').then((m) => m.ModerationPage),
      },
      {
        path: 'subscriptions',
        title: 'Abonnements',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Abonnements' },
        loadComponent: () => import('./features/premium/premium-page').then((m) => m.PremiumPage),
      },
      {
        path: 'content',
        title: 'Contenu',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Contenu' },
        loadComponent: () => import('./features/content/content-page').then((m) => m.ContentPage),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Notifications' },
        loadComponent: () =>
          import('./features/notifications/notifications-page').then((m) => m.NotificationsPage),
      },
      {
        path: 'settings',
        title: 'Réglages',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Réglages' },
        loadComponent: () => import('./features/system/system-page').then((m) => m.SystemPage),
      },
      {
        path: 'roles',
        title: 'Rôles & accès',
        canActivate: [roleGuard('super_admin')],
        data: { breadcrumb: 'Rôles & accès' },
        loadComponent: () => import('./features/roles/roles-page').then((m) => m.RolesPage),
      },
      {
        path: 'audit',
        title: 'Audit',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Audit' },
        loadComponent: () => import('./features/audit/audit-page').then((m) => m.AuditPage),
      },
      {
        path: 'support',
        title: 'Support',
        canActivate: [roleGuard('support')],
        data: { breadcrumb: 'Support' },
        loadComponent: () => import('./features/support/support-page').then((m) => m.SupportPage),
      },
      {
        path: 'forbidden',
        title: 'Accès refusé',
        data: { breadcrumb: 'Accès refusé' },
        loadComponent: () => import('./features/errors/forbidden').then((m) => m.Forbidden),
      },
    ],
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () => import('./features/errors/not-found').then((m) => m.NotFound),
  },
];
