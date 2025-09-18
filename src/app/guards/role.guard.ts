// src/app/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRole = route.data['role'];
  const requiredRoles = route.data['roles'];
  const user = authService.getCurrentUser();
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  
  // Verificar rol específico
  if (requiredRole && user.role !== requiredRole) {
    router.navigate(['/acceso-denegado']);
    return false;
  }
  
  // Verificar múltiples roles
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    router.navigate(['/acceso-denegado']);
    return false;
  }
  
  return true;
};