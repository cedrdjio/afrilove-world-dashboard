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
        data: { breadcrumb: 'Analytics', sprint: 'A8' },
        loadComponent: comingSoon,
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
        data: { breadcrumb: 'Modération', sprint: 'A4' },
        loadComponent: comingSoon,
      },
      {
        path: 'subscriptions',
        title: 'Abonnements',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Abonnements', sprint: 'A5' },
        loadComponent: comingSoon,
      },
      {
        path: 'content',
        title: 'Contenu',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Contenu', sprint: 'A6' },
        loadComponent: comingSoon,
      },
      {
        path: 'notifications',
        title: 'Notifications',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Notifications', sprint: 'A7' },
        loadComponent: comingSoon,
      },
      {
        path: 'settings',
        title: 'Réglages',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Réglages', sprint: 'A9' },
        loadComponent: comingSoon,
      },
      {
        path: 'roles',
        title: 'Rôles & accès',
        canActivate: [roleGuard('super_admin')],
        data: { breadcrumb: 'Rôles & accès', sprint: 'A10' },
        loadComponent: comingSoon,
      },
      {
        path: 'audit',
        title: 'Audit',
        canActivate: [roleGuard('admin')],
        data: { breadcrumb: 'Audit', sprint: 'A11' },
        loadComponent: comingSoon,
      },
      {
        path: 'support',
        title: 'Support',
        canActivate: [roleGuard('support')],
        data: { breadcrumb: 'Support', sprint: 'A12' },
        loadComponent: comingSoon,
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
