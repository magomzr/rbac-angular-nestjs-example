// These are just two simple guards to protect routes.
// the authGuard checks if the user is logged in, and the
// permissionGuard checks if the user has a specific permission.

// Nothing special here.

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/login']);
};

export function permissionGuard(permission: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.hasPermission(permission) || router.createUrlTree(['/forbidden']);
  };
}
