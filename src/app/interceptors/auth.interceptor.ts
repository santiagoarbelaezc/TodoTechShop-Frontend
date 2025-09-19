// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  console.log('=== INTERCEPTOR DEBUG ===');
  console.log('📋 URL:', req.url);
  console.log('🔐 Token en localStorage:', localStorage.getItem('authToken'));
  console.log('👤 Usuario en localStorage:', localStorage.getItem('currentUser'));
  console.log('🔑 Token desde AuthService:', token ? `PRESENTE (${token.substring(0, 20)}...)` : 'AUSENTE');
  
  const publicUrls = [
    '/login',
    '/recordar-contrasena',
    '/auth'
  ];
  
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  if (isPublicUrl) {
    console.log('✅ URL pública, continuar sin token');
    return next(req);
  }
  
  if (token) {
    console.log('✅ Agregando token Bearer a los headers');
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // DEBUG: Mostrar headers de la solicitud
    console.log('📨 Headers de la solicitud:', authReq.headers.keys());
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error HTTP:', error.status, error.statusText);
        console.error('📄 URL de error:', error.url);
        if (error.status === 403 || error.status === 401) {
          console.error('🔒 Acceso denegado - Verificar token con backend');
        }
        return throwError(() => error);
      })
    );
  }
  
  console.warn('⚠️  No hay token - Redirigiendo a login');
  router.navigate(['/login']);
  return throwError(() => new Error('No authentication token available'));
};