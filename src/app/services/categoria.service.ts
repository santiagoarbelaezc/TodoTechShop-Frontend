import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Models
import { CategoriaDto } from '../models/categoria.dto';

// Interface para la respuesta del backend
export interface MensajeResponse<T> {
  error: boolean;
  mensaje: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  // ========== ENDPOINTS PÚBLICOS (sin autenticación) ==========

  /**
   * Obtener todas las categorías (PÚBLICO - sin autenticación)
   */
  obtenerTodasLasCategoriasPublico(): Observable<CategoriaDto[]> {
    return this.http.get<MensajeResponse<CategoriaDto[]>>(
      `${this.apiUrl}/publicos`
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error obteniendo categorías públicas:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener categorías con productos (PÚBLICO - sin autenticación)
   */
  obtenerCategoriasConProductosPublico(): Observable<CategoriaDto[]> {
    return this.http.get<MensajeResponse<CategoriaDto[]>>(
      `${this.apiUrl}/publicos/con-productos`
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error obteniendo categorías con productos:', error);
        throw error;
      })
    );
  }

  // ========== ENDPOINTS AUTENTICADOS (mantener los existentes) ==========

  // Crear categoría (solo ADMIN)
  crearCategoria(categoria: CategoriaDto): Observable<MensajeResponse<CategoriaDto>> {
    return this.http.post<MensajeResponse<CategoriaDto>>(this.apiUrl, categoria);
  }

  // Actualizar categoría (solo ADMIN)
  actualizarCategoria(id: number, categoria: CategoriaDto): Observable<MensajeResponse<CategoriaDto>> {
    return this.http.put<MensajeResponse<CategoriaDto>>(`${this.apiUrl}/${id}`, categoria);
  }

  // Eliminar categoría (solo ADMIN)
  eliminarCategoria(id: number): Observable<MensajeResponse<string>> {
    return this.http.delete<MensajeResponse<string>>(`${this.apiUrl}/${id}`);
  }

  // Obtener categoría por ID (requiere autenticación)
  obtenerCategoriaPorId(id: number): Observable<MensajeResponse<CategoriaDto>> {
    return this.http.get<MensajeResponse<CategoriaDto>>(`${this.apiUrl}/${id}`);
  }

  // Obtener categoría por nombre (requiere autenticación)
  obtenerCategoriaPorNombre(nombre: string): Observable<MensajeResponse<CategoriaDto>> {
    return this.http.get<MensajeResponse<CategoriaDto>>(`${this.apiUrl}/nombre/${nombre}`);
  }

  // Obtener todas las categorías (requiere autenticación)
  obtenerTodasLasCategorias(): Observable<MensajeResponse<CategoriaDto[]>> {
    return this.http.get<MensajeResponse<CategoriaDto[]>>(this.apiUrl);
  }

  // Obtener categorías con productos (requiere autenticación)
  obtenerCategoriasConProductos(): Observable<MensajeResponse<CategoriaDto[]>> {
    return this.http.get<MensajeResponse<CategoriaDto[]>>(`${this.apiUrl}/con-productos`);
  }
}