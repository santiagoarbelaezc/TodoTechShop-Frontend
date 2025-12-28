import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { CustomRouteReuseStrategy } from './services/custom-route-reuse-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuración del router
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload' // Recarga al navegar a la misma URL
      })
    ),
    
    // Proveedor HTTP con interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    
    // Estrategia personalizada de reutilización de rutas
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy
    }
  ]
};