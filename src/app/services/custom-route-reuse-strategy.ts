import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  
  // RUTAS que NO queremos que se reutilicen NUNCA
  private routesToNeverReuse = [
    'descripcion-catalogo',
    'producto',
    'catalogo'
    // Agrega aquí otras rutas críticas
  ];

  /**
   * Determina si la ruta debe ser "detached" (separada) y almacenada
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Nunca almacenar componentes para las rutas importantes
    return !this.shouldNeverReuse(route);
  }

  /**
   * Almacena el componente separado (no hacemos nada)
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // No almacenamos componentes
  }

  /**
   * Determina si debe adjuntar un componente almacenado
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false; // Nunca adjuntar componentes almacenados
  }

  /**
   * Recupera un componente almacenado
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null; // Nunca retornar componentes almacenados
  }

  /**
   * Determina si debe reutilizar la ruta
   * Este es el método más importante - SIEMPRE FALSE para recrear
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Para rutas críticas, NUNCA reutilizar
    if (this.shouldNeverReuse(future) || this.shouldNeverReuse(curr)) {
      console.log('🔄 No reutilizando ruta crítica');
      return false;
    }
    
    // Para otras rutas, usar comportamiento por defecto
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * Verifica si esta ruta nunca debe reutilizarse
   */
  private shouldNeverReuse(route: ActivatedRouteSnapshot): boolean {
    const routePath = this.getRoutePath(route);
    
    // Verificar si la ruta está en la lista de no-reutilización
    const shouldNotReuse = this.routesToNeverReuse.some(path => 
      routePath.includes(path)
    );
    
    if (shouldNotReuse) {
      console.log(`🚫 Ruta no reutilizable: ${routePath}`);
    }
    
    return shouldNotReuse;
  }

  /**
   * Obtiene el path completo de la ruta
   */
  private getRoutePath(route: ActivatedRouteSnapshot): string {
    return route.routeConfig?.path || '';
  }
}