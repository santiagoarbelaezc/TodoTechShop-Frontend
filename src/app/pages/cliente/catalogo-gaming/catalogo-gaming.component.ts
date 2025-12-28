import { Component, AfterViewInit, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarruselPublicoComponent } from '../carrusel-publico/carrusel-publico.component';
import { ProductoService } from '../../../services/producto.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarStateService } from '../../../services/navbar-state.service';
import { ProductoDto } from '../../../models/producto/producto.dto';
import { FeatureBannerComponent } from '../feature-banner-component/feature-banner-component.component';
import { CarruselGamingComponent } from '../carrusel-gaming/carrusel-gaming.component';

@Component({
  selector: 'app-catalogo-gaming',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CarruselGamingComponent,
    FeatureBannerComponent
  ],
  templateUrl: './catalogo-gaming.component.html',
  styleUrls: ['./catalogo-gaming.component.css']
})
export class CatalogoGamingComponent implements AfterViewInit, OnInit, OnDestroy {

  private productoService = inject(ProductoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private navbarStateService = inject(NavbarStateService);

  private featureSectionObserver!: IntersectionObserver;

  productosActivos: ProductoDto[] = [];
  
  // Categorías Gaming
  productosPlayStation: ProductoDto[] = [];
  productosXbox: ProductoDto[] = [];
  productosPcGamer: ProductoDto[] = [];
  productosNintendo: ProductoDto[] = [];
  productosAccesoriosGaming: ProductoDto[] = [];
  productosJuegos: ProductoDto[] = [];
  productosSillasGaming: ProductoDto[] = [];
  productosMonitoresGaming: ProductoDto[] = [];

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Catálogo Gaming...');
    
    // ✅ ESTABLECER LA SECCIÓN ACTIVA EN EL NAVBAR
    this.navbarStateService.setSeccionActiva('gaming');
    console.log('🎯 Sección activa establecida: gaming');
    
    this.cargarProductos();
  }

  ngAfterViewInit(): void {
    console.log('🎯 Inicializando vista Gaming...');
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
          
          // Transición personalizada para gaming
          if (visibilityRatio < 0.25) {
            // Azul oscuro a Morado
            const progress = visibilityRatio / 0.25;
            const color = this.interpolateColor('#0a0a2a', '#6a0dad', progress);
            root.style.setProperty('--scroll-bg-color', color);
          } else if (visibilityRatio < 0.5) {
            // Morado a Rojo gaming
            const progress = (visibilityRatio - 0.25) / 0.25;
            const color = this.interpolateColor('#6a0dad', '#cc0000', progress);
            root.style.setProperty('--scroll-bg-color', color);
          } else if (visibilityRatio < 0.75) {
            // Rojo gaming (mantener)
            root.style.setProperty('--scroll-bg-color', '#cc0000');
          } else {
            // Rojo a Azul oscuro
            const progress = (visibilityRatio - 0.75) / 0.25;
            const color = this.interpolateColor('#cc0000', '#0a0a2a', progress);
            root.style.setProperty('--scroll-bg-color', color);
          }
        } else if (!entry.isIntersecting) {
          // Si no está en viewport, volver al azul oscuro
          root.style.setProperty('--scroll-bg-color', '#0a0a2a');
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
        this.organizarProductosPorCategoriaGaming();
        this.loading = false;
        console.log('✅ Productos gaming cargados correctamente:', productos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar productos gaming:', err);
        this.error = 'Error al cargar los productos gaming. Intente nuevamente.';
        this.loading = false;
      }
    });
  }

  // ✅ Filtrar productos por categorías gaming
  private organizarProductosPorCategoriaGaming(): void {
    // PlayStation (consolas, mandos, accesorios PlayStation)
    this.productosPlayStation = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('playstation') ||
      p.nombre.toLowerCase().includes('ps5') ||
      p.nombre.toLowerCase().includes('ps4') ||
      p.nombre.toLowerCase().includes('dual sense') ||
      p.nombre.toLowerCase().includes('dualsense') ||
      (p.categoria.nombre.toLowerCase().includes('consola') && 
       (p.marca.toLowerCase().includes('sony') || p.nombre.toLowerCase().includes('sony')))
    );

    // Xbox (consolas, mandos, accesorios Xbox)
    this.productosXbox = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('xbox') ||
      p.nombre.toLowerCase().includes('series x') ||
      p.nombre.toLowerCase().includes('series s') ||
      p.nombre.toLowerCase().includes('xbox controller') ||
      (p.categoria.nombre.toLowerCase().includes('consola') && 
       p.marca.toLowerCase().includes('microsoft'))
    );

    // PC Gamer (computadoras, componentes)
    this.productosPcGamer = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('pc gamer') ||
      p.nombre.toLowerCase().includes('gaming pc') ||
      p.nombre.toLowerCase().includes('rtx') ||
      p.nombre.toLowerCase().includes('ryzen') ||
      p.nombre.toLowerCase().includes('core i7') ||
      p.nombre.toLowerCase().includes('core i9') ||
      p.nombre.toLowerCase().includes('gaming') ||
      p.categoria.nombre.toLowerCase().includes('computadora') ||
      p.categoria.nombre.toLowerCase().includes('laptop') ||
      (p.categoria.nombre.toLowerCase().includes('componente') && 
       (p.nombre.toLowerCase().includes('tarjeta gráfica') || 
        p.nombre.toLowerCase().includes('procesador')))
    );

    // Nintendo (Switch, juegos Nintendo)
    this.productosNintendo = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('nintendo') ||
      p.nombre.toLowerCase().includes('switch') ||
      p.marca.toLowerCase().includes('nintendo')
    );

    // Accesorios Gaming (teclados, mouse, headsets)
    this.productosAccesoriosGaming = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('teclado') ||
      p.nombre.toLowerCase().includes('mouse') ||
      p.nombre.toLowerCase().includes('headset') ||
      p.nombre.toLowerCase().includes('auricular') ||
      p.nombre.toLowerCase().includes('control') ||
      p.nombre.toLowerCase().includes('mando') ||
      p.categoria.nombre.toLowerCase().includes('accesorio') ||
      (p.categoria.nombre.toLowerCase().includes('periferico') && 
       p.nombre.toLowerCase().includes('gaming'))
    );

    // Videojuegos
    this.productosJuegos = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('juego') ||
      p.categoria.nombre.toLowerCase().includes('juego') ||
      p.categoria.nombre.toLowerCase().includes('videojuego') ||
      p.nombre.toLowerCase().match(/\bfifa\b|\bcod\b|\bgta\b|\bminecraft\b|\bfortnite\b/i)
    );

    // Sillas Gaming
    this.productosSillasGaming = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('silla') ||
      p.nombre.toLowerCase().includes('chair') ||
      p.categoria.nombre.toLowerCase().includes('silla') ||
      (p.categoria.nombre.toLowerCase().includes('mueble') && 
       p.nombre.toLowerCase().includes('gaming'))
    );

    // Monitores Gaming
    this.productosMonitoresGaming = this.productosActivos.filter(p =>
      p.nombre.toLowerCase().includes('monitor') ||
      p.categoria.nombre.toLowerCase().includes('monitor') ||
      (p.nombre.toLowerCase().includes('pantalla') && 
       p.nombre.toLowerCase().includes('gaming'))
    );

    console.log(`🎮 Productos encontrados:
      PlayStation: ${this.productosPlayStation.length}
      Xbox: ${this.productosXbox.length}
      PC Gamer: ${this.productosPcGamer.length}
      Nintendo: ${this.productosNintendo.length}
      Accesorios: ${this.productosAccesoriosGaming.length}
      Juegos: ${this.productosJuegos.length}
      Sillas: ${this.productosSillasGaming.length}
      Monitores: ${this.productosMonitoresGaming.length}
    `);
  }

  private inicializarCarruseles(): void {
    console.log('🎠 Carruseles gaming inicializados');
  }

  // ✅ Navegación a login para funcionalidades que requieren autenticación
  irALogin(): void {
    console.log('🔐 Redirigiendo al login desde catálogo gaming');
    this.router.navigate(['/login']);
  }

  // ✅ Volver al catálogo principal
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