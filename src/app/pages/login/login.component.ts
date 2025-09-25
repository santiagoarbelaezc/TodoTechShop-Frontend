// src/app/components/login/login.component.ts
import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  nombreUsuario: string = '';
  contrasena: string = '';
  isLoading: boolean = false;
  private hasSwapped: boolean = false;
  private returnUrl: string = '';
  private routerSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private route: ActivatedRoute
  ) {
    // Suscribirse a eventos de navegación para detectar cuando se vuelve al login
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url.includes('/login')) {
          // Revocar token cuando se navega al login
          this.authService.revokeToken();
        }
      }
    });
  }

  ngOnInit() {
    // Limpieza garantizada al entrar al login - USAR revokeToken() en lugar de clearAuthState()
    this.authService.revokeToken();
    
    // Obtener returnUrl de los query params si existe
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción para evitar memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSmoothSwap();
    }, 500);
  }

  private initSmoothSwap(): void {
    const loginContainer = this.elementRef.nativeElement.querySelector('.login-container');
    
    if (loginContainer && !this.hasSwapped) {
      loginContainer.classList.add('swap-init');
      
      setTimeout(() => {
        loginContainer.classList.remove('swap-init');
        loginContainer.classList.add('swap-completed');
        this.hasSwapped = true;
        this.activateSecondaryEffects();
      }, 1200);
    }
  }

  private activateSecondaryEffects(): void {
    this.activateWaves();
    this.activateOrbitalDots();
  }

  private activateWaves(): void {
    const waveCircles = this.elementRef.nativeElement.querySelectorAll('.wave-circle');
    waveCircles.forEach((circle: HTMLElement, index: number) => {
      setTimeout(() => {
        circle.style.animationPlayState = 'running';
      }, index * 400);
    });
  }

  private activateOrbitalDots(): void {
    const dots = this.elementRef.nativeElement.querySelectorAll('.dot');
    const orbitContainer = this.elementRef.nativeElement.querySelector('.orbit-dots');
    
    if (orbitContainer) {
      orbitContainer.style.animationPlayState = 'running';
    }
    
    dots.forEach((dot: HTMLElement, index: number) => {
      setTimeout(() => {
        dot.style.animationPlayState = 'running';
      }, index * 200);
    });
  }

  onLogin(): void {
    if (!this.nombreUsuario || !this.contrasena) {
      alert('Por favor ingresa usuario y contraseña');
      return;
    }
    
    this.isLoading = true;

    this.authService.login(this.nombreUsuario, this.contrasena).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (!success) {
          alert('Usuario o contraseña incorrectos');
        } else {
          // Login exitoso - manejar returnUrl si existe
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        alert(error.message || 'Error al intentar iniciar sesión');
      }
    });
  }

  goToRecoverPassword(event: Event) {
    event.preventDefault();
    this.router.navigate(['/recuperar-contrasena']);
  }

  // Método adicional para manejar el evento keypress (Enter)
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }
}