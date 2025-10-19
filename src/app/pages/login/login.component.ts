// src/app/components/login/login.component.ts
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
  
  // Nuevas propiedades para mostrar requisitos de contraseña
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasSpecialChar: false
  };
  
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
          // Limpiar estado cuando se navega al login
          this.clearError();
        }
      }
    });
  }

  ngOnInit() {
    // Limpieza garantizada al entrar al login
    this.authService.logout();
    
    // Obtener returnUrl de los query params si existe
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      
      // Mostrar mensaje si fue redirigido por expiración de sesión
      if (params['sessionExpired']) {
        this.showErrorAlert('Su sesión ha expirado. Por favor ingrese nuevamente.');
      }
      
      if (params['unauthorized']) {
        this.showErrorAlert('No tiene permisos para acceder a esa página.');
      }
    });

    // Limpiar cualquier error previo
    this.clearError();
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
    // Validaciones básicas
    if (!this.nombreUsuario.trim() || !this.contrasena.trim()) {
      this.showErrorAlert('Por favor ingresa usuario y contraseña');
      return;
    }

    if (this.nombreUsuario.trim().length < 3) {
      this.showErrorAlert('El usuario debe tener al menos 3 caracteres');
      return;
    }

    // Nueva validación mejorada de contraseña
    if (!this.validatePassword()) {
      this.showErrorAlert('La contraseña no cumple con los requisitos mínimos de seguridad');
      return;
    }

    this.isLoading = true;
    this.clearError();

    // Limpiar espacios en blanco
    const usuarioLimpio = this.nombreUsuario.trim();
    const contrasenaLimpia = this.contrasena.trim();

    this.authService.login(usuarioLimpio, contrasenaLimpia).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (!success) {
          this.showErrorAlert('Usuario o contraseña incorrectos');
        } else {
          // Login exitoso - manejar returnUrl si existe
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
    // Mostrar mensaje de éxito brevemente
    this.showSuccessAlert('¡Bienvenido! Redirigiendo...');
    
    // Pequeño delay para mostrar el mensaje de éxito
    setTimeout(() => {
      if (this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
      }
      // La redirección por rol se maneja automáticamente en el AuthService
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
    
    // Auto-ocultar el error después de 5 segundos
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  private showSuccessAlert(message: string): void {
    // Podrías implementar un mensaje de éxito aquí
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
    // Limpiar error cuando el usuario empiece a escribir
    if (this.showError) {
      this.clearError();
    }
    
    // Actualizar requisitos de contraseña en tiempo real
    if (this.contrasena) {
      this.updatePasswordRequirements(this.contrasena);
    }
  }

  goToRecoverPassword(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/recuperar-contrasena']);
  }

  // Método para forzar el cierre de sesión (útil para testing)
  forceLogout(): void {
    this.authService.logout();
    this.showSuccessAlert('Sesión cerrada correctamente');
  }

  // Método para simular diferentes tipos de usuarios (solo desarrollo)
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
      // Actualizar requisitos después de asignar la contraseña
      this.updatePasswordRequirements(this.contrasena);
      // Auto-login después de un breve delay
      setTimeout(() => this.onLogin(), 100);
    }
  }

  // Método para mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    const passwordInput = this.elementRef.nativeElement.querySelector('#contrasena');
    if (passwordInput) {
      const type = passwordInput.getAttribute('type');
      passwordInput.setAttribute('type', type === 'password' ? 'text' : 'password');
    }
  }

  // Validación en tiempo real del usuario
  validateUsername(): boolean {
    return this.nombreUsuario.trim().length >= 3;
  }

  // Validación mejorada de la contraseña
  validatePassword(): boolean {
    const password = this.contrasena;
    
    // Actualizar los requisitos para mostrar en la UI
    this.updatePasswordRequirements(password);
    
    // Verificar que cumpla todos los requisitos
    return this.passwordRequirements.minLength && 
           this.passwordRequirements.hasUpperCase && 
           this.passwordRequirements.hasSpecialChar;
  }

  // Método para actualizar los requisitos de la contraseña
  private updatePasswordRequirements(password: string): void {
    this.passwordRequirements = {
      minLength: password.length >= 8, // Aumenté a 8 caracteres mínimo
      hasUpperCase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  // Verificar si el formulario es válido
  isFormValid(): boolean {
    return this.validateUsername() && this.validatePassword() && !this.isLoading;
  }

  // Método para obtener el mensaje de validación de contraseña
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
}