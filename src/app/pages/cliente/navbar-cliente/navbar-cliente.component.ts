import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarSelectionStoreService } from '../../../services/navbar-selection-store.service';
import { NavbarStateService } from '../../../services/navbar-state.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-navbar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar-cliente.component.html',
  styleUrls: ['./navbar-cliente.component.css']
})
export class NavbarClienteComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private selectionStore = inject(NavbarSelectionStoreService);
  private navbarState = inject(NavbarStateService);
  
  seccionActiva: string = 'inicio';
  menuAbierto: boolean = false;
  scrolled: boolean = false;
  private subscription: Subscription = new Subscription();

  // ✅ INICIALIZA al cargar la página
  ngOnInit() {
    this.checkScroll();
    // Cargar la sección guardada al iniciar
    this.seccionActiva = this.selectionStore.obtenerSeccion();
    console.log(`📖 Navbar: Sección cargada -> "${this.seccionActiva}"`);

    // Suscribirse al estado del navbar para actualizaciones en tiempo real
    this.subscription = this.navbarState.seccionActiva$.subscribe(seccion => {
      this.seccionActiva = seccion;
      console.log(`🔄 Navbar actualizado: "${seccion}"`);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ✅ HostListener mejorado para scroll y resize
  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScroll() {
    this.checkScroll();
  }

  // ✅ Función para verificar scroll
  private checkScroll() {
    this.scrolled = window.scrollY > 10;
  }

  // Control del menú hamburguesa
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    // Bloquea/desbloquea el scroll del body
    document.body.style.overflow = this.menuAbierto ? 'hidden' : '';
  }

  closeMenu(): void {
    this.menuAbierto = false;
    document.body.style.overflow = '';
  }

  // Cierra el menú al hacer clic fuera (opcional)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isClickInsideMenu = target.closest('.nav-menu') !== null;
    const isClickOnHamburger = target.closest('.hamburger-btn') !== null;
    
    if (!isClickInsideMenu && !isClickOnHamburger && this.menuAbierto) {
      this.closeMenu();
    }
  }

  // NAVEGACIÓN - Ahora guarda la selección
  irABuscar(): void {
    console.log('🔍 Navegando a búsqueda');
    this.navbarState.setSeccionActiva('buscar');
    this.router.navigate(['/buscar-producto']);
  }

  irAInicio(): void { 
    console.log('🏠 Navegando a Inicio');
    this.navbarState.setSeccionActiva('inicio');
    this.router.navigate(['/catalogo-principal-todotech']); 
  }

  irAPhone(): void { 
    console.log('📱 Navegando a Phone');
    this.navbarState.setSeccionActiva('phone');
    this.router.navigate(['/phone']); 
  }

  irAGaming(): void { 
    console.log('🎮 Navegando a Gaming');
    this.navbarState.setSeccionActiva('gaming');
    this.router.navigate(['/catalogo-todotech-gaming']); 
  }

  irAAccesorios(): void { 
    console.log('🎧 Navegando a Accesorios');
    this.navbarState.setSeccionActiva('accesorios');
    this.router.navigate(['/accesorios']); 
  }

  irALaptops(): void { 
    console.log('💻 Navegando a Laptops');
    this.navbarState.setSeccionActiva('laptops');
    this.router.navigate(['/laptops']); 
  }

  irACatalogo(): void {
    console.log('🛍️ Navegando a Catálogo Público');
    this.navbarState.setSeccionActiva('catalogo');
    this.router.navigate(['/catalogo-todotech-presentacion']);
  }

  salir(): void {
    console.log('🚪 Redirigiendo al login');
    this.closeMenu();
    this.navbarState.setSeccionActiva('inicio'); // Reset al salir
    this.router.navigate(['/login']);
  }
}