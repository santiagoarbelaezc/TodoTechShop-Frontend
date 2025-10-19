import { Component, AfterViewInit, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarClienteComponent } from '../navbar-cliente/navbar-cliente.component';
import { CarruselPublicoComponent } from '../carrusel-publico/carrusel-publico.component'; // ✅ NUEVO IMPORT
import { ProductoService } from '../../../services/producto.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarStateService } from '../../../services/navbar-state.service';
import { ProductoDto } from '../../../models/producto/producto.dto';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarClienteComponent,
    CarruselPublicoComponent // ✅ REEMPLAZADO: CarruselProductosComponent por CarruselPublicoComponent
  ],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements AfterViewInit, OnInit {

  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private navbarStateService = inject(NavbarStateService);

  productosActivos: ProductoDto[] = [];
  productosGaming: ProductoDto[] = [];
  productosIphone: ProductoDto[] = [];
  productosAsus: ProductoDto[] = [];
  productosSamsung: ProductoDto[] = [];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Catálogo...');
    
    // ✅ ESTABLECER LA SECCIÓN ACTIVA EN EL NAVBAR
    this.navbarStateService.setSeccionActiva('inicio');
    console.log('🎯 Sección activa establecida: inicio');
    
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    console.log('🎯 Inicializando vista...');
    this.inicializarCarruseles();
  }

  // ✅ Cargar productos desde el servicio PÚBLICO
  private cargarProductos(): void {
    this.loading = true;
    this.error = null;

    this.productoService.obtenerProductosActivosPublicos().subscribe({
      next: (productos) => {
        this.productosActivos = productos;
        this.organizarProductosPorCategoria();
        this.loading = false;
        console.log('✅ Productos cargados correctamente (público):', productos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos públicos:', err);
        this.error = 'Error al cargar los productos. Intente nuevamente.';
        this.loading = false;
      }
    });
  }

  // ✅ Filtrar productos por categoría
  private organizarProductosPorCategoria(): void {
    this.productosGaming = this.productosActivos.filter(p =>
      p.categoria.nombre.toLowerCase().includes('gaming') ||
      p.nombre.toLowerCase().includes('gamer') ||
      p.nombre.toLowerCase().includes('rtx')
    );

    this.productosIphone = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('iphone') ||
      p.marca.toLowerCase().includes('apple')
    );

    this.productosAsus = this.productosActivos.filter(p =>
      p.marca.toLowerCase().includes('asus') ||
      p.nombre.toLowerCase().includes('asus')
    );

    this.productosSamsung = this.productosActivos.filter(p =>
      p.marca.toLowerCase().includes('samsung') ||
      p.nombre.toLowerCase().includes('samsung')
    );
  }

  private inicializarCarruseles(): void {
    // El scroll ahora se maneja dentro del componente CarruselPublicoComponent
    console.log('🎠 Carruseles públicos inicializados');
  }

  // ✅ Navegación a login para funcionalidades que requieren autenticación
  irALogin(): void {
    console.log('🔐 Redirigiendo al login desde catálogo público');
    this.router.navigate(['/login']);
  }

  // ✅ Volver al catálogo (útil para botones de navegación)
  volverAlCatalogo(): void {
    this.router.navigate(['/catalogo-cliente']);
  }

  // ✅ Recargar en caso de error
  recargarProductos(): void {
    this.cargarProductos();
  }
}