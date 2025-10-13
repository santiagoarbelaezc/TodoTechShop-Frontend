import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Obtener categoría por ID
  obtenerCategoriaPorId(id: number): Observable<MensajeResponse<CategoriaDto>> {
    return this.http.get<MensajeResponse<CategoriaDto>>(`${this.apiUrl}/${id}`);
  }

  // Obtener categoría por nombre
  obtenerCategoriaPorNombre(nombre: string): Observable<MensajeResponse<CategoriaDto>> {
    return this.http.get<MensajeResponse<CategoriaDto>>(`${this.apiUrl}/nombre/${nombre}`);
  }

  // Obtener todas las categorías
  obtenerTodasLasCategorias(): Observable<MensajeResponse<CategoriaDto[]>> {
    return this.http.get<MensajeResponse<CategoriaDto[]>>(this.apiUrl);
  }

  // Obtener categorías con productos
  obtenerCategoriasConProductos(): Observable<MensajeResponse<CategoriaDto[]>> {
    return this.http.get<MensajeResponse<CategoriaDto[]>>(`${this.apiUrl}/con-productos`);
  }
}