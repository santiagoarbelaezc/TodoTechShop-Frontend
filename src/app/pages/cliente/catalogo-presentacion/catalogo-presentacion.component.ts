import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent, BannerImage } from '../banner/banner.component';
import { TrioPresentationComponent, ContentCard } from '../trio-presentation/trio-presentation.component';
import { FeatureBannerComponent } from '../feature-banner-component/feature-banner-component.component';
import * as AOS from 'aos';

@Component({
  selector: 'app-catalogo-presentacion',
  standalone: true,
  imports: [CommonModule, BannerComponent, TrioPresentationComponent, FeatureBannerComponent],
  templateUrl: './catalogo-presentacion.component.html',
  styleUrls: ['./catalogo-presentacion.component.css']
})
export class CatalogoPresentacionComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('dynamicBackground') dynamicBackground!: ElementRef;
  
  // 3 imágenes para el banner
  bannerImages: BannerImage[] = [
    {
      url: 'assets/mando-feature.jpg',
      alt: 'PlayStation 5 con DualSense',
      title: 'PlayStation 5',
      link: '/productos/ps5'
    },
    {
      url: 'assets/mando-feature3.jpg',
      alt: 'PlayStation 5 Digital Edition',
      title: 'PS5 Digital Edition',
      link: '/productos/ps5-digital'
    },
    {
      url: 'assets/mando-feature2.jpg',
      alt: 'Control DualSense de PS5',
      title: 'DualSense Controller',
      link: '/accesorios/dualsense'
    }
  ];

  // Configuración del banner
  bannerHeight: string = '80vh';
  hoverScale: number = 1.25;
  minScale: number = 0.8;
  hoverTransition: string = '0.6s cubic-bezier(0.23, 1, 0.32, 1)';

  // PRIMER TRIO PRESENTATION (Arriba) - Fondo blanco, texto negro
  trioCards1: ContentCard[] = [
    {
      imageUrl: 'assets/catalogo-banner3.png',
      altText: 'Diseño iPhone 17',
      title: 'Diseño Revolucionario',
      description: 'Titanio de grado aeroespacial. El iPhone más delgado y resistente hasta ahora.',
      link: '/diseno/iphone-17',
      textPosition: 'bottom'
    },
    {
      imageUrl: 'assets/ps5-console.png',
      altText: 'Chip A18 Pro',
      title: 'Chip A18 Pro',
      description: 'El chip más rápido en un smartphone. Rendimiento de próxima generación.',
      link: '/rendimiento/chip-a18',
      textPosition: 'top'
    },
    {
      imageUrl: 'assets/catalogo-banner7.png',
      altText: 'Batería iPhone 17',
      title: 'Batería Todo el Día',
      description: 'La mayor duración de batería en un iPhone. Carga rápida inalámbrica.',
      link: '/bateria/iphone-17',
      textPosition: 'bottom'
    }
  ];

  // Configuración del primer trio (fondo blanco)
  trioBackground1: string = '#ffffff';
  trioTextColor1: string = '#1d1d1f';
  trioCardHeight1: string = '550px';
  trioGap1: string = '2.5rem';
  trioHoverEffect1: boolean = true;
  trioLayout1: 'default' | 'alternate' | 'custom' = 'custom';

  // SEGUNDO TRIO PRESENTATION (Abajo) - Fondo negro, texto blanco
  trioCards2: ContentCard[] = [
    {
      imageUrl: 'assets/iphone17-2.png',
      altText: 'iPhone 17 Pro Titanio Negro',
      title: 'iPhone 17 Pro',
      description: 'Titanio de grado aeroespacial. Chip A18 Pro. Cámara de 48MP.',
      link: '/productos/iphone-17-pro',
      textPosition: 'bottom'
    },
    {
      imageUrl: 'assets/iphone-banner2.png',
      altText: 'iPhone 17 Colores Naturales',
      title: 'Nuevos Colores',
      description: 'Azul Sierra, Rosa Desértico, Verde Olivo y Blanco Natural.',
      link: '/productos/iphone-17-colores',
      textPosition: 'top'
    },
    {
      imageUrl: 'assets/iphone-banner.png',
      altText: 'Sistema de Cámara iPhone 17',
      title: 'Cámara Pro',
      description: 'Sistema de cámara avanzado con fotografía computacional.',
      link: '/caracteristicas/camara-iphone17',
      textPosition: 'bottom'
    }
  ];

  // Configuración del segundo trio (fondo negro)
  trioBackground2: string = '#000000';
  trioTextColor2: string = '#ffffff';
  trioCardHeight2: string = '550px';
  trioGap2: string = '2.5rem';
  trioHoverEffect2: boolean = true;
  trioLayout2: 'default' | 'alternate' | 'custom' = 'custom';

  // Variables para el efecto de fondo dinámico progresivo1E40AF
  private colorSections: HTMLElement[] = [];
  private readonly colors = ['#FFFFFF', '#FFFFFF', '#1E40AF', '#000000', '#000000']; // Blanco, Azul, Rojo, Negro, Blanco
  private readonly totalScrollDistance: number = 4000; // Distancia total de scroll para el efecto
  private scrollProgress: number = 0;
  private rafId: number | null = null;
  
  // Puntos de transición entre colores (en porcentaje del scroll total)
  private readonly transitionPoints = [0, 0.25, 0.5, 0.75, 1];

  constructor() { }

  ngOnInit(): void {
    // Inicializar AOS
    AOS.init({
      duration: 800,
      once: false,
      offset: 100,
      easing: 'ease-in-out-cubic'
    });
  }

  ngAfterViewInit(): void {
    // Inicializar las secciones de color después de que la vista esté lista
    setTimeout(() => {
      this.colorSections = Array.from(this.dynamicBackground.nativeElement.querySelectorAll('.color-section'));
      this.updateColorProgressIndicator();
      this.startScrollAnimation();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar el animation frame al destruir el componente
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    AOS.refresh();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.updateScrollProgress();
    this.updateBackgroundColor();
  }

  private startScrollAnimation(): void {
    const update = () => {
      this.updateScrollProgress();
      this.updateBackgroundColor();
      this.rafId = requestAnimationFrame(update);
    };
    this.rafId = requestAnimationFrame(update);
  }

  private updateScrollProgress(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Calcular el progreso del scroll (0 a 1)
    this.scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
    
    // Para nuestro efecto específico, mapear a la distancia total
    const scrollPosition = this.scrollProgress * this.totalScrollDistance;
    
    // Actualizar indicador de progreso
    this.updateColorProgressIndicator();
  }

  private updateBackgroundColor(): void {
    if (!this.colorSections.length) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calcular la posición relativa en la página (0 a 1)
    const scrollPosition = scrollTop / (documentHeight - windowHeight);
    
    // Mapear la posición del scroll a un valor de color
    const colorValue = this.calculateColorFromScroll(scrollPosition);
    
    // Aplicar el color al fondo dinámico
    if (this.dynamicBackground) {
      this.dynamicBackground.nativeElement.style.backgroundColor = colorValue;
      
      // También actualizar la variable CSS
      document.documentElement.style.setProperty('--dynamic-bg-color', colorValue);
    }
  }

  private calculateColorFromScroll(scrollProgress: number): string {
    // Asegurarse de que scrollProgress esté entre 0 y 1
    scrollProgress = Math.max(0, Math.min(1, scrollProgress));
    
    // Encontrar entre qué dos colores estamos
    const sectionIndex = Math.floor(scrollProgress * (this.colors.length - 1));
    const sectionProgress = (scrollProgress * (this.colors.length - 1)) - sectionIndex;
    
    // Si estamos en el último color, devolverlo directamente
    if (sectionIndex >= this.colors.length - 1) {
      return this.colors[this.colors.length - 1];
    }
    
    // Interpolar entre los dos colores
    const startColor = this.hexToRgb(this.colors[sectionIndex]);
    const endColor = this.hexToRgb(this.colors[sectionIndex + 1]);
    
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * sectionProgress);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * sectionProgress);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * sectionProgress);
    
    return this.rgbToHex(r, g, b);
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Eliminar el # si está presente
    hex = hex.replace(/^#/, '');
    
    // Parsear los componentes RGB
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private updateColorProgressIndicator(): void {
    const dots = document.querySelectorAll('.color-dot');
    if (!dots.length) return;
    
    // Determinar qué color está activo basado en el progreso
    const activeIndex = Math.floor(this.scrollProgress * (this.colors.length - 1));
    
    dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Método para cambiar a una sección específica (opcional, para navegación)
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}