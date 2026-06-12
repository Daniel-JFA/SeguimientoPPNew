import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Si la ruta requiere un rol/nivel específico
    const requiredLevel = route.data?.['requiredLevel'] as number;
    if (requiredLevel !== undefined && !authService.hasRole(requiredLevel)) {
      // Redirigir si no tiene permisos
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/login']);
  return false;
};
