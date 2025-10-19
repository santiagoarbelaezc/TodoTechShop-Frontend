// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MensajeDto } from '../models/mensaje.dto';
import { LoginResponse } from '../models/login-response.dto';
import { UsuarioService } from './usuario.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private USUARIO_KEY = 'currentUser';
  private TOKEN_KEY = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  private tokenRevoked = false;

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
      this.clearAuthState();
    }
  }

  // NUEVO MÉTODO: Logout que llama al backend
  logoutBackend(): Observable<boolean> {
    const token = this.getToken();
    
    // Si no hay token, consideramos logout exitoso localmente
    if (!token) {
      this.logoutLocal();
      return of(true);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<MensajeDto<string>>(
      `${this.apiUrl}/logout`, 
      null,
      { headers }
    ).pipe(
      map(response => {
        if (response.error) {
          console.warn('Error en logout del backend:', response.mensaje);
          // Aún así hacemos logout local
          this.logoutLocal();
          return false;
        }
        
        // Logout exitoso en el backend
        this.logoutLocal();
        return true;
      }),
      catchError(error => {
        console.error('Error al llamar logout del backend:', error);
        // En caso de error, hacemos logout local de todas formas
        this.logoutLocal();
        return of(false);
      })
    );
  }

  // MÉTODO MODIFICADO: logout() ahora llama al backend
  logout(): void {
    this.logoutBackend().subscribe({
      next: (success) => {
        if (success) {
          console.log('Logout exitoso (backend y frontend)');
        } else {
          console.log('Logout local (falló en backend)');
        }
        // Navegar al login siempre
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error durante logout:', error);
        this.logoutLocal();
        this.router.navigate(['/login']);
      }
    });
  }

  // NUEVO MÉTODO: Logout solo local (sin llamar al backend)
  private logoutLocal(): void {
    this.revokeToken();
    this.clearAuthState();
  }

  // MÉTODO MODIFICADO: revokeToken ahora es privado
  private revokeToken(): void {
    this.tokenRevoked = true;
  }

  login(nombreUsuario: string, contrasena: string): Observable<boolean> {
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
    if (this.tokenRevoked) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
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

  clearIfOnLoginPage(): void {
    if (this.router.url.includes('/login')) {
      this.revokeToken();
    }
  }

  public clearAuthState(): void {
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
    
    return this.http.get(`${this.apiUrl}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });
  }
}