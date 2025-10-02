// src/app/services/producto.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProductoDTO} from '../models/producto.dto';
import { MensajeDto } from '../models/mensaje.dto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  
  private apiUrl: string = 'http://localhost:8080/productos';
  private productoSubject = new BehaviorSubject<ProductoDTO | null>(null);
  private productoSeleccionadoSubject = new BehaviorSubject<ProductoDTO | null>(null);
  
  // Observable público para suscribirse a los cambios del producto seleccionado
  public productoSeleccionado$ = this.productoSeleccionadoSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ===== MÉTODOS PARA LA SELECCIÓN TEMPORAL DE PRODUCTOS =====

  /**
   * Almacena temporalmente un producto seleccionado
   * @param producto El producto a almacenar
   */
 // En producto.service.ts - actualiza el método seleccionarProducto
seleccionarProducto(producto: ProductoDTO): void {
  // Asegurarnos de que el producto tenga la propiedad imagen
  const productoConImagen: any = { ...producto };
  if (!productoConImagen.imagen && productoConImagen.imagenUrl) {
    productoConImagen.imagen = productoConImagen.imagenUrl;
  }
  this.productoSeleccionadoSubject.next(productoConImagen);
}

  /**
   * Obtiene el producto actualmente seleccionado
   * @returns El producto seleccionado o null
   */
  obtenerProductoSeleccionado(): ProductoDTO | null {
    return this.productoSeleccionadoSubject.value;
  }

  /**
   * Limpia la selección actual del producto
   */
  limpiarSeleccion(): void {
    this.productoSeleccionadoSubject.next(null);
    console.log('Selección de producto limpiada');
  }

  /**
   * Obtiene el producto seleccionado como Observable
   * Útil para componentes que se suscriben a cambios
   */
  getProductoSeleccionadoObservable(): Observable<ProductoDTO | null> {
    return this.productoSeleccionadoSubject.asObservable();
  }

  // ===== MÉTODOS EXISTENTES DEL CRUD =====

  // Crear producto
  crearProducto(productoDTO: ProductoDTO): Observable<MensajeDto<string>> {
    return this.http.post<MensajeDto<string>>(
      this.apiUrl, 
      productoDTO, 
      { headers: this.getHeaders() }
    );
  }

  // Actualizar producto
  actualizarProducto(id: number, productoDTO: ProductoDTO): Observable<MensajeDto<string>> {
    return this.http.put<MensajeDto<string>>(
      `${this.apiUrl}/${id}`, 
      productoDTO, 
      { headers: this.getHeaders() }
    );
  }

  // Eliminar producto
  eliminarProducto(id: number): Observable<MensajeDto<string>> {
    return this.http.delete<MensajeDto<string>>(
      `${this.apiUrl}/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  // Cambiar estado del producto
  cambiarEstadoProducto(id: number): Observable<MensajeDto<string>> {
    return this.http.patch<MensajeDto<string>>(
      `${this.apiUrl}/${id}/estado`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  // Obtener producto por ID
  obtenerProductoPorId(id: number): Observable<ProductoDTO> {
    return this.http.get<MensajeDto<ProductoDTO>>(
      `${this.apiUrl}/${id}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Obtener producto por código
  obtenerProductoPorCodigo(codigo: string): Observable<ProductoDTO> {
    return this.http.get<MensajeDto<ProductoDTO>>(
      `${this.apiUrl}/codigo/${codigo}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Obtener producto por nombre
  obtenerProductoPorNombre(nombre: string): Observable<ProductoDTO> {
    return this.http.get<MensajeDto<ProductoDTO>>(
      `${this.apiUrl}/nombre/${nombre}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Obtener productos por estado
  obtenerProductoPorEstado(estado: string): Observable<ProductoDTO[]> {
    return this.http.get<MensajeDto<ProductoDTO[]>>(
      `${this.apiUrl}/estado/${estado}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Obtener productos por categoría
  obtenerProductoPorCategoria(categoriaId: number): Observable<ProductoDTO[]> {
    return this.http.get<MensajeDto<ProductoDTO[]>>(
      `${this.apiUrl}/categoria/${categoriaId}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Obtener productos activos
  obtenerProductosActivos(): Observable<ProductoDTO[]> {
    return this.http.get<MensajeDto<ProductoDTO[]>>(
      `${this.apiUrl}/activos`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Obtener productos disponibles
  obtenerProductosDisponibles(): Observable<ProductoDTO[]> {
    return this.http.get<MensajeDto<ProductoDTO[]>>(
      `${this.apiUrl}/disponibles`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Buscar productos por nombre
  buscarProductosPorNombre(nombre: string): Observable<ProductoDTO[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<MensajeDto<ProductoDTO[]>>(
      `${this.apiUrl}/buscar`, 
      { 
        headers: this.getHeaders(),
        params: params
      }
    ).pipe(
      map(response => response.data!),
      catchError(error => {
        throw error;
      })
    );
  }

  // Obtener todos los productos (usando productos activos como base)
  obtenerTodosLosProductos(): Observable<ProductoDTO[]> {
    return this.obtenerProductosActivos();
  }
}