import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { AosService } from './aos.service';
import { aosConfig, getRouteConfig } from '../../config/aos.config';

@Injectable({
  providedIn: 'root'
})
export class AosInitService implements OnDestroy {
  private routerSubscription?: Subscription;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private aosService: AosService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Inicialización principal de AOS
   */
  init(): void {
    if (!this.isBrowser) return;

    console.log('🚀 Inicializando AOS...');
    
    // Usar configuración global inicial
    this.aosService.init(aosConfig.global);
    
    // Configurar listener de router
    this.setupRouterListener();
    
    // Configurar para móviles si es necesario
    this.setupMobileOptimization();
    
    console.log('✅ AOS inicializado correctamente');
  }

  /**
   * Configura listener para cambios de ruta
   */
  private setupRouterListener(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('📍 Cambio de ruta detectado:', event.urlAfterRedirects);
        this.handleRouteChange(event.urlAfterRedirects);
      });
  }

  /**
   * Configura optimización para móviles
   */
  private setupMobileOptimization(): void {
    if (!this.isBrowser) return;

    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      console.log('📱 Configurando AOS para móvil');
      this.aosService.setupMobileOptimization();
    }
  }

  /**
   * Maneja el cambio de ruta
   */
  private handleRouteChange(url: string): void {
    if (!this.isBrowser) return;

    // Extraer ruta base sin query params
    const baseRoute = this.extractBaseRoute(url);
    
    // Pequeño delay para que Angular termine la navegación
    setTimeout(() => {
      // Configurar AOS para la nueva ruta
      this.configureForRoute(baseRoute);
      
      // Aplicar animaciones específicas
      this.applyRouteSpecificAnimations(baseRoute);
      
      // Refrescar AOS
      this.aosService.refresh();
    }, 300);
  }

  /**
   * Extrae la ruta base de la URL
   */
  private extractBaseRoute(url: string): string {
    const urlWithoutParams = url.split('?')[0];
    const urlWithoutHash = urlWithoutParams.split('#')[0];
    return urlWithoutHash;
  }

  /**
   * Configura AOS para una ruta específica
   */
  configureForRoute(route: string): void {
    if (!this.isBrowser) return;

    // Usar la función helper para obtener la configuración
    const routeConfig = getRouteConfig(route);
    
    console.log(`🎯 Configurando AOS para ruta: ${route}`, routeConfig);
    this.aosService.init(routeConfig);
  }

  /**
   * Aplica animaciones específicas para la ruta
   */
  private applyRouteSpecificAnimations(route: string): void {
    if (!this.isBrowser) return;

    // Animaciones específicas para catálogo
    if (route === '/catalogo') {
      this.applyCatalogAnimations();
    }
    
    // Animaciones específicas para descripción de cliente
    if (route === '/descripcion-cliente') {
      this.applyProductDetailAnimations();
    }
  }

  /**
   * Animaciones específicas para catálogo
   */
  private applyCatalogAnimations(): void {
    // Banner con animación especial
    const banner = document.querySelector('.banner');
    if (banner) {
      this.aosService.animateElement(banner as HTMLElement, 'zoom-in', 200);
    }

    // Texto reveal
    const revealTexts = document.querySelectorAll('.reveal-text');
    revealTexts.forEach((text, index) => {
      this.aosService.animateElement(text as HTMLElement, 'fade-up', 300 + (index * 100));
    });

    // Promociones con flip
    const promoBoxes = document.querySelectorAll('.promo-box');
    promoBoxes.forEach((box, index) => {
      this.aosService.animateElement(box as HTMLElement, 'flip-left', 200 + (index * 150));
    });

    // Carruseles
    const carruseles = document.querySelectorAll('app-carrusel-publico');
    carruseles.forEach((carrusel, index) => {
      this.aosService.animateElement(carrusel as HTMLElement, 'fade-up', 100 + (index * 200));
    });
  }

  /**
   * Animaciones específicas para detalle de producto
   */
  private applyProductDetailAnimations(): void {
    // Imagen del producto
    const productImage = document.querySelector('.main-product-image');
    if (productImage) {
      this.aosService.animateElement(productImage as HTMLElement, 'zoom-in', 200);
    }

    // Información del producto
    const productInfo = document.querySelectorAll('.product-info-section > *');
    productInfo.forEach((element, index) => {
      this.aosService.animateElement(element as HTMLElement, 'fade-up', 100 + (index * 50));
    });

    // Especificaciones
    const specs = document.querySelectorAll('.spec-item');
    specs.forEach((spec, index) => {
      this.aosService.animateElement(spec as HTMLElement, 'fade-right', 200 + (index * 30));
    });
  }

  /**
   * Aplica animaciones escalonadas a múltiples elementos
   */
  animateStaggered(selector: string, animation: string, baseDelay: number = 100): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        this.aosService.animateElement(element as HTMLElement, animation, baseDelay * index);
      });
    }, 300);
  }

  /**
   * Limpia recursos
   */
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}