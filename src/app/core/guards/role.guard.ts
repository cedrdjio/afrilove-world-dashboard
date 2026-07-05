import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { hasRoleLevel, type AdminRole } from '../../models/admin.model';
import { AuthService } from '../auth/auth.service';

/**
 * Fabrique de guard de rôle : `roleGuard('admin')` n'accepte que les rôles
 * `admin` et `super_admin` (hiérarchie définie dans ROLE_LEVEL).
 */
export function roleGuard(minimum: AdminRole): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return hasRoleLevel(auth.role(), minimum) ? true : router.createUrlTree(['/forbidden']);
  };
}
