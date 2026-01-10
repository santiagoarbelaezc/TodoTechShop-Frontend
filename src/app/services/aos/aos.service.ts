import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as AOS from 'aos';
import { RouteConfig } from '../../config/aos.config';

interface ProgressiveRevealConfig {
  duration?: number;
  staggerDelay?: number;
  easing?: string;
  offset?: number;
  rootMargin?: string;
  threshold?: number | number[];
}

@Injectable({
  providedIn: 'root'
})
export class AosService {
  private isBrowser: boolean;
  private initialized = false;
  private intersectionObservers: Map<string, IntersectionObserver> = new Map();
  private revealedElements: Set<HTMLElement> = new Set();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Inicializa AOS con configuración específica
   */
  init(config?: Partial<RouteConfig>): void {
    if (this.isBrowser && typeof AOS !== 'undefined' && AOS.init) {
      try {
        const defaultConfig: RouteConfig = {
          duration: 800,
          easing: 'ease-out-cubic',
          once: true,
          offset: 80,
          delay: 100,
          mirror: false,
          disable: false
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        AOS.init(finalConfig as any);
        this.initialized = true;
        
        console.log('✅ AOS inicializado:', finalConfig);
      } catch (error) {
        console.error('❌ Error al inicializar AOS:', error);
        this.initialized = false;
      }
    }
  }

  /**
   * Refresca AOS para contenido dinámico
   */
  refresh(): void {
    if (this.isBrowser && this.initialized && typeof AOS !== 'undefined' && AOS.refresh) {
      try {
        AOS.refresh();
        console.log('🔄 AOS refrescado');
      } catch (error) {
        console.warn('⚠️ Error al refrescar AOS:', error);
      }
    }
  }

  /**
   * Aplica animación a un elemento específico
   */
  animateElement(element: HTMLElement, animation: string, delay: number = 0): void {
    if (this.isBrowser && element && this.initialized) {
      element.setAttribute('data-aos', animation);
      if (delay > 0) {
        element.setAttribute('data-aos-delay', delay.toString());
      }
      
      element.removeAttribute('data-aos');
      void element.offsetWidth;
      element.setAttribute('data-aos', animation);
      
      this.refresh();
    }
  }

  /**
   * Aplica animaciones escalonadas a múltiples elementos
   */
  animateElementsStaggered(selector: string, animation: string, baseDelay: number = 100): void {
    if (!this.isBrowser || !this.initialized) return;

    setTimeout(() => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        this.animateElement(element as HTMLElement, animation, baseDelay * index);
      });
      console.log(`✨ Aplicadas animaciones escalonadas a ${elements.length} elementos`);
    }, 300);
  }

  /**
   * Revela progresivamente elementos con efecto cascada elegante
   */
  revealProgressively(selector: string, config?: ProgressiveRevealConfig): void {
    if (!this.isBrowser) return;

    const defaultConfig: Required<ProgressiveRevealConfig> = {
      duration: 600,
      staggerDelay: 100,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      offset: 100,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const finalConfig = { ...defaultConfig, ...config };

    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      
      if (elements.length === 0) {
        console.warn(`⚠️ No se encontraron elementos con selector: ${selector}`);
        return;
      }

      const observerOptions: IntersectionObserverInit = {
        threshold: finalConfig.threshold,
        rootMargin: finalConfig.rootMargin
      };

      elements.forEach((element, index) => {
        if (!this.revealedElements.has(element)) {
          element.style.opacity = '0';
          element.style.transform = 'translateY(30px) scale(0.95)';
          element.style.transition = `all ${finalConfig.duration}ms ${finalConfig.easing}`;
          element.style.willChange = 'transform, opacity';
        }

        const observerId = `${selector}-${index}`;
        
        if (!this.intersectionObservers.has(observerId)) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const target = entry.target as HTMLElement;
              
              if (entry.isIntersecting && !this.revealedElements.has(target)) {
                setTimeout(() => {
                  target.style.opacity = '1';
                  target.style.transform = 'translateY(0) scale(1)';
                  this.revealedElements.add(target);
                  console.log(`✨ Elemento revelado: ${index + 1}/${elements.length}`);
                }, index * finalConfig.staggerDelay);
              }
            });
          }, observerOptions);

          observer.observe(element);
          this.intersectionObservers.set(observerId, observer);
        }
      });

      console.log(`🎬 Revelación progresiva iniciada: ${elements.length} elementos con delay de ${finalConfig.staggerDelay}ms`);
    }, 300);
  }

  /**
   * Revela elementos en línea (horizontalmente) con efecto wave
   */
  revealInLine(selector: string, config?: ProgressiveRevealConfig): void {
    if (!this.isBrowser) return;

    const defaultConfig: Required<ProgressiveRevealConfig> = {
      duration: 500,
      staggerDelay: 80,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      offset: 100,
      rootMargin: '0px',
      threshold: 0.2
    };

    const finalConfig = { ...defaultConfig, ...config };

    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      elements.forEach((element, index) => {
        if (!this.revealedElements.has(element)) {
          element.style.opacity = '0';
          element.style.transform = 'translateX(-20px) rotateZ(-2deg)';
          element.style.transition = `all ${finalConfig.duration}ms ${finalConfig.easing}`;
        }

        const observerId = `line-${selector}-${index}`;

        if (!this.intersectionObservers.has(observerId)) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const target = entry.target as HTMLElement;

              if (entry.isIntersecting && !this.revealedElements.has(target)) {
                setTimeout(() => {
                  target.style.opacity = '1';
                  target.style.transform = 'translateX(0) rotateZ(0deg)';
                  this.revealedElements.add(target);
                }, index * finalConfig.staggerDelay);
              }
            });
          }, { threshold: finalConfig.threshold, rootMargin: finalConfig.rootMargin });

          observer.observe(element);
          this.intersectionObservers.set(observerId, observer);
        }
      });

      console.log(`🌊 Efecto wave iniciado: ${elements.length} elementos`);
    }, 300);
  }

  /**
   * Revela elementos con efecto fade in puro
   */
  revealFadeOnly(selector: string, config?: ProgressiveRevealConfig): void {
    if (!this.isBrowser) return;

    const defaultConfig: Required<ProgressiveRevealConfig> = {
      duration: 800,
      staggerDelay: 120,
      easing: 'ease-out',
      offset: 80,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15
    };

    const finalConfig = { ...defaultConfig, ...config };

    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      elements.forEach((element, index) => {
        if (!this.revealedElements.has(element)) {
          element.style.opacity = '0';
          element.style.transition = `opacity ${finalConfig.duration}ms ${finalConfig.easing}`;
        }

        const observerId = `fade-${selector}-${index}`;

        if (!this.intersectionObservers.has(observerId)) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const target = entry.target as HTMLElement;

              if (entry.isIntersecting && !this.revealedElements.has(target)) {
                setTimeout(() => {
                  target.style.opacity = '1';
                  this.revealedElements.add(target);
                }, index * finalConfig.staggerDelay);
              }
            });
          }, { threshold: finalConfig.threshold, rootMargin: finalConfig.rootMargin });

          observer.observe(element);
          this.intersectionObservers.set(observerId, observer);
        }
      });

      console.log(`👁️ Efecto fade iniciado: ${elements.length} elementos`);
    }, 300);
  }

  /**
   * Revela elementos con zoom progresivo elegante
   */
  revealWithZoom(selector: string, config?: ProgressiveRevealConfig): void {
    if (!this.isBrowser) return;

    const defaultConfig: Required<ProgressiveRevealConfig> = {
      duration: 700,
      staggerDelay: 100,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      offset: 100,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    };

    const finalConfig = { ...defaultConfig, ...config };

    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      elements.forEach((element, index) => {
        if (!this.revealedElements.has(element)) {
          element.style.opacity = '0';
          element.style.transform = 'scale(0.85)';
          element.style.transition = `all ${finalConfig.duration}ms ${finalConfig.easing}`;
          element.style.willChange = 'transform, opacity';
        }

        const observerId = `zoom-${selector}-${index}`;

        if (!this.intersectionObservers.has(observerId)) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const target = entry.target as HTMLElement;

              if (entry.isIntersecting && !this.revealedElements.has(target)) {
                setTimeout(() => {
                  target.style.opacity = '1';
                  target.style.transform = 'scale(1)';
                  this.revealedElements.add(target);
                }, index * finalConfig.staggerDelay);
              }
            });
          }, { threshold: finalConfig.threshold, rootMargin: finalConfig.rootMargin });

          observer.observe(element);
          this.intersectionObservers.set(observerId, observer);
        }
      });

      console.log(`🔍 Efecto zoom iniciado: ${elements.length} elementos`);
    }, 300);
  }

  /**
   * Revela elementos con efecto de rotación suave
   */
  revealWithRotation(selector: string, config?: ProgressiveRevealConfig): void {
    if (!this.isBrowser) return;

    const defaultConfig: Required<ProgressiveRevealConfig> = {
      duration: 650,
      staggerDelay: 100,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      offset: 100,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const finalConfig = { ...defaultConfig, ...config };

    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];

      elements.forEach((element, index) => {
        if (!this.revealedElements.has(element)) {
          element.style.opacity = '0';
          element.style.transform = 'rotateZ(-5deg) scale(0.9)';
          element.style.transition = `all ${finalConfig.duration}ms ${finalConfig.easing}`;
          element.style.willChange = 'transform, opacity';
        }

        const observerId = `rotation-${selector}-${index}`;

        if (!this.intersectionObservers.has(observerId)) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              const target = entry.target as HTMLElement;

              if (entry.isIntersecting && !this.revealedElements.has(target)) {
                setTimeout(() => {
                  target.style.opacity = '1';
                  target.style.transform = 'rotateZ(0deg) scale(1)';
                  this.revealedElements.add(target);
                }, index * finalConfig.staggerDelay);
              }
            });
          }, { threshold: finalConfig.threshold, rootMargin: finalConfig.rootMargin });

          observer.observe(element);
          this.intersectionObservers.set(observerId, observer);
        }
      });

      console.log(`🔄 Efecto rotación iniciado: ${elements.length} elementos`);
    }, 300);
  }

  /**
   * Verifica si AOS está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reinicia AOS
   */
  restart(): void {
    if (this.isBrowser && this.initialized) {
      this.initialized = false;
      this.refresh();
      console.log('🔄 AOS reiniciado');
    }
  }

  /**
   * Configuración optimizada para móviles
   */
  setupMobileOptimization(): void {
    if (!this.isBrowser || !this.initialized) return;

    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      console.log('📱 Aplicando configuración optimizada para móviles');
      
      const mobileConfig: Partial<RouteConfig> = {
        duration: 600,
        offset: 50,
        delay: 50,
        disable: false
      };
      
      this.initialized = false;
      this.init(mobileConfig);
    }
  }

  /**
   * Limpia todas las animaciones AOS
   */
  clear(): void {
    if (this.isBrowser) {
      document.querySelectorAll('[data-aos]').forEach(element => {
        element.removeAttribute('data-aos');
        element.removeAttribute('data-aos-duration');
        element.removeAttribute('data-aos-delay');
        element.removeAttribute('data-aos-easing');
        element.removeAttribute('data-aos-offset');
      });
    }
  }

  /**
   * Limpia todos los observadores de intersección
   */
  clearObservers(): void {
    this.intersectionObservers.forEach(observer => observer.disconnect());
    this.intersectionObservers.clear();
    this.revealedElements.clear();
    console.log('🧹 Observadores de intersección limpiados');
  }

  /**
   * Obtiene estadísticas de elementos revelados
   */
  getRevealStats(): { totalRevealed: number; totalObservers: number } {
    return {
      totalRevealed: this.revealedElements.size,
      totalObservers: this.intersectionObservers.size
    };
  }
}