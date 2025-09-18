// src/app/guards/public.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Si el usuario ya está autenticado, redirigir a la página principal
  if (authService.isLoggedIn()) {
    const user = authService.getCurrentUser();
    if (user) {
      // Redirigir según el rol del usuario
      switch (user.role) {
        case 'ADMIN':
          router.navigate(['/admin']);
          break;
        case 'VENDEDOR':
          router.navigate(['/ordenVenta']);
          break;
        case 'CAJERO':
          router.navigate(['/caja']);
          break;
        case 'DESPACHADOR':
          router.navigate(['/despacho']);
          break;
        default:
          router.navigate(['/inicio']);
          break;
      }
    } else {
      router.navigate(['/inicio']);
    }
    return false;
  }
  
  // Si no está autenticado, permitir acceso a la ruta pública
  return true;
};