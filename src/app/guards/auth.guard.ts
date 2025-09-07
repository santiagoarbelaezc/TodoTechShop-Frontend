// src/app/guards/auth.guard.ts - asegurar que no limpie sesión
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('AuthGuard verificando ruta:', this.router.url);
    
    if (this.authService.isLoggedIn()) {
      console.log('AuthGuard: Usuario autenticado ✅');
      return true;
    } else {
      console.log('AuthGuard: Acceso denegado 🔒 - Redirigiendo a login');
      // IMPORTANTE: No llamar a logout() aquí, solo redirigir
      this.router.navigate(['/login']);
      return false;
    }
  }
}