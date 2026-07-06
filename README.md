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

## Sprint A1 — livré

- Sélecteur de période 7 / 30 / 90 jours (persisté, refetch instantané)
- Croissance des utilisateurs (cumul, aire) et inscriptions par jour
- Utilisateurs actifs par jour (messages + swipes + dernière activité)
- Revenus, abonnements, matchs et messages par jour (petits multiples)
- Répartition par genre (donut, palette validée CVD/contraste sur les deux thèmes)
- Top pays (barres de progression)
- Flux d'activité récente unifié : inscriptions, matchs, KYC, signalements,
  abonnements (RPC `admin_recent_activity`, rafraîchi toutes les 30 s)
- RPC `admin_dashboard_charts(p_days)` — séries temporelles agrégées côté SQL

## Sprint A2 — livré (Utilisateurs)

- Annuaire complet : recherche débouncée (nom, e-mail, ville), filtres
  persistants (statut, genre, vérification), pagination
- Fiche membre : profil complet, photos, centres d'intérêt/langues,
  abonnement, appareils, historique de connexion (auth.audit_log_entries),
  signalements reçus/émis, matchs & conversations
- Lecture des conversations à des fins de modération (action journalisée)
- Actions : vérifier le profil, suspendre / bannir / réactiver (motif
  obligatoire journalisé), modifier le profil, confirmer l'e-mail,
  réinitialiser le mot de passe (e-mail Supabase), supprimer (super admin,
  cascade auth), export JSON
- Chaque action est tracée dans `admin_audit_log` (visible sur la fiche)
- Statut `suspended` ajouté au modèle (`profiles_account_status_check`)

## Sprint A3 — livré (KYC)

- File de vérification par statut (en attente / approuvés / rejetés) avec
  compteurs, recherche et pagination
- Aperçus selfie + document recto/verso via URLs signées (bucket privé
  `kyc-documents`, policy de lecture réservée aux admins)
- Panneau de revue plein écran avec lien vers la fiche membre
- Approbation / rejet unitaire ou en masse — motif obligatoire pour le
  rejet, `profiles.is_verified` synchronisé par trigger, tout est journalisé

## Sprint A4 — livré (Modération)

- File des signalements par statut (en attente / résolus / rejetés) avec
  compteurs et recherche, badge « N signalements » sur les récidivistes
- Statistiques de modération (signalements, avertissements, suspendus, bannis)
- Résolution / rejet unitaire, avertissement, ban temporaire (durée), ban
  définitif — chaque action résout aussi le signalement et est journalisée

## Sprint A5 — livré (Premium)

- KPIs revenus : abonnés actifs, MRR (normalisé 30 j), revenu cumulé
- Onglet Abonnés : liste filtrable (actifs/expirés/annulés), annulation et
  remboursement
- Onglet Plans : cartes tarifaires, création/édition, activation/désactivation
- Onglet Coupons : CRUD complet (code, remise %, plan, quota, validité)
- Upgrade premium manuel depuis la fiche membre (`admin_grant_subscription`)

## Sprint A6 — livré (Contenu)

- 9 catalogues éditables **branchés sur la vraie base** : centres d'intérêt,
  langues, religions, objectifs de relation, professions, niveaux d'études,
  style de vie, pays, villes
- Nouvelles tables réelles seedées : `countries` (27 pays afro-européens),
  `cities` (~40 villes), `lifestyle_options`, `occupations`
- CRUD complet (créer / éditer / activer / supprimer) via RPC génériques
  whitelistées (`admin_catalog_list/upsert/delete`), recherche instantanée

## Sprint A7 — livré (Notifications)

- Compositeur avec aperçu type push en direct
- Ciblage **réel** : tous, par pays (liste des pays du catalogue), par genre,
  premium / non-premium, par tranche d'âge
- Aperçu du nombre de destinataires réels avant envoi (`admin_audience_count`)
- Envoi immédiat (une notification par membre ciblé) ou programmé
- Historique des diffusions + annulation d'un envoi programmé

Toutes les données proviennent de Supabase — aucun contenu codé en dur.
Les sprints suivants (A8 analytics, A9 système…) s'appuient sur ce socle.
