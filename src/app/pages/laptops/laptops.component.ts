import { Component, AfterViewInit, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarInicioComponent } from '../inicio/navbar-inicio/navbar-inicio.component';
import { CarritoComponent } from '../inicio/carrito/carrito.component';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { ProductoDto } from '../../models/producto/producto.dto';
import { CarruselProductosComponent } from '../inicio/carrusel-productos/carrusel-productos.component';
import { NavbarStateService } from '../../services/navbar-state.service'; // ✅ NUEVO SERVICIO

@Component({
  selector: 'app-laptops',
  standalone: true,
  imports: [
    CommonModule,
    NavbarInicioComponent,
    CarritoComponent,
    CarruselProductosComponent
  ],
  templateUrl: './laptops.component.html',
  styleUrls: ['./laptops.component.css']
})
export class LaptopsComponent implements AfterViewInit, OnInit {

  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);
  private navbarStateService = inject(NavbarStateService); // ✅ INYECTAR SERVICIO

  productosActivos: ProductoDto[] = [];
  productosAsus: ProductoDto[] = [];
  productosLenovo: ProductoDto[] = [];
  productosHp: ProductoDto[] = [];
  productosDell: ProductoDto[] = [];
  productosApple: ProductoDto[] = [];
  productosGaming: ProductoDto[] = [];
  productosUltrabooks: ProductoDto[] = [];

  mostrarCarrito = false;
  carritoVisible = false;

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Laptops...');
    
    // ✅ ESTABLECER LA SECCIÓN ACTIVA EN EL NAVBAR
    this.navbarStateService.setSeccionActiva('laptops');
    console.log('🎯 Sección activa establecida: laptops');
    
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    console.log('🎯 Inicializando vista de Laptops...');
  }

  // ✅ Cargar productos desde el servicio
  private cargarProductos(): void {
    this.loading = true;
    this.error = null;

    this.productoService.obtenerProductosActivos().subscribe({
      next: (productos) => {
        this.productosActivos = productos;
        this.organizarLaptopsPorMarca();
        this.loading = false;
        console.log('✅ Laptops cargadas correctamente:', productos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar laptops:', err);
        this.error = 'Error al cargar las laptops. Intente nuevamente.';
        this.loading = false;
      }
    });
  }

  // ✅ Filtrar laptops por marca
  private organizarLaptopsPorMarca(): void {
    const todasLasLaptops = this.productosActivos.filter(p =>
      p.categoria.nombre.toLowerCase().includes('laptop') ||
      p.categoria.nombre.toLowerCase().includes('portátil') ||
      p.nombre.toLowerCase().includes('laptop') ||
      p.nombre.toLowerCase().includes('notebook') ||
      p.nombre.toLowerCase().includes('portátil')
    );

    this.productosAsus = todasLasLaptops.filter(p =>
      p.marca.toLowerCase().includes('asus')
    );

    this.productosLenovo = todasLasLaptops.filter(p =>
      p.marca.toLowerCase().includes('lenovo')
    );

    this.productosHp = todasLasLaptops.filter(p =>
      p.marca.toLowerCase().includes('hp') ||
      p.marca.toLowerCase().includes('hewlett')
    );

    this.productosDell = todasLasLaptops.filter(p =>
      p.marca.toLowerCase().includes('dell')
    );

    this.productosApple = todasLasLaptops.filter(p =>
      p.marca.toLowerCase().includes('apple') ||
      p.nombre.toLowerCase().includes('macbook')
    );

    this.productosGaming = todasLasLaptops.filter(p =>
      p.categoria.nombre.toLowerCase().includes('gaming') ||
      p.nombre.toLowerCase().includes('gamer') ||
      p.nombre.toLowerCase().includes('rtx') ||
      p.nombre.toLowerCase().includes('gaming')
    );

    this.productosUltrabooks = todasLasLaptops.filter(p =>
      p.nombre.toLowerCase().includes('ultrabook') ||
      p.nombre.toLowerCase().includes('ultra') ||
      p.nombre.toLowerCase().includes('slim') ||
      p.nombre.toLowerCase().includes('delgado')
    );

    // ✅ LOGS INFORMATIVOS PARA DEPURACIÓN
    console.log('📊 Resumen de laptops organizadas:');
    console.log('🖥️ Asus:', this.productosAsus.length);
    console.log('💼 Lenovo:', this.productosLenovo.length);
    console.log('⚡ HP:', this.productosHp.length);
    console.log('🔧 Dell:', this.productosDell.length);
    console.log('🍎 Apple:', this.productosApple.length);
    console.log('🎮 Gaming:', this.productosGaming.length);
    console.log('✨ Ultrabooks:', this.productosUltrabooks.length);
    console.log('📦 Total laptops encontradas:', todasLasLaptops.length);
  }

  // ✅ Mostrar carrito cuando se hace scroll
  @HostListener('window:scroll')
  onScroll(): void {
    this.mostrarCarrito = window.scrollY > 300;
  }

  // ✅ Comunicación con componente carrito
  onCarritoVisibleChange(visible: boolean): void {
    this.carritoVisible = visible;
  }

  // ✅ Recargar en caso de error
  recargarProductos(): void {
    this.cargarProductos();
  }
}