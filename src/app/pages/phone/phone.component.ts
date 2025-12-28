import { Component, AfterViewInit, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarInicioComponent } from '../inicio/navbar-inicio/navbar-inicio.component';
import { CarritoComponent } from '../inicio/carrito/carrito.component';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito/carrito.service';
import { ProductoDto } from '../../models/producto/producto.dto';
import { CarruselProductosComponent } from '../inicio/carrusel-productos/carrusel-productos.component';
import { NavbarStateService } from '../../services/navbar-state.service';

@Component({
  selector: 'app-phone',
  standalone: true,
  imports: [
    CommonModule,
    NavbarInicioComponent,
    CarritoComponent,
    CarruselProductosComponent
  ],
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.css']
})
export class PhoneComponent implements AfterViewInit, OnInit {

  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private router = inject(Router);
  private navbarStateService = inject(NavbarStateService);

  productosActivos: ProductoDto[] = [];
  productosIphone: ProductoDto[] = [];
  productosSamsung: ProductoDto[] = [];
  productosXiaomi: ProductoDto[] = [];
  productosHuawei: ProductoDto[] = [];
  productosOppo: ProductoDto[] = [];
  productosMotorola: ProductoDto[] = [];
  productosGaming: ProductoDto[] = [];
  productosGamaAlta: ProductoDto[] = [];
  productosGamaMedia: ProductoDto[] = [];

  mostrarCarrito = false;
  carritoVisible = false;

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Smartphones...');
    
    // ✅ ESTABLECER LA SECCIÓN ACTIVA EN EL NAVBAR
    this.navbarStateService.setSeccionActiva('phone');
    console.log('🎯 Sección activa establecida: phone');
    
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    console.log('🎯 Inicializando vista de Smartphones...');
  }

  // ✅ Cargar productos desde el servicio
  private cargarProductos(): void {
    this.loading = true;
    this.error = null;

    this.productoService.obtenerProductosActivos().subscribe({
      next: (productos) => {
        this.productosActivos = productos;
        this.organizarSmartphonesPorMarca();
        this.loading = false;
        console.log('✅ Smartphones cargados correctamente:', productos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar smartphones:', err);
        this.error = 'Error al cargar los smartphones. Intente nuevamente.';
        this.loading = false;
      }
    });
  }

  // ✅ Filtrar smartphones por marca y categoría
  private organizarSmartphonesPorMarca(): void {
    const todosLosSmartphones = this.productosActivos.filter(p =>
      p.categoria.nombre.toLowerCase().includes('smartphone') ||
      p.categoria.nombre.toLowerCase().includes('teléfono') ||
      p.categoria.nombre.toLowerCase().includes('celular') ||
      p.nombre.toLowerCase().includes('iphone') ||
      p.nombre.toLowerCase().includes('samsung') ||
      p.nombre.toLowerCase().includes('xiaomi') ||
      p.nombre.toLowerCase().includes('huawei') ||
      p.nombre.toLowerCase().includes('oppo') ||
      p.nombre.toLowerCase().includes('motorola') ||
      p.nombre.toLowerCase().includes('celular') ||
      p.nombre.toLowerCase().includes('móvil')
    );

    // Filtrar por marcas específicas
    this.productosIphone = todosLosSmartphones.filter(p =>
      p.marca.toLowerCase().includes('apple') ||
      p.nombre.toLowerCase().includes('iphone')
    );

    this.productosSamsung = todosLosSmartphones.filter(p =>
      p.marca.toLowerCase().includes('samsung')
    );

    this.productosXiaomi = todosLosSmartphones.filter(p =>
      p.marca.toLowerCase().includes('xiaomi') ||
      p.nombre.toLowerCase().includes('redmi') ||
      p.nombre.toLowerCase().includes('poco')
    );

    this.productosHuawei = todosLosSmartphones.filter(p =>
      p.marca.toLowerCase().includes('huawei')
    );

    this.productosOppo = todosLosSmartphones.filter(p =>
      p.marca.toLowerCase().includes('oppo') ||
      p.nombre.toLowerCase().includes('realme')
    );

    this.productosMotorola = todosLosSmartphones.filter(p =>
      p.marca.toLowerCase().includes('motorola')
    );

    // Filtrar por categorías especiales
    this.productosGaming = todosLosSmartphones.filter(p =>
      p.categoria.nombre.toLowerCase().includes('gaming') ||
      p.nombre.toLowerCase().includes('gamer') ||
      p.nombre.toLowerCase().includes('rog') ||
      p.nombre.toLowerCase().includes('gaming')
    );

    this.productosGamaAlta = todosLosSmartphones.filter(p =>
      p.nombre.toLowerCase().includes('pro') ||
      p.nombre.toLowerCase().includes('max') ||
      p.nombre.toLowerCase().includes('ultra') ||
      p.nombre.toLowerCase().includes('premium') ||
      p.precio > 2000000 // Considerar gama alta si precio > 2 millones
    );

    this.productosGamaMedia = todosLosSmartphones.filter(p =>
      !this.productosGamaAlta.includes(p) && // Que no esté en gama alta
      p.precio > 800000 && p.precio <= 2000000 // Precio entre 800k y 2 millones
    );

    // ✅ LOGS INFORMATIVOS PARA DEPURACIÓN
    console.log('📊 Resumen de smartphones organizados:');
    console.log('📱 iPhone:', this.productosIphone.length);
    console.log('📱 Samsung:', this.productosSamsung.length);
    console.log('📱 Xiaomi:', this.productosXiaomi.length);
    console.log('📱 Huawei:', this.productosHuawei.length);
    console.log('📱 Oppo:', this.productosOppo.length);
    console.log('📱 Motorola:', this.productosMotorola.length);
    console.log('🎮 Gaming:', this.productosGaming.length);
    console.log('⭐ Gama Alta:', this.productosGamaAlta.length);
    console.log('📶 Gama Media:', this.productosGamaMedia.length);
    console.log('📦 Total smartphones encontrados:', todosLosSmartphones.length);
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