// src/app/app.component.ts - solución simple
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  constructor(private authService: AuthService) {
    // Solo limpiar si la URL actual es login
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/') {
      console.log('Iniciando en login, limpiando sesión...');
      this.authService.clearIfOnLoginPage();
    } else {
      console.log('Iniciando en ruta protegida:', currentPath);
      // La sesión se mantiene automáticamente por el localStorage
    }
  }
}