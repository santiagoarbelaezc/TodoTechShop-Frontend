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
  
  // URLs públicas que no requieren token
  const publicUrls = [
    '/usuarios/login',
    '/usuarios/recordar-contrasena'
  ];
  
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  if (isPublicUrl) {
    return next(req);
  }
  
  // Si no hay token o está revocado, redirigir al login
  if (!token) {
    authService.revokeToken(); // Asegurar revocación
    router.navigate(['/login']);
    return throwError(() => new Error('Token no disponible o revocado'));
  }
  
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        authService.revokeToken(); // Revocar token en errores de auth
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};