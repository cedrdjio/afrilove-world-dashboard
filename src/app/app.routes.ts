import { Routes } from '@angular/router';
import { lazy } from './core/chunk-loader';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Connexion',
    canActivate: [guestGuard],
    loadComponent: lazy(() => import('./features/auth/login/login').then((m) => m.Login)),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: lazy(() => import('./layout/shell/shell').then((m) => m.Shell)),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: "Vue d'ensemble",
        loadComponent: lazy(() => import('./features/dashboard/dashboard').then((m) => m.Dashboard)),
      },
      {
        path: 'analytics',
        title: 'Analytics',
        data: { breadcrumb: 'Analytics' },
        loadComponent: lazy(() =>
          import('./features/analytics/analytics-page').then((m) => m.AnalyticsPage),
        ),
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
            loadComponent: lazy(() =>
              import('./features/users/user-list').then((m) => m.UserList),
            ),
          },
          {
            path: ':id',
            title: 'Fiche membre',
            data: { breadcrumb: 'Fiche membre' },
            loadComponent: lazy(() =>
              import('./features/users/user-detail').then((m) => m.UserDetail),
            ),
          },
        ],
      },
      {
        path: 'kyc',
        title: 'Vérification KYC',
        canActivate: [roleGuard('moderator')],
        data: { breadcrumb: 'Vérification KYC' },
        loadComponent: lazy(() => import('./features/kyc/kyc-page').then((m) => m.KycPage)),
      },
      {
        path: 'moderation',
        title: 'Modération',
        canActivate: [roleGuard('moderator')],
        data: { breadcrumb: 'Modération' },
        loadComponent: lazy(() =>
          import('./features/moderation/moderation-page').then((m) => m.ModerationPage),
        ),
      },
      {
        path: 'subscriptions',
        title: 'Abonnements',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Abonnements' },
        loadComponent: lazy(() =>
          import('./features/premium/premium-page').then((m) => m.PremiumPage),
        ),
      },
      {
        path: 'content',
        title: 'Contenu',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Contenu' },
        loadComponent: lazy(() =>
          import('./features/content/content-page').then((m) => m.ContentPage),
        ),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Notifications' },
        loadComponent: lazy(() =>
          import('./features/notifications/notifications-page').then((m) => m.NotificationsPage),
        ),
      },
      {
        path: 'settings',
        title: 'Réglages',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Réglages' },
        loadComponent: lazy(() =>
          import('./features/system/system-page').then((m) => m.SystemPage),
        ),
      },
      {
        path: 'roles',
        title: 'Rôles & accès',
        canActivate: [roleGuard('super_admin')],
        data: { breadcrumb: 'Rôles & accès' },
        loadComponent: lazy(() => import('./features/roles/roles-page').then((m) => m.RolesPage)),
      },
      {
        path: 'audit',
        title: 'Audit',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Audit' },
        loadComponent: lazy(() => import('./features/audit/audit-page').then((m) => m.AuditPage)),
      },
      {
        path: 'support',
        title: 'Support',
        canActivate: [roleGuard('support')],
        data: { breadcrumb: 'Support' },
        loadComponent: lazy(() =>
          import('./features/support/support-page').then((m) => m.SupportPage),
        ),
      },
      {
        path: 'forbidden',
        title: 'Accès refusé',
        data: { breadcrumb: 'Accès refusé' },
        loadComponent: lazy(() => import('./features/errors/forbidden').then((m) => m.Forbidden)),
      },
    ],
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: lazy(() => import('./features/errors/not-found').then((m) => m.NotFound)),
  },
];
