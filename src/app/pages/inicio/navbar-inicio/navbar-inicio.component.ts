import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenVentaService } from '../../../services/orden-venta.service';
import { NavbarStateService } from '../../../services/navbar-state.service'; // ✅ Nuevo servicio
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar-inicio.component.html',
  styleUrls: ['./navbar-inicio.component.css']
})
export class NavbarInicioComponent implements OnInit, OnDestroy {
  seccionActiva: string = 'inicio';
  private subscription: Subscription = new Subscription();

  private router = inject(Router);
  private authService = inject(AuthService);
  private ordenVentaService = inject(OrdenVentaService);
  private navbarStateService = inject(NavbarStateService); // ✅ Inyectar el nuevo servicio

  ngOnInit(): void {
    console.log('🔄 NavbarInicioComponent inicializado');
    
    // ✅ SUSCRIBIRSE A LOS CAMBIOS DEL ESTADO DEL NAVBAR
    this.subscription = this.navbarStateService.getSeccionActivaObservable().subscribe(
      (seccion) => {
        console.log('📢 NavbarInicioComponent: Sección activa actualizada:', seccion);
        this.seccionActiva = seccion;
      },
      (error) => {
        console.error('❌ Error en la suscripción del navbar:', error);
      }
    );

    // ✅ CARGAR EL ESTADO ACTUAL AL INICIALIZAR
    this.seccionActiva = this.navbarStateService.getSeccionActiva();
    console.log('🎯 Sección activa inicial:', this.seccionActiva);
  }

  ngOnDestroy(): void {
    // ✅ LIMPIAR LA SUSCRIPCIÓN AL DESTRUIR EL COMPONENTE
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ✅ NUEVO MÉTODO: Regresar al componente OrdenVenta
  regresarAOrdenVenta(): void {
    console.log('🔄 Regresando a OrdenVentaComponent...');
    
    this.router.navigate(['/ordenVenta']).then((navegacionExitosa) => {
      if (navegacionExitosa) {
        console.log('✅ Navegación exitosa a /ordenVenta');
        this.navbarStateService.setSeccionActiva('inicio');
      } else {
        console.error('❌ Error en la navegación a /ordenVenta');
      }
    }).catch(error => {
      console.error('❌ Error al navegar a /ordenVenta:', error);
    });
  }

  // Método para redirigir directamente al componente de búsqueda
  irABuscar(): void {
    this.router.navigate(['/buscar-producto']);
  }

  // ✅ MÉTODOS DE NAVEGACIÓN ACTUALIZADOS - AHORA USAN EL SERVICIO
  irAInicio(): void { 
    console.log('🏠 Navegando a Inicio');
    this.navbarStateService.setSeccionActiva('inicio');
    this.router.navigate(['/inicio']); 
  }

  irAPhone(): void { 
    console.log('📱 Navegando a Phone');
    this.navbarStateService.setSeccionActiva('phone');
    this.router.navigate(['/phone']); 
  }

  irAGaming(): void { 
    console.log('🎮 Navegando a Gaming');
    this.navbarStateService.setSeccionActiva('gaming');
    this.router.navigate(['/gaming']); 
  }

  irAAccesorios(): void { 
    console.log('🎧 Navegando a Accesorios');
    this.navbarStateService.setSeccionActiva('accesorios');
    this.router.navigate(['/accesorios']); 
  }

  irALaptops(): void { 
    console.log('💻 Navegando a Laptops');
    this.navbarStateService.setSeccionActiva('laptops');
    this.router.navigate(['/laptops']); 
  }

  salir(): void {
    console.log('🚪 Cerrando sesión y limpiando orden actual...');
    
    // ✅ LIMPIAR LA ORDEN ACTUAL ANTES DE CERRAR SESIÓN
    this.ordenVentaService.limpiarOrdenActual();
    console.log('🗑️ Orden actual limpiada correctamente');
    
    // ✅ RESETEAR EL ESTADO DEL NAVBAR
    this.navbarStateService.setSeccionActiva('inicio');
    
    // Cerrar sesión
    this.authService.logout();
    
    // Navegar al login
    this.router.navigate(['/login']);
  }
}