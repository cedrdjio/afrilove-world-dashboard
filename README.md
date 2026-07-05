# AfriLove Admin — Console d'administration

Back-office de l'application de rencontres **AfriLove World**. Design bento /
glassmorphism aligné sur la charte lavande du mobile, mode sombre natif,
statistiques temps réel branchées sur le même projet Supabase que l'app.

## Stack

| Domaine | Choix |
|---|---|
| Framework | Angular 22 (standalone, zoneless, signals) |
| UI | TailwindCSS 4 (tokens charte lavande) + Angular Material (thème M3 custom) |
| Icônes | Lucide (`lucide-angular`) |
| Data | Supabase JS (client typé) + TanStack Query (Angular) |
| Charts | ngx-echarts (build core treeshaké, lazy) · Chart.js dispo pour la suite |
| Fonts | Plus Jakarta Sans (display) · Nunito (body), via Fontsource |

## Démarrage

```bash
npm install
npm start          # http://localhost:4200
npm run build      # build de production
```

La configuration Supabase est dans `src/environments/environment.ts`
(URL + clé *publishable* — conçue pour être embarquée côté client, la
sécurité repose sur RLS).

## Accès & rôles

Seuls les comptes présents dans la table `public.admin_users` (et actifs)
peuvent se connecter. Hiérarchie des rôles :

`viewer < support < moderator < admin < super_admin`

Pour promouvoir un compte (SQL, service role) :

```sql
insert into public.admin_users (user_id, role, display_name)
select id, 'admin', 'Prénom' from auth.users where email = 'personne@exemple.com'
on conflict (user_id) do update set role = excluded.role, is_active = true;
```

Objets créés côté Supabase (migrations dans `afrolove-world-mob/supabase/migrations`) :

- `admin_role` (enum) + `admin_users` (RLS : chacun ne lit que sa ligne, écritures service role uniquement)
- `is_admin()` — helper d'autorisation
- `admin_dashboard_stats()` — KPIs du dashboard (SECURITY DEFINER, gated `is_admin()`)
- `admin_search_profiles(q, limit)` — recherche globale (idem)

## Architecture (MVC)

```
src/app/
├── core/                  # « contrôleurs » transverses
│   ├── auth/              #   AuthService (session + rôle, signals)
│   ├── guards/            #   authGuard, guestGuard, roleGuard(min)
│   ├── error/             #   GlobalErrorHandler → toasts
│   └── services/          #   Supabase client, thème, toasts, stats, recherche
├── layout/                # coquille : sidebar, topbar, breadcrumbs, ⌘K, alertes
├── features/              # « vues » par module
│   ├── auth/login/
│   ├── dashboard/         #   bento KPIs + chart inscriptions 14 j
│   └── errors/            #   403 / 404
├── shared/                # UI réutilisable (stat-card, toasts, logo…), pipes, echarts
└── models/                # types (database.types.ts généré depuis Supabase)
```

## Sprint A0 — livré

- Authentification Supabase (comptes `admin_users` uniquement) + persistance de session
- Routes protégées (`authGuard`) et guards de rôle hiérarchiques (`roleGuard`)
- Layout responsive : sidebar repliable (rail d'icônes) / tiroir mobile, topbar verre
- Fil d'Ariane + stratégie de titre d'onglet
- Mode sombre natif (classe `.dark`, persistance, préférence système, sans flash)
- Recherche globale ⌘K / Ctrl+K : pages + membres (instantanée, clavier)
- Notifications : toasts globaux + panneau « À traiter » (KYC, signalements)
- Dashboard bento temps réel (refetch 30 s) : 4 KPIs animés, inscriptions 14 j
  (ECharts), activité du jour, à traiter, actions rapides
- Gestion d'erreurs globale (ErrorHandler → toast, anti-rafale)
- Squelette des routes des sprints A2 → A12 (stubs avec accès par rôle)

Les sprints suivants (A1 complet, A2 utilisateurs, A3 KYC…) s'appuient sur ce socle.
