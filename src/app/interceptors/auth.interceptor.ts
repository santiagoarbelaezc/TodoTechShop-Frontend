// auth.interceptor.ts - MEJORADO
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  // ✅ URLs públicas que no requieren token (INCLUYE TU ENDPOINT)
  const publicUrls = [
    '/usuarios/login',
    '/usuarios/recordar-contrasena',
    '/productos/publicos/todos',
    '/productos/publicos/activos',
    '/productos/publicos/disponibles',
    '/productos/publicos/categoria/',
    '/productos/publicos/buscar',
    '/productos/publicos/',
    '/productos/activos'  // ✅ AÑADE ESTA LÍNEA IMPORTANTE
  ];
  
  // ✅ URLs de APIs externas que NO deben recibir el header Authorization
  const externalApis = [
    'https://api.frankfurter.app',
    'https://api.exchangerate.host',
    'https://api.exchangerate-api.com',
    'https://open.er-api.com'
  ];
  
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  const isExternalApi = externalApis.some(api => req.url.startsWith(api));
  
  if (isPublicUrl || isExternalApi) {
    // Para APIs externas, usar fetch sin headers de autorización
    if (isExternalApi) {
      console.log('🌐 Petición a API externa detectada, omitiendo token:', req.url);
    } else {
      console.log('🔓 Petición pública detectada, omitiendo token:', req.url);
    }
    return next(req);
  }
  
  // Si no hay token o el usuario no está logueado, redirigir al login
  // PERO solo si NO estamos en una página pública
  const isPaginaPublica = window.location.pathname.includes('catalogo-principal-todotech');
  
  if ((!token || !authService.isLoggedIn()) && !isPaginaPublica) {
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