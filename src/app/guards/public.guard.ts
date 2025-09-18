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
    
    // Evitar redirección si ya estamos en la ruta destino
    const currentRoute = router.url;
    
    if (user) {
      let targetRoute = '/inicio';
      
      // Determinar la ruta destino según el rol
      switch (user.role) {
        case 'ADMIN':
          targetRoute = '/admin';
          break;
        case 'VENDEDOR':
          targetRoute = '/ordenVenta';
          break;
        case 'CAJERO':
          targetRoute = '/caja';
          break;
        case 'DESPACHADOR':
          targetRoute = '/despacho';
          break;
      }
      
      // Solo redirigir si no estamos ya en la ruta destino
      if (currentRoute !== targetRoute) {
        router.navigate([targetRoute]);
      }
    }
    
    return false;
  }
  
  // Si no está autenticado, permitir acceso a la ruta pública
  return true;
};