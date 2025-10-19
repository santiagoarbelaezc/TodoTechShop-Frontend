// src/app/services/admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private apiUrl = `${environment.apiUrl}`;

  private getHeaders(): HttpHeaders {
    // Usar el AuthService para obtener el token con validación de revocación
    const token = this.authService.getToken();
    
    // Si no hay token o el usuario no está logueado, redirigir al login
    if (!token || !this.authService.isLoggedIn()) {
      this.logoutAndRedirect();
      throw new Error('Token no disponible o usuario no autenticado');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Método genérico para peticiones GET
  get<T>(endpoint: string): Observable<T> {
    try {
      const headers = this.getHeaders();
      return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers }).pipe(
        catchError(error => {
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Método genérico para peticiones POST
  post<T>(endpoint: string, data: any): Observable<T> {
    try {
      const headers = this.getHeaders();
      return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, { headers }).pipe(
        catchError(error => {
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Método genérico para peticiones PUT
  put<T>(endpoint: string, data: any): Observable<T> {
    try {
      const headers = this.getHeaders();
      return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, { headers }).pipe(
        catchError(error => {
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Método genérico para peticiones PATCH
  patch<T>(endpoint: string, data: any = {}): Observable<T> {
    try {
      const headers = this.getHeaders();
      return this.http.patch<T>(`${this.apiUrl}${endpoint}`, data, { headers }).pipe(
        catchError(error => {
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Método genérico para peticiones DELETE
  delete<T>(endpoint: string): Observable<T> {
    try {
      const headers = this.getHeaders();
      return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers }).pipe(
        catchError(error => {
          this.handleAuthError(error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Manejar errores de autenticación
  private handleAuthError(error: any): void {
    if (error.status === 401 || error.status === 403) {
      this.logoutAndRedirect();
    }
  }

  // Método privado para logout y redirección
  private logoutAndRedirect(): void {
    // Usar el método público logout() en lugar del privado revokeToken()
    this.authService.logout();
  }

  // Verificar conexión con el servidor (versión mejorada)
  checkConnection(): Observable<boolean> {
    return this.get('/usuarios').pipe(
      map(() => true),
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.logoutAndRedirect();
        }
        return [false];
      })
    );
  }

  // Método adicional para verificar permisos antes de realizar acciones
  checkPermission(requiredRole: string): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.authService.getCurrentUser();
    if (!user || user.role !== requiredRole) {
      this.router.navigate(['/acceso-denegado']);
      return false;
    }

    return true;
  }

  // Método para obtener datos con manejo seguro de permisos
  getWithPermission<T>(endpoint: string, requiredRole: string): Observable<T> {
    if (!this.checkPermission(requiredRole)) {
      return throwError(() => new Error('Permisos insuficientes'));
    }
    
    return this.get<T>(endpoint);
  }
}