import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar-cliente.component.html',
  styleUrls: ['./navbar-cliente.component.css']
})
export class NavbarClienteComponent {

  private router = inject(Router);
  seccionActiva: string = 'inicio';

  // 🔹 NAVEGACIÓN BÁSICA - SOLO REDIRECCIONES
  irABuscar(): void {
    console.log('🔍 Navegando a búsqueda');
    this.router.navigate(['/buscar-producto']);
  }

  irAInicio(): void { 
    console.log('🏠 Navegando a Inicio');
    this.seccionActiva = 'inicio';
    this.router.navigate(['/inicio']); 
  }

  irAPhone(): void { 
    console.log('📱 Navegando a Phone');
    this.seccionActiva = 'phone';
    this.router.navigate(['/phone']); 
  }

  irAGaming(): void { 
    console.log('🎮 Navegando a Gaming');
    this.seccionActiva = 'gaming';
    this.router.navigate(['/gaming']); 
  }

  irAAccesorios(): void { 
    console.log('🎧 Navegando a Accesorios');
    this.seccionActiva = 'accesorios';
    this.router.navigate(['/accesorios']); 
  }

  irALaptops(): void { 
    console.log('💻 Navegando a Laptops');
    this.seccionActiva = 'laptops';
    this.router.navigate(['/laptops']); 
  }

  irACatalogo(): void {
    console.log('🛍️ Navegando a Catálogo Público');
    this.seccionActiva = 'catalogo';
    this.router.navigate(['/catalogo-cliente']);
  }

  salir(): void {
    console.log('🚪 Redirigiendo al login');
    this.router.navigate(['/login']);
  }
}