import { Component, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  nombreUsuario: string = '';
  contrasena: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  showPassword: boolean = false;
  terminosAceptados: boolean = false;
  showTermsError: boolean = false;
  showQuickLogin: boolean = false; // Cambiar a true para desarrollo
  
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasSpecialChar: false
  };
  
  private hasSwapped: boolean = false;
  private returnUrl: string = '';
  private routerSubscription: Subscription;
  private animationFrameId: number | null = null;
  private particleData: { x: number; y: number; vx: number; vy: number; opacity: number; size: number; baseX: number; baseY: number }[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private route: ActivatedRoute
  ) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url.includes('/login')) {
          this.clearError();
        }
      }
    });
  }

  ngOnInit() {
    this.authService.logout();
    
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      
      if (params['sessionExpired']) {
        this.showErrorAlert('Su sesión ha expirado. Por favor ingrese nuevamente.');
      }
      
      if (params['unauthorized']) {
        this.showErrorAlert('No tiene permisos para acceder a esa página.');
      }
    });

    // Verificar si ya aceptó términos anteriormente
    this.verificarTerminosPrevios();
    this.clearError();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.stopParticleAnimation();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSmoothSwap();
      this.initParticleSystem();
      this.startParticleAnimation();
    }, 500);
  }

  // ========== SISTEMA DE PARTÍCULAS MEJORADO ==========
  private initParticleSystem(): void {
    const particles = this.elementRef.nativeElement.querySelectorAll('.particle');
    
    if (particles.length === 0) {
      console.log('No se encontraron partículas para animar');
      return;
    }

    console.log(`Inicializando sistema de partículas para ${particles.length} partículas`);
    
    // Inicializar datos de partículas con movimientos más variados
    particles.forEach((particle: HTMLElement, index: number) => {
      const rect = particle.getBoundingClientRect();
      const speed = this.getParticleSpeed(index);
      
      this.particleData[index] = {
        x: rect.left,
        y: rect.top,
        vx: (Math.random() - 0.5) * speed.x * 0.8,
        vy: (Math.random() - 0.5) * speed.y * 0.6,
        opacity: 0.7 + Math.random() * 0.3,
        size: this.getParticleSize(index),
        baseX: rect.left,
        baseY: rect.top
      };

      // Configuración inicial de estilo
      particle.style.willChange = 'transform, opacity';
      particle.style.transform = 'translate(0, 0)';
    });
  }

  private startParticleAnimation(): void {
    const particles = this.elementRef.nativeElement.querySelectorAll('.particle');
    const startTime = Date.now();
    
    if (particles.length === 0) return;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;
      
      particles.forEach((particle: HTMLElement, index: number) => {
        if (!this.particleData[index]) return;

        const data = this.particleData[index];
        const speed = this.getParticleSpeed(index);
        
        // Movimiento orgánico con múltiples frecuencias
        const wave1 = Math.sin(elapsed * speed.x) * 25;
        const wave2 = Math.cos(elapsed * speed.y * 0.7) * 15;
        const wave3 = Math.sin(elapsed * speed.x * 1.3 + index) * 10;
        
        const x = wave1 + wave3 + data.vx * elapsed * 20;
        const y = wave2 + data.vy * elapsed * 15;
        
        // Rotación dinámica
        const rotation = elapsed * speed.rotation * 15 + index * 45;
        
        // Efectos de opacidad complejos
        const opacityWave1 = Math.sin(elapsed * speed.opacity) * 0.2;
        const opacityWave2 = Math.cos(elapsed * speed.opacity * 1.5 + index) * 0.15;
        const baseOpacity = 0.6 + (index % 3) * 0.1;
        const opacity = Math.max(0.3, Math.min(0.9, baseOpacity + opacityWave1 + opacityWave2));
        
        // Efecto de escala sutil
        const scale = 1 + Math.sin(elapsed * speed.x * 2 + index) * 0.1;
        
        // Aplicar transformaciones
        particle.style.transform = `
          translate(${x}px, ${y}px) 
          rotate(${rotation}deg) 
          scale(${scale})
        `;
        
        particle.style.opacity = opacity.toString();
        
        // Efecto de brillo dinámico
        const brightness = 100 + Math.sin(elapsed * speed.opacity * 2) * 20;
        particle.style.filter = `brightness(${brightness}%) blur(${0.3 + Math.sin(elapsed) * 0.2}px)`;
      });
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private stopParticleAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      console.log('Animación de partículas detenida');
    }
  }

  private getParticleSpeed(index: number): { x: number; y: number; rotation: number; opacity: number } {
    const speeds = [
      { x: 0.18, y: 0.12, rotation: 0.05, opacity: 0.8 },
      { x: 0.15, y: 0.18, rotation: 0.08, opacity: 0.6 },
      { x: 0.22, y: 0.10, rotation: 0.03, opacity: 1.0 },
      { x: 0.12, y: 0.15, rotation: 0.06, opacity: 0.7 },
      { x: 0.20, y: 0.14, rotation: 0.10, opacity: 0.9 },
      { x: 0.10, y: 0.20, rotation: 0.04, opacity: 0.5 },
      { x: 0.16, y: 0.13, rotation: 0.07, opacity: 0.8 },
      { x: 0.14, y: 0.16, rotation: 0.09, opacity: 0.6 },
      { x: 0.19, y: 0.11, rotation: 0.05, opacity: 0.9 },
      { x: 0.13, y: 0.19, rotation: 0.08, opacity: 0.7 },
      { x: 0.21, y: 0.12, rotation: 0.06, opacity: 0.8 },
      { x: 0.11, y: 0.17, rotation: 0.07, opacity: 0.6 },
      { x: 0.17, y: 0.15, rotation: 0.04, opacity: 0.9 },
      { x: 0.15, y: 0.14, rotation: 0.09, opacity: 0.7 },
      { x: 0.18, y: 0.13, rotation: 0.05, opacity: 0.8 },
      { x: 0.14, y: 0.18, rotation: 0.08, opacity: 0.6 }
    ];
    
    return speeds[index] || speeds[0];
  }

  private getParticleSize(index: number): number {
    const sizes = [4, 6, 3, 5, 7, 2, 4, 6, 3, 5, 4, 6, 3, 5, 4, 6];
    return sizes[index] || 4;
  }

  // ========== ANIMACIÓN DEL LOGIN CONTAINER ==========
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

  // ========== MÉTODOS DE LOGIN EXISTENTES ==========
  onLogin(): void {
    // Validar términos y condiciones
    if (!this.terminosAceptados) {
      this.showTermsError = true;
      this.showErrorAlert('Debe aceptar los términos y condiciones para continuar');
      return;
    }

    // Validaciones básicas
    if (!this.nombreUsuario.trim() || !this.contrasena.trim()) {
      this.showErrorAlert('Por favor ingresa usuario y contraseña');
      return;
    }

    if (this.nombreUsuario.trim().length < 3) {
      this.showErrorAlert('El usuario debe tener al menos 3 caracteres');
      return;
    }

    if (!this.validatePassword()) {
      this.showErrorAlert('La contraseña no cumple con los requisitos mínimos de seguridad');
      return;
    }

    this.isLoading = true;
    this.clearError();
    this.showTermsError = false;

    const usuarioLimpio = this.nombreUsuario.trim();
    const contrasenaLimpia = this.contrasena.trim();

    this.authService.login(usuarioLimpio, contrasenaLimpia).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (!success) {
          this.showErrorAlert('Usuario o contraseña incorrectos');
        } else {
          this.handleLoginSuccess();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginSuccess(): void {
    // Guardar aceptación de términos
    this.guardarAceptacionTerminos();
    
    this.showSuccessAlert('¡Bienvenido! Redirigiendo...');
    
    setTimeout(() => {
      if (this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
      }
    }, 1000);
  }

  private handleLoginError(error: any): void {
    let errorMessage = 'Error al intentar iniciar sesión';
    
    if (error.error && error.error.mensaje) {
      errorMessage = error.error.mensaje;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifique su conexión.';
    } else if (error.status === 401) {
      errorMessage = 'Usuario o contraseña incorrectos';
    } else if (error.status === 403) {
      errorMessage = 'Usuario inactivo. Contacte al administrador.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Intente nuevamente más tarde.';
    }

    this.showErrorAlert(errorMessage);
  }

  private showErrorAlert(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  private showSuccessAlert(message: string): void {
    console.log('Login exitoso:', message);
  }

  private clearError(): void {
    this.errorMessage = '';
    this.showError = false;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }

  onInputChange(): void {
    if (this.showError) {
      this.clearError();
    }
    
    if (this.showTermsError && this.terminosAceptados) {
      this.showTermsError = false;
    }
    
    if (this.contrasena) {
      this.updatePasswordRequirements(this.contrasena);
    }
  }

  goToRecoverPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/recuperar-contrasena']);
  }

  // Método para abrir términos y condiciones
  openTerminos(event: Event): void {
    event.preventDefault();
    // Abrir en nueva pestaña o modal
    window.open('/terminos-condiciones', '_blank');
  }

  // Método para abrir política de privacidad
  openPoliticaPrivacidad(event: Event): void {
    event.preventDefault();
    // Abrir en nueva pestaña o modal
    window.open('/politica-privacidad', '_blank');
  }

  forceLogout(): void {
    this.authService.logout();
    this.showSuccessAlert('Sesión cerrada correctamente');
  }

  quickLogin(role: string): void {
    const users = {
      'admin': { user: 'admin1', pass: 'Tech123!' },
      'vendedor': { user: 'vendedor1', pass: 'Vende$456' },
      'cajero': { user: 'cajero1', pass: 'Caja@789' },
      'despachador': { user: 'despachador1', pass: 'Desp*101' }
    };

    const selectedUser = users[role as keyof typeof users];
    if (selectedUser) {
      this.nombreUsuario = selectedUser.user;
      this.contrasena = selectedUser.pass;
      this.terminosAceptados = true; // Auto-aceptar términos en login rápido
      this.updatePasswordRequirements(this.contrasena);
      setTimeout(() => this.onLogin(), 100);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  validateUsername(): boolean {
    return this.nombreUsuario.trim().length >= 3;
  }

  validatePassword(): boolean {
    const password = this.contrasena;
    this.updatePasswordRequirements(password);
    return this.passwordRequirements.minLength && 
           this.passwordRequirements.hasUpperCase && 
           this.passwordRequirements.hasSpecialChar;
  }

  private updatePasswordRequirements(password: string): void {
    this.passwordRequirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  isFormValid(): boolean {
    return this.validateUsername() && 
           this.validatePassword() && 
           this.terminosAceptados && 
           !this.isLoading;
  }

  getPasswordValidationMessage(): string {
    const req = this.passwordRequirements;
    const messages = [];
    
    if (!req.minLength) messages.push('mínimo 8 caracteres');
    if (!req.hasUpperCase) messages.push('una mayúscula');
    if (!req.hasSpecialChar) messages.push('un carácter especial');
    
    return messages.join(', ');
  }

  openUserManual(): void {
    this.router.navigate(['/manual-usuario']);
  }

  goToCatalog(): void {
    console.log('🔍 Navegando al catálogo público...');
    this.router.navigate(['/catalogo-principal-todotech']).then(success => {
      if (success) {
        console.log('✅ Navegación exitosa al catálogo');
      } else {
        console.error('❌ Error en la navegación al catálogo');
      }
    }).catch(error => {
      console.error('❌ Error al navegar:', error);
    });
  }

  // Métodos para manejar términos y condiciones
  private verificarTerminosPrevios(): void {
    const terminosAceptados = localStorage.getItem('terminosAceptados');
    const fechaAceptacion = localStorage.getItem('fechaAceptacionTerminos');
    
    if (terminosAceptados === 'true' && fechaAceptacion) {
      // Verificar si fue aceptado en los últimos 30 días
      const fechaAceptacionDate = new Date(fechaAceptacion);
      const hoy = new Date();
      const diferenciaDias = (hoy.getTime() - fechaAceptacionDate.getTime()) / (1000 * 3600 * 24);
      
      if (diferenciaDias <= 30) {
        this.terminosAceptados = true;
      }
    }
  }

  //nuevo comentario

  private guardarAceptacionTerminos(): void {
    localStorage.setItem('terminosAceptados', 'true');
    localStorage.setItem('fechaAceptacionTerminos', new Date().toISOString());
  }
}