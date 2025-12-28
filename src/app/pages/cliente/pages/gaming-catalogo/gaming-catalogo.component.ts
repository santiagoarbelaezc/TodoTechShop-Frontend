import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';

import { CatalogoGamingComponent } from '../../catalogo-gaming/catalogo-gaming.component';
import { FooterClienteComponent } from '../../footer-cliente/footer-cliente.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NavbarClienteComponent } from '../../navbar-cliente/navbar-cliente.component';

@Component({
  selector: 'app-gaming-catalogo',
  standalone: true,
  imports: [NavbarClienteComponent, CatalogoGamingComponent, FooterClienteComponent],
  templateUrl: './gaming-catalogo.component.html',
  styleUrl: './gaming-catalogo.component.css'
})
export class GamingCatalogoComponent implements OnInit, AfterViewInit, OnDestroy {
  
  private router = inject(Router);
  private routerSubscription!: Subscription;
  private scanlineElement!: HTMLElement;

  ngOnInit(): void {
    console.log('🎮 GamingCatalogoComponent inicializado');
    
    // Escuchar cambios de ruta para scroll al top
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    
    // Añadir clase al body para tema global
    document.body.classList.add('gaming-theme');
  }

  ngAfterViewInit(): void {
    console.log('✨ Vista GamingCatalogo cargada');
    
    // Crear efecto scanline dinámico
    this.createScanlineEffect();
    
    // Inicializar efectos de partículas
    this.initParticleEffects();
    
    // Inicializar scroll animations
    this.initScrollAnimations();
  }

  private createScanlineEffect(): void {
    // Crear elemento scanline si no existe
    if (!document.querySelector('.scanline')) {
      this.scanlineElement = document.createElement('div');
      this.scanlineElement.className = 'scanline';
      document.body.appendChild(this.scanlineElement);
    }
  }

  private initParticleEffects(): void {
    // Puedes añadir lógica para partículas dinámicas aquí
    // Por ejemplo, usando una librería como particles.js o código nativo
    console.log('✨ Efectos de partículas inicializados');
  }

  private initScrollAnimations(): void {
    // Configurar Intersection Observer para animaciones al hacer scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, observerOptions);

    // Observar elementos con clase 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  ngOnDestroy(): void {
    console.log('♻️ GamingCatalogoComponent destruido');
    
    // Limpiar suscripciones
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    
    // Remover scanline
    if (this.scanlineElement && this.scanlineElement.parentNode) {
      this.scanlineElement.parentNode.removeChild(this.scanlineElement);
    }
    
    // Remover clase del body
    document.body.classList.remove('gaming-theme');
  }
}