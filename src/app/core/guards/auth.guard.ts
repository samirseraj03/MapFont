import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

/**
 * Guard funcional que protege las rutas que requieren autenticación.
 *
 * Comprueba si existe una sesión activa de Supabase Auth.
 * - Si SÍ hay sesión → permite el acceso (devuelve true).
 * - Si NO hay sesión → redirige a /login y bloquea el acceso.
 *
 * Uso en rutas:
 *   { path: 'form', canActivate: [authGuard], loadComponent: () => ... }
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  try {
    const { data: { session } } = await authService.getSession();

    if (session) {
      return true; // ✅ Usuario autenticado, acceso permitido
    }

    // ❌ Sin sesión → redirigir a login
    console.warn('[AuthGuard] No hay sesión activa. Redirigiendo a /login...');
    return router.createUrlTree(['/login']);

  } catch (error) {
    console.error('[AuthGuard] Error comprobando la sesión:', error);
    return router.createUrlTree(['/login']);
  }
};
