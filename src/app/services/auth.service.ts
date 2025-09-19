// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MensajeDto } from '../models/mensaje.dto';
import { LoginResponse } from '../models/login-response.dto';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  
  private apiUrl: string = 'https://todotechbackend-iqb0.onrender.com/usuarios';
  private USUARIO_KEY = 'currentUser';
  private TOKEN_KEY = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);

  constructor() {
    this.initializeAuthState();
  }

  // En AuthService - MODIFICAR el método initializeAuthState
private initializeAuthState(): void {
  const savedUser = localStorage.getItem(this.USUARIO_KEY);
  const savedToken = localStorage.getItem(this.TOKEN_KEY);
  
  if (savedUser && savedToken) {
    try {
      const usuario = JSON.parse(savedUser);
      this.currentUserSubject.next(usuario);
      this.isAuthenticatedSubject.next(true);
      console.log('✅ Estado de autenticación restaurado desde localStorage');
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // ✅ QUITAR esta línea que limpia el estado
      // this.clearAuthState(); // ← ELIMINAR ESTA LÍNEA
    }
  }
}

// En AuthService - MODIFICAR el método login
login(nombreUsuario: string, contrasena: string): Observable<boolean> {
  const params = new HttpParams()
    .set('nombreUsuario', nombreUsuario)
    .set('contrasena', contrasena);

  return this.http.post<MensajeDto<LoginResponse>>(
    `${this.apiUrl}/login`, 
    null,
    { params }
  ).pipe(
    map(response => {
      if (response.error) {
        throw new Error(response.mensaje);
      }
      
      if (response.data && response.data.token) {
        localStorage.setItem(this.TOKEN_KEY, response.data.token);
        localStorage.setItem(this.USUARIO_KEY, JSON.stringify(response.data));
        
        this.currentUserSubject.next(response.data);
        this.isAuthenticatedSubject.next(true);
        this.usuarioService.setUsuario(response.data);
        
        this.redirigirPorRol(response.data.role);
        return true;
      } else {
        throw new Error('No se recibió token en la respuesta');
      }
    }),
    catchError(error => {
      console.error('Error en login:', error);
      // ✅ QUITAR esta línea que limpia el estado en errores
      // this.clearAuthState(); // ← ELIMINAR ESTA LÍNEA
      return of(false);
    })
  );
}

  // Obtener token de autenticación
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // En tu AuthService
  redirigirPorRol(tipoUsuario: string): void {
    switch (tipoUsuario) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'VENDEDOR':
        this.router.navigate(['/ordenVenta']);
        break;
      case 'CAJERO':
        this.router.navigate(['/caja']);
        break;
      case 'DESPACHADOR':
        this.router.navigate(['/despacho']);
        break;
      default:
        this.router.navigate(['/inicio']);
        break;
    }
  }

  // Métodos esenciales
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  getAuthState(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Método mejorado para limpieza en login
  // En AuthService - MODIFICAR o ELIMINAR este método
clearIfOnLoginPage(): void {
  // ✅ COMENTAR o ELIMINAR esta lógica que limpia automáticamente
  /*
  const currentRoute = this.router.url;
  
  // Limpiar si estamos en login, home, o cualquier ruta no protegida
  if (currentRoute === '/login' || currentRoute === '/' || 
      currentRoute.includes('public')) {
    console.log('En página pública, limpiando sesión...');
    this.clearAuthState();
  }
  */
  
  // En su lugar, solo hacer log
  console.log('ℹ️  clearIfOnLoginPage llamado pero no ejecutado');
}

  // Hacer público el método clearAuthState
  clearAuthState(): void {
    console.log('Limpiando estado de autenticación completo');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem(this.USUARIO_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioService.limpiarUsuario();
    
    // Limpiar también el estado del admin si existe
    localStorage.removeItem('admin_state');
  }

  // Métodos de utilidad para verificación de roles
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isVendedor(): boolean {
    return this.hasRole('VENDEDOR');
  }

  isCajero(): boolean {
    return this.hasRole('CAJERO');
  }

  isDespachador(): boolean {
    return this.hasRole('DESPACHADOR');
  }
}