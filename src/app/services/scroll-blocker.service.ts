// src/app/services/scroll-blocker.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollBlockerService {
  private isBrowser: boolean;
  private isBlocking: boolean = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.initScrollBlocking();
    }
  }

  private initScrollBlocking(): void {
    // Bloquear scroll al iniciar navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.blockScroll();
    });

    // Desbloquear scroll después de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => {
        this.unblockScroll();
        // Forzar scroll al top después de desbloquear
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 10);
      }, 100);
    });
  }

  private blockScroll(): void {
    if (!this.isBrowser || this.isBlocking) return;
    
    this.isBlocking = true;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    console.log('🚫 Scroll bloqueado');
  }

  private unblockScroll(): void {
    if (!this.isBrowser || !this.isBlocking) return;
    
    this.isBlocking = false;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    console.log('✅ Scroll desbloqueado');
  }
}