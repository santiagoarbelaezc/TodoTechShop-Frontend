// src/app/services/auth.service.ts (mejoras adicionales)
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MensajeDto } from '../models/mensaje.dto';
import { UsuarioDto } from '../models/usuario.dto';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = 'https://todotechbackend-iqb0.onrender.com/usuarios';
  private USUARIO_KEY = 'currentUser';
  private TOKEN_KEY = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<UsuarioDto | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService
  ) {
    this.initializeAuthState();
  }

  // Inicializar estado de autenticación desde localStorage
  private initializeAuthState(): void {
    const savedUser = localStorage.getItem(this.USUARIO_KEY);
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    
    if (savedUser && savedToken) {
      try {
        const usuario = JSON.parse(savedUser);
        this.currentUserSubject.next(usuario);
        this.isAuthenticatedSubject.next(true);
        console.log('Estado de autenticación restaurado desde localStorage');
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearAuthState();
      }
    }
  }

  // Método login mejorado
  login(nombreUsuario: string, contrasena: string): Observable<boolean> {
    const params = new HttpParams()
      .set('nombreUsuario', nombreUsuario)
      .set('contrasena', contrasena);

    return this.http.post<MensajeDto<any>>(
      `${this.apiUrl}/login`, 
      null,
      { params }
    ).pipe(
      map(response => {
        if (response.error) {
          throw new Error(response.mensaje);
        }
        
        // Guardar token si está disponible
        if (response.data.token) {
          localStorage.setItem(this.TOKEN_KEY, response.data.token);
        }
        
        // Usar el servicio de usuario para manejar el estado
        this.usuarioService.setUsuario(response.data);
        
        // Guardar usuario
        localStorage.setItem(this.USUARIO_KEY, JSON.stringify(response.data));
        
        // Actualizar los subjects
        this.currentUserSubject.next(response.data);
        this.isAuthenticatedSubject.next(true);
        
        this.redirigirPorRol(response.data.tipoUsuario);
        return true;
      }),
      catchError(error => {
        console.error('Error en login:', error);
        this.clearAuthState();
        return of(false);
      })
    );
  }

  // Obtener token de autenticación
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Método redirigirPorRol
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
        this.router.navigate(['/']);
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

  getCurrentUser(): UsuarioDto | null {
    return this.currentUserSubject.value;
  }

  getAuthState(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Método mejorado para limpieza en login
  clearIfOnLoginPage(): void {
    const currentRoute = this.router.url;
    
    // Limpiar si estamos en login, home, o cualquier ruta no protegida
    if (currentRoute === '/login' || currentRoute === '/' || 
        currentRoute.includes('public')) {
      console.log('En página pública, limpiando sesión...');
      this.clearAuthState();
    }
  }

  // Hacer público el método clearAuthState
  clearAuthState(): void {
    console.log('Limpiando estado de autenticación completo');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem(this.USUARIO_KEY);
    this.usuarioService.limpiarUsuario();
    
    // Limpiar también el estado del admin si existe
    localStorage.removeItem('admin_state');
  }

  // Métodos de utilidad para verificación de roles
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.tipoUsuario === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isVendedor(): boolean {
    return this.hasRole('VENDEDOR');
  }
}