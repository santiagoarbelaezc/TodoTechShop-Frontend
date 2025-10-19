// src/app/services/producto.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MensajeDto } from '../models/mensaje.dto';
import { EstadoProducto } from '../models/enums/estado-producto.enum';
import { ProductoDto } from '../models/producto/producto.dto';
import { CantidadRequestDto } from '../models/producto/cantidad-request.dto';
import { AjusteStockRequestDto } from '../models/producto/ajuste-stock-request.dto';
import { StockResponseDto } from '../models/producto/stock-response.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.apiUrl}/productos`;
  private productoSeleccionadoSubject = new BehaviorSubject<ProductoDto | null>(null);
  
  // Observable público para suscribirse a los cambios del producto seleccionado
  public productoSeleccionado$ = this.productoSeleccionadoSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // ===== MÉTODOS PARA LA SELECCIÓN TEMPORAL DE PRODUCTOS =====

  /**
   * Almacena temporalmente un producto seleccionado
   * @param producto El producto a almacenar
   */
  seleccionarProducto(producto: ProductoDto): void {
    this.productoSeleccionadoSubject.next(producto);
  }

  /**
   * Obtiene el producto actualmente seleccionado
   * @returns El producto seleccionado o null
   */
  obtenerProductoSeleccionado(): ProductoDto | null {
    return this.productoSeleccionadoSubject.value;
  }

  /**
   * Limpia la selección actual del producto
   */
  limpiarSeleccion(): void {
    this.productoSeleccionadoSubject.next(null);
  }

  // ===== MÉTODOS CRUD =====

  /**
   * Crear un nuevo producto
   */
  crearProducto(productoDTO: ProductoDto): Observable<MensajeDto<string>> {
    return this.http.post<MensajeDto<string>>(
      this.apiUrl, 
      productoDTO, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar un producto existente
   */
  actualizarProducto(id: number, productoDTO: ProductoDto): Observable<MensajeDto<string>> {
    return this.http.put<MensajeDto<string>>(
      `${this.apiUrl}/${id}`, 
      productoDTO, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener todos los productos
   */
  obtenerTodosLosProductos(): Observable<ProductoDto[]> {
    return this.http.get<MensajeDto<ProductoDto[]>>(
      this.apiUrl, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error obteniendo productos:', error);
        throw error;
      })
    );
  }

  /**
   * Eliminar un producto
   */
  eliminarProducto(id: number): Observable<MensajeDto<string>> {
    return this.http.delete<MensajeDto<string>>(
      `${this.apiUrl}/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cambiar estado del producto
   */
  cambiarEstadoProducto(id: number): Observable<MensajeDto<string>> {
    return this.http.patch<MensajeDto<string>>(
      `${this.apiUrl}/${id}/estado`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener producto por ID
   */
  obtenerProductoPorId(id: number): Observable<ProductoDto> {
    return this.http.get<MensajeDto<ProductoDto>>(
      `${this.apiUrl}/${id}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        console.error(`Error obteniendo producto con ID ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener producto por código
   */
  obtenerProductoPorCodigo(codigo: string): Observable<ProductoDto> {
    return this.http.get<MensajeDto<ProductoDto>>(
      `${this.apiUrl}/codigo/${codigo}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        console.error(`Error obteniendo producto con código ${codigo}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener producto por nombre exacto
   */
  obtenerProductoPorNombre(nombre: string): Observable<ProductoDto> {
    return this.http.get<MensajeDto<ProductoDto>>(
      `${this.apiUrl}/nombre/${nombre}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        console.error(`Error obteniendo producto con nombre ${nombre}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener productos por estado
   */
  obtenerProductoPorEstado(estado: EstadoProducto): Observable<ProductoDto[]> {
    return this.http.get<MensajeDto<ProductoDto[]>>(
      `${this.apiUrl}/estado/${estado}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error(`Error obteniendo productos con estado ${estado}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener productos por categoría
   */
  obtenerProductoPorCategoria(categoriaId: number): Observable<ProductoDto[]> {
    return this.http.get<MensajeDto<ProductoDto[]>>(
      `${this.apiUrl}/categoria/${categoriaId}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error(`Error obteniendo productos de categoría ${categoriaId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener productos activos
   */
  obtenerProductosActivos(): Observable<ProductoDto[]> {
    return this.http.get<MensajeDto<ProductoDto[]>>(
      `${this.apiUrl}/activos`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error obteniendo productos activos:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener productos disponibles
   */
  obtenerProductosDisponibles(): Observable<ProductoDto[]> {
    return this.http.get<MensajeDto<ProductoDto[]>>(
      `${this.apiUrl}/disponibles`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error obteniendo productos disponibles:', error);
        throw error;
      })
    );
  }

  /**
   * Buscar productos por nombre (búsqueda parcial)
   */
  buscarProductosPorNombre(nombre: string): Observable<ProductoDto[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<MensajeDto<ProductoDto[]>>(
      `${this.apiUrl}/buscar`, 
      { 
        headers: this.getHeaders(),
        params: params
      }
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error(`Error buscando productos con nombre ${nombre}:`, error);
        throw error;
      })
    );
  }

  // ===== NUEVOS MÉTODOS PARA GESTIÓN DE STOCK =====

  /**
   * Incrementar stock de un producto
   */
  incrementarStock(id: number, cantidad: number): Observable<MensajeDto<string>> {
    const request: CantidadRequestDto = { cantidad };
    return this.http.patch<MensajeDto<string>>(
      `${this.apiUrl}/${id}/stock/incrementar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Decrementar stock de un producto
   */
  decrementarStock(id: number, cantidad: number): Observable<MensajeDto<string>> {
    const request: CantidadRequestDto = { cantidad };
    return this.http.patch<MensajeDto<string>>(
      `${this.apiUrl}/${id}/stock/decrementar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Establecer stock de un producto a un valor específico
   */
  establecerStock(id: number, nuevoStock: number): Observable<MensajeDto<string>> {
    const request: CantidadRequestDto = { cantidad: nuevoStock };
    return this.http.patch<MensajeDto<string>>(
      `${this.apiUrl}/${id}/stock`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Ajuste genérico de stock con operación específica
   */
  ajustarStock(id: number, cantidad: number, operacion: 'INCREMENTAR' | 'DECREMENTAR' | 'AJUSTAR'): Observable<MensajeDto<string>> {
    const request: AjusteStockRequestDto = { cantidad, operacion };
    return this.http.patch<MensajeDto<string>>(
      `${this.apiUrl}/${id}/stock/ajustar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Consultar stock actual de un producto
   */
  consultarStock(id: number): Observable<StockResponseDto> {
    return this.http.get<MensajeDto<StockResponseDto>>(
      `${this.apiUrl}/${id}/stock`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        console.error(`Error consultando stock del producto ${id}:`, error);
        throw error;
      })
    );
  }

  /**
   * Método conveniente para obtener el stock actual de un producto
   */
  obtenerStockActual(id: number): Observable<number> {
    return this.consultarStock(id).pipe(
      map(response => response.stock)
    );
  }

  // ===== MÉTODOS PÚBLICOS PARA CATÁLOGO (SIN AUTENTICACIÓN) =====

/**
 * Obtener todos los productos (público - sin autenticación)
 */
obtenerTodosLosProductosPublicos(): Observable<ProductoDto[]> {
  return this.http.get<MensajeDto<ProductoDto[]>>(
    `${this.apiUrl}/publicos/todos`
  ).pipe(
    map(response => response.data || []),
    catchError(error => {
      console.error('Error obteniendo productos públicos:', error);
      throw error;
    })
  );
}

/**
 * Obtener productos activos (público - sin autenticación)
 */
obtenerProductosActivosPublicos(): Observable<ProductoDto[]> {
  return this.http.get<MensajeDto<ProductoDto[]>>(
    `${this.apiUrl}/publicos/activos`
  ).pipe(
    map(response => response.data || []),
    catchError(error => {
      console.error('Error obteniendo productos activos públicos:', error);
      throw error;
    })
  );
}

/**
 * Obtener productos disponibles (público - sin autenticación)
 */
obtenerProductosDisponiblesPublicos(): Observable<ProductoDto[]> {
  return this.http.get<MensajeDto<ProductoDto[]>>(
    `${this.apiUrl}/publicos/disponibles`
  ).pipe(
    map(response => response.data || []),
    catchError(error => {
      console.error('Error obteniendo productos disponibles públicos:', error);
      throw error;
    })
  );
}

/**
 * Obtener productos por categoría (público - sin autenticación)
 */
obtenerProductoPorCategoriaPublico(categoriaId: number): Observable<ProductoDto[]> {
  return this.http.get<MensajeDto<ProductoDto[]>>(
    `${this.apiUrl}/publicos/categoria/${categoriaId}`
  ).pipe(
    map(response => response.data || []),
    catchError(error => {
      console.error(`Error obteniendo productos de categoría ${categoriaId} (público):`, error);
      throw error;
    })
  );
}

/**
 * Buscar productos por nombre (público - sin autenticación)
 */
buscarProductosPorNombrePublico(nombre: string): Observable<ProductoDto[]> {
  const params = new HttpParams().set('nombre', nombre);
  return this.http.get<MensajeDto<ProductoDto[]>>(
    `${this.apiUrl}/publicos/buscar`, 
    { params: params }
  ).pipe(
    map(response => response.data || []),
    catchError(error => {
      console.error(`Error buscando productos con nombre ${nombre} (público):`, error);
      throw error;
    })
  );
}

/**
 * Obtener producto por ID (público - sin autenticación)
 */
obtenerProductoPorIdPublico(id: number): Observable<ProductoDto> {
  return this.http.get<MensajeDto<ProductoDto>>(
    `${this.apiUrl}/publicos/${id}`
  ).pipe(
    map(response => response.data!),
    catchError(error => {
      console.error(`Error obteniendo producto con ID ${id} (público):`, error);
      throw error;
    })
  );
}
}