// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verificar si el usuario está autenticado
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirigir al login
    router.navigate(['/login']);
    return false;
  }
};