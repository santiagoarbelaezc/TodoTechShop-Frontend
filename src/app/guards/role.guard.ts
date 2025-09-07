// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const requiredRoles = route.data['roles'];
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    
    // Verificar rol específico
    if (requiredRole && user.tipoUsuario !== requiredRole) {
      this.router.navigate(['/acceso-denegado']);
      return false;
    }
    
    // Verificar múltiples roles
    if (requiredRoles && !requiredRoles.includes(user.tipoUsuario)) {
      this.router.navigate(['/acceso-denegado']);
      return false;
    }
    
    return true;
  }
}