// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
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
  private tokenRevoked = false; // Nueva propiedad para controlar revocación

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const savedUser = localStorage.getItem(this.USUARIO_KEY);
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    
    if (savedUser && savedToken && !this.tokenRevoked) {
      try {
        const usuario = JSON.parse(savedUser);
        this.currentUserSubject.next(usuario);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearAuthState();
      }
    } else {
      this.clearAuthState(); // Limpiar si el token fue revocado
    }
  }

  login(nombreUsuario: string, contrasena: string): Observable<boolean> {
    // Resetear estado de revocación al intentar login
    this.tokenRevoked = false;
    
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
        this.clearAuthState();
        return of(false);
      })
    );
  }

  getToken(): string | null {
    // Si el token fue revocado, no devolverlo
    if (this.tokenRevoked) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Método para revocar explícitamente el token
  revokeToken(): void {
    this.tokenRevoked = true;
    this.clearAuthState();
  }

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

  logout(): void {
    this.revokeToken(); // Usar revokeToken en lugar de clearAuthState
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value && !this.tokenRevoked;
  }

  getCurrentUser(): LoginResponse | null {
    if (this.tokenRevoked) {
      return null;
    }
    return this.currentUserSubject.value;
  }

  getAuthState(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable().pipe(
      map(isAuthenticated => isAuthenticated && !this.tokenRevoked)
    );
  }

  // Método mejorado para limpiar cuando se navega al login
  clearIfOnLoginPage(): void {
    if (this.router.url.includes('/login')) {
      this.revokeToken();
    }
  }

  clearAuthState(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem(this.USUARIO_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.usuarioService.limpiarUsuario();
    localStorage.removeItem('admin_state');
  }

  hasRole(role: string): boolean {
    if (this.tokenRevoked) {
      return false;
    }
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

  testToken(): Observable<any> {
    if (this.tokenRevoked) {
      return throwError(() => new Error('Token revocado'));
    }
    
    return this.http.get(`${this.apiUrl}/usuarios`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });
  }
}