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
