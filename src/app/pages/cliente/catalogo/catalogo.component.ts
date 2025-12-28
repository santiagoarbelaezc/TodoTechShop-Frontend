import { Component, AfterViewInit, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarClienteComponent } from '../navbar-cliente/navbar-cliente.component';
import { CarruselPublicoComponent } from '../carrusel-publico/carrusel-publico.component'; // ✅ NUEVO IMPORT
import { ProductoService } from '../../../services/producto.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarStateService } from '../../../services/navbar-state.service';
import { ProductoDto } from '../../../models/producto/producto.dto';
import { FooterClienteComponent } from '../footer-cliente/footer-cliente.component';
import { FeatureBannerComponent } from '../feature-banner-component/feature-banner-component.component';


@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CarruselPublicoComponent,
    FeatureBannerComponent
  ],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements AfterViewInit, OnInit, OnDestroy {

  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private navbarStateService = inject(NavbarStateService);

  private featureSectionObserver!: IntersectionObserver;

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
    this.setupBackgroundAnimation();
  }

  // ✅ Configurar animación dinámica del fondo basado en scroll
  private setupBackgroundAnimation(): void {
    const featureSection = document.querySelector('.feature-section-wrapper');
    if (!featureSection) return;

    const options = {
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    this.featureSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const root = document.documentElement;
        
        if (entry.isIntersecting) {
          // Calcular progreso basado en visibilidad
          const visibilityRatio = entry.intersectionRatio;
          
          // Transición: blanco (0%) → negro (25%) → naranja (50%) → naranja (75%) → blanco (100%)
          if (visibilityRatio < 0.25) {
            // Blanco a Negro
            const progress = visibilityRatio / 0.25;
            const color = this.interpolateColor('#ffffff', '#1a1a1a', progress);
            root.style.setProperty('--scroll-bg-color', color);
          } else if (visibilityRatio < 0.5) {
            // Negro a Naranja
            const progress = (visibilityRatio - 0.25) / 0.25;
            const color = this.interpolateColor('#1a1a1a', '#ff9900', progress);
            root.style.setProperty('--scroll-bg-color', color);
          } else if (visibilityRatio < 0.75) {
            // Naranja (mantener)
            root.style.setProperty('--scroll-bg-color', '#ff9900');
          } else {
            // Naranja a Blanco
            const progress = (visibilityRatio - 0.75) / 0.25;
            const color = this.interpolateColor('#ff9900', '#ffffff', progress);
            root.style.setProperty('--scroll-bg-color', color);
          }
        } else if (!entry.isIntersecting) {
          // Si no está en viewport, volver al blanco
          root.style.setProperty('--scroll-bg-color', '#ffffff');
        }
      });
    }, options);

    this.featureSectionObserver.observe(featureSection);
  }

  // ✅ Interpolar color entre dos colores hex
  private interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);
    
    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;
    
    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
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

  ngOnDestroy(): void {
    if (this.featureSectionObserver) {
      this.featureSectionObserver.disconnect();
    }
  }
}