# Sécurité — comptes d'administration

## Incident du 26/07/2026 — connexions admin qui cassaient

### Symptôme
Après une connexion, les identifiants admin cessaient de fonctionner. Deux
comptes touchés (`nagatopen99@gmail.com`, `atibidi@yahoo.fr`), plusieurs fois.

### Diagnostic (audit forensique)
**Aucune compromission du serveur ni de la base.** Vérifié :

- Aucun rôle Postgres pirate ; uniquement les rôles Supabase standards.
- Aucun job planifié (pg_cron non installé) ni trigger caché sur `auth.users`.
- Aucune clé `service_role` / secrète exposée dans le code (dashboard + mobile
  utilisent uniquement la clé *publishable*).
- Aucun facteur MFA ni identité OAuth injectés ; une seule session par admin.
- Journal d'audit applicatif sans trace d'intrusion.

**Cause racine :** les comptes admin étaient les **mêmes** que des comptes de
l'app mobile. Les mots de passe étaient réécrits 30–40 s après une connexion,
avec la signature de hachage de Supabase Auth (bcrypt coût 10) — donc par un
flux d'authentification légitime, pas par un accès externe. En clair : un
« mot de passe oublié » ou un changement de mot de passe **côté application
mobile** écrasait le mot de passe partagé, cassant le login du dashboard.

### Mesures appliquées
1. **Compte admin dédié** `admin@afriloveworld.com` — utilisé uniquement pour le
   dashboard, **jamais** sur l'app mobile. Immunisé contre la collision.
2. Révocation de **tous** les anciens accès back-office + coupure de leurs
   sessions (leurs comptes utilisateurs mobiles restent intacts).
3. **Garde-fou de détection** (`trg_audit_admin_credential_change`) : toute
   modification de mot de passe/e-mail d'un compte admin actif est désormais
   journalisée dans `admin_audit_log`
   (`security.admin_password_changed` / `security.admin_email_changed`).

## Incident du 26/07/2026 (suite) — login 500 après création du compte dédié

### Symptôme
Le nouveau compte `admin@afriloveworld.com` affichait « Connexion impossible.
Vérifiez votre réseau et réessayez. » alors que le mot de passe était correct.

### Diagnostic
Le message était en réalité un **fourre-tout** qui masquait la vraie cause. Les
logs GoTrue montraient une **erreur 500** au `POST /token` :

```
error finding user: sql: Scan error on column index 3, name "confirmation_token":
converting NULL to string is unsupported  →  500: Database error querying schema
```

**Cause racine :** le compte dédié avait été créé par un `INSERT` SQL direct
(réponse à l'incident). Un `INSERT` manuel laisse les colonnes « token » de
`auth.users` (`confirmation_token`, `recovery_token`, `email_change_token_new`,
`email_change`…) à **NULL**. GoTrue (écrit en Go) ne sait pas lire NULL dans une
chaîne et **échoue avant même de vérifier le mot de passe** — d'où un login
impossible malgré des identifiants valides. C'est un effet de bord de la
création manuelle, pas une compromission.

### Corrections appliquées (migration `20260726160000_auth_token_null_guard`)
1. **Réparation** : toutes les colonnes token NULL de `auth.users` remises à `''`.
2. **Garde-fou permanent** : trigger `trg_guard_auth_user_tokens`
   (`BEFORE INSERT OR UPDATE`) qui force `coalesce(col, '')` sur ces colonnes.
   Un `INSERT` SQL manuel ne peut donc **plus jamais** réintroduire la panne.
   (No-op pour GoTrue, qui écrit déjà `''`.)
3. **Côté dashboard** : le login distingue désormais hors-ligne / timeout /
   erreur serveur 5xx / identifiants — une anomalie **serveur** n'est plus
   jamais présentée comme un problème de réseau, et un timeout de 20 s évite
   l'attente sans fin sur réseau lent.

### Créer un compte admin par SQL — recette SÛRE (break-glass)
Le trigger protège désormais, mais pour rester explicite, initialiser les
colonnes token à `''` dès l'`INSERT` :

```sql
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated', 'nouvel-admin@afriloveworld.com',
  extensions.crypt('MOT_DE_PASSE_FORT', extensions.gen_salt('bf', 10)),
  now(), now(), now(),
  '', '', '', '',                       -- ← jamais NULL
  '{"provider":"email","providers":["email"]}', '{"role":"dashboard_admin"}'
);
-- puis créer l'identité auth.identities et la ligne public.admin_users.
```

## Règles permanentes (à ne jamais enfreindre)

1. **Un compte admin ne sert QU'au dashboard.** Ne jamais se connecter à l'app
   mobile ni faire « mot de passe oublié » côté mobile avec une adresse admin.
2. **Comptes dédiés uniquement** (ex. `admin@…`, jamais un Gmail personnel déjà
   utilisé sur l'app).
3. Gérer les accès depuis **Rôles & accès** dans le dashboard (super admin).

## Durcissement recommandé (console Supabase — 2 min)

- **Auth → Providers → Email** : activer *Leaked password protection*
  (vérification HaveIBeenPwned).
- **Auth → MFA** : activer et exiger la MFA (TOTP) pour les comptes admin.
- **Auth → URL Configuration** : n'autoriser que les URLs de redirection
  légitimes (deep link mobile + domaine du dashboard), rien d'autre.
- Rotation périodique du mot de passe admin depuis le dashboard.

## En cas de perte du mot de passe admin (break-glass)

Le compte dédié ne reçoit pas d'e-mail : la réinitialisation se fait par un
super admin via SQL (Supabase SQL editor) :

```sql
update auth.users
set encrypted_password = extensions.crypt('NOUVEAU_MOT_DE_PASSE',
                                           extensions.gen_salt('bf', 10)),
    updated_at = now()
where email = 'admin@afriloveworld.com';
```
