// src/app/services/auth.service.ts
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
  private apiUrl: string = 'https://todotechbackend.onrender.com';
  private USUARIO_KEY = 'currentUser';
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
    
    if (savedUser) {
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

  // Método login
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
        
        // Usar el servicio de usuario para manejar el estado
        this.usuarioService.setUsuario(response.data);
        
        // Guardar solo el usuario (sin expiración)
        localStorage.setItem(this.USUARIO_KEY, JSON.stringify(response.data));
        
        // Actualizar los subjects
        this.currentUserSubject.next(response.data);
        this.isAuthenticatedSubject.next(true);
        
        this.redirigirPorRol(response.data.tipoUsuario);
        return true;
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return of(false);
      })
    );
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

  // Limpiar solo si estamos en la página de login
  clearIfOnLoginPage(): void {
    const currentRoute = this.router.url;
    
    // Solo limpiar si estamos específicamente en la página de login
    if (currentRoute === '/login' || currentRoute === '/') {
      console.log('En página de login, limpiando sesión...');
      this.clearAuthState();
    } else {
      console.log('En página protegida, manteniendo sesión...');
    }
  }

  // Método auxiliar para limpiar estado
  private clearAuthState(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem(this.USUARIO_KEY);
    this.usuarioService.limpiarUsuario();
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