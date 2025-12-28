import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AosInitService } from './services/aos/aos-init.service';
import { AuthService } from './services/auth.service';
import { ScrollService } from './services/scroll.service'; // Importa el ScrollService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router,
    private aosInitService: AosInitService,
    private scrollService: ScrollService // Inyecta el servicio
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Inicializar AOS solo en el cliente
    if (this.isBrowser) {
      this.initializeAos();
    }

    // Configurar limpieza de auth al ir a login
    this.setupAuthCleanup();
    
    // Configurar scroll forzado en cada navegación
    this.setupForcedScroll();
  }

  /**
   * Inicializa el sistema de animaciones AOS
   */
  private initializeAos(): void {
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      try {
        this.aosInitService.init();
        console.log('✨ Sistema de animaciones AOS inicializado');
      } catch (error) {
        console.warn('⚠️ Error inicializando AOS:', error);
      }
    }, 500);
  }

  /**
   * Configura limpieza de autenticación al navegar a login
   */
  private setupAuthCleanup(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const url = event.url;
        
        if (url.includes('/login') || url === '/login') {
          console.log('🔐 Limpiando estado de autenticación...');
          this.authService.clearAuthState();
        }
      }
    });
  }

  /**
   * Configura scroll forzado en cada navegación
   */
  private setupForcedScroll(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log(`📍 Navegación iniciada a: ${event.url}`);
        
        // Forzar scroll al top inmediatamente cuando comienza la navegación
        setTimeout(() => {
          this.scrollService.scrollToTopInstant();
        }, 0);
      }
    });
  }
}