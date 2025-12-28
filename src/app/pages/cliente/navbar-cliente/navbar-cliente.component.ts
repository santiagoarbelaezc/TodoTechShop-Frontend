import { Component, inject, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarSelectionStoreService } from '../../../services/navbar-selection-store.service';


@Component({
  selector: 'app-navbar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar-cliente.component.html',
  styleUrls: ['./navbar-cliente.component.css']
})
export class NavbarClienteComponent implements OnInit {

  private router = inject(Router);
  private selectionStore = inject(NavbarSelectionStoreService); // 👈 Inyectar servicio
  
  seccionActiva: string = 'inicio';
  menuAbierto: boolean = false;
  scrolled: boolean = false;

  // ✅ INICIALIZA al cargar la página
  ngOnInit() {
    this.checkScroll();
    // Cargar la sección guardada al iniciar
    this.seccionActiva = this.selectionStore.obtenerSeccion();
    console.log(`📖 Navbar: Sección cargada -> "${this.seccionActiva}"`);
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
    this.selectionStore.guardarSeccion('buscar'); // 👈 Guardar
    this.router.navigate(['/buscar-producto']);
  }

  irAInicio(): void { 
    console.log('🏠 Navegando a Inicio');
    this.seccionActiva = 'inicio';
    this.selectionStore.guardarSeccion('inicio'); // 👈 Guardar
    this.router.navigate(['/catalogo-principal-todotech']); 
  }

  irAPhone(): void { 
    console.log('📱 Navegando a Phone');
    this.seccionActiva = 'phone';
    this.selectionStore.guardarSeccion('phone'); // 👈 Guardar
    this.router.navigate(['/phone']); 
  }

  irAGaming(): void { 
    console.log('🎮 Navegando a Gaming');
    this.seccionActiva = 'gaming';
    this.selectionStore.guardarSeccion('gaming'); // 👈 Guardar
    this.router.navigate(['/catalogo-todotech-gaming']); 
  }

  irAAccesorios(): void { 
    console.log('🎧 Navegando a Accesorios');
    this.seccionActiva = 'accesorios';
    this.selectionStore.guardarSeccion('accesorios'); // 👈 Guardar
    this.router.navigate(['/accesorios']); 
  }

  irALaptops(): void { 
    console.log('💻 Navegando a Laptops');
    this.seccionActiva = 'laptops';
    this.selectionStore.guardarSeccion('laptops'); // 👈 Guardar
    this.router.navigate(['/laptops']); 
  }

  irACatalogo(): void {
    console.log('🛍️ Navegando a Catálogo Público');
    this.seccionActiva = 'catalogo';
    this.selectionStore.guardarSeccion('catalogo'); // 👈 Guardar
    this.router.navigate(['/catalogo-todotech-presentacion']);
  }

  salir(): void {
    console.log('🚪 Redirigiendo al login');
    this.closeMenu();
    this.selectionStore.limpiarSeleccion(); // 👈 Limpiar al salir (opcional)
    this.router.navigate(['/login']);
  }
}