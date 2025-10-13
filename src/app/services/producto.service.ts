// src/app/services/producto.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MensajeDto } from '../models/mensaje.dto';
import { EstadoProducto } from '../models/enums/estado-producto.enum';
import { ProductoDto } from '../models/producto/producto.dto';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  
  private apiUrl: string = 'http://localhost:8080/productos';
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
}