import type { Enums, Tables } from './database.types';

export type AdminRole = Enums<'admin_role'>;
export type AdminUser = Tables<'admin_users'>;

/** Hiérarchie des rôles : un rôle donne accès à tout ce qui est en dessous. */
export const ROLE_LEVEL: Record<AdminRole, number> = {
  viewer: 0,
  support: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

export const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
  moderator: 'Modérateur',
  support: 'Support',
  viewer: 'Lecteur',
};

export function hasRoleLevel(role: AdminRole | null | undefined, minimum: AdminRole): boolean {
  return role != null && ROLE_LEVEL[role] >= ROLE_LEVEL[minimum];
}
