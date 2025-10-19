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
  
  // ✅ URLs públicas que no requieren token - AGREGAR ENDPOINTS PÚBLICOS DE PRODUCTOS
  const publicUrls = [
    '/usuarios/login',
    '/usuarios/recordar-contrasena',
    '/productos/publicos/todos',
    '/productos/publicos/activos',
    '/productos/publicos/disponibles',
    '/productos/publicos/categoria/',
    '/productos/publicos/buscar',
    '/productos/publicos/' // Este cubre cualquier endpoint que empiece con /publicos/
  ];
  
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  if (isPublicUrl) {
    console.log('🔓 Petición pública detectada, omitiendo token:', req.url);
    return next(req);
  }
  
  // Si no hay token o el usuario no está logueado, redirigir al login
  if (!token || !authService.isLoggedIn()) {
    console.warn('❌ Token no disponible o usuario no autenticado para:', req.url);
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('Token no disponible o usuario no autenticado'));
  }
  
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  console.log('🔐 Token agregado a la petición:', req.url);
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.error('❌ Error de autenticación:', error.status);
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};