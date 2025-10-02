import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar-inicio.component.html',
  styleUrls: ['./navbar-inicio.component.css']
})
export class NavbarInicioComponent {
  seccionActiva: string = 'inicio';

  private router = inject(Router);
  private authService = inject(AuthService);

  // Método para redirigir directamente al componente de búsqueda
  irABuscar(): void {
    this.router.navigate(['/buscar-producto']);
  }

  // Métodos de navegación existentes
  irAInicio(): void { 
    this.seccionActiva = 'inicio';
    this.router.navigate(['/inicio']); 
  }

  irAPhone(): void { 
    this.seccionActiva = 'phone';
    this.router.navigate(['/phone']); 
  }

  irAGaming(): void { 
    this.seccionActiva = 'gaming';
    this.router.navigate(['/gaming']); 
  }

  irAAccesorios(): void { 
    this.seccionActiva = 'accesorios';
    this.router.navigate(['/accesorios']); 
  }

  irALaptops(): void { 
    this.seccionActiva = 'laptops';
    this.router.navigate(['/laptops']); 
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}