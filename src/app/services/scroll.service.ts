import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private isBrowser: boolean;
  private previousUrl: string = '';
  private isScrolling: boolean = false;
  private scrollTimeout: any = null;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.initScrollBehavior();
    }
  }

  private initScrollBehavior(): void {
    // Escuchar cuando INICIA la navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      // Cancelar cualquier scroll pendiente
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
      this.isScrolling = false;
    });

    // Escuchar cuando TERMINA la navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const newUrl = event.urlAfterRedirects || event.url;
      const oldUrl = this.previousUrl;
      
      console.log(`🔄 Navegación: ${oldUrl || '(inicio)'} -> ${newUrl}`);
      
      // Solo hacer scroll si es un cambio REAL de ruta
      if (this.isRealRouteChange(oldUrl, newUrl)) {
        console.log(`✅ Scroll programado para cambio de ruta`);
        
        // Esperar a que Angular termine de renderizar
        this.scrollTimeout = setTimeout(() => {
          this.scrollToTopInstant();
          this.scrollTimeout = null;
        }, 300); // Aumentado a 300ms para dar tiempo al render
      } else {
        console.log(`⚠️ Sin scroll - Solo cambio de query params`);
      }
      
      this.previousUrl = newUrl;
    });
  }

  /**
   * Determina si es un cambio REAL de ruta
   */
  private isRealRouteChange(oldUrl: string, newUrl: string): boolean {
    if (!oldUrl) return true;
    
    const getCleanPath = (url: string): string => {
      return url.split('?')[0].split('#')[0];
    };
    
    const oldPath = getCleanPath(oldUrl);
    const newPath = getCleanPath(newUrl);
    
    return oldPath !== newPath;
  }

  /**
   * Hacer scroll instantáneo al top CON MEJOR SINCRONIZACIÓN
   */
  scrollToTopInstant(): void {
    if (!this.isBrowser || this.isScrolling) return;

    this.isScrolling = true;
    console.log('⬆️ Ejecutando scrollToTopInstant (único)...');
    
    // Método 1: Usar scrollTo
    window.scrollTo(0, 0);
    
    // Método 2: Establecer propiedades directamente (más inmediato)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Método 3: Usar requestAnimationFrame para sincronizar con el render
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      
      // Resetear flag después de completar
      setTimeout(() => {
        this.isScrolling = false;
        console.log('✅ Scroll completado');
      }, 50);
    });
  }

  /**
   * Scroll suave al top (para uso manual)
   */
  scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    if (!this.isBrowser) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: behavior
    });
  }

  /**
   * Obtener posición actual del scroll
   */
  getScrollPosition(): number {
    if (!this.isBrowser) return 0;
    
    return window.pageYOffset || 
           document.documentElement.scrollTop || 
           document.body.scrollTop || 0;
  }

  /**
   * Cancelar cualquier scroll pendiente
   */
  cancelPendingScroll(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
    this.isScrolling = false;
  }
}