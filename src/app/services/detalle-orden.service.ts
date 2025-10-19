import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { 
  AplicarDescuentoRequest, 
  CreateDetalleOrdenDto, 
  DetalleOrdenDto, 
  EliminarDetalleRequest 
} from '../models/detalle-orden/detalle-orden.dto';
import { MensajeDto } from '../models/mensaje.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenService {
  private apiUrl = `${environment.apiUrl}/detalles-orden`;

  constructor(private http: HttpClient) {}

  // Crear detalle de orden (con ordenId en la URL)
  crearDetalleOrden(ordenId: number, request: CreateDetalleOrdenDto): Observable<DetalleOrdenDto> {
    return this.http.post<MensajeDto<DetalleOrdenDto>>(
      `${this.apiUrl}/orden/${ordenId}`, 
      request
    ).pipe(
      map(response => response.data!)
    );
  }

  // Obtener detalle por ID
  obtenerDetalleOrdenPorId(id: number): Observable<DetalleOrdenDto> {
    return this.http.get<MensajeDto<DetalleOrdenDto>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data!)
    );
  }

  // Obtener detalles por orden
  obtenerDetallesPorOrden(ordenId: number): Observable<DetalleOrdenDto[]> {
    return this.http.get<MensajeDto<DetalleOrdenDto[]>>(`${this.apiUrl}/orden/${ordenId}`).pipe(
      map(response => response.data!)
    );
  }

  // Actualizar cantidad del detalle
  actualizarCantidad(id: number, cantidad: number): Observable<DetalleOrdenDto> {
    return this.http.patch<MensajeDto<DetalleOrdenDto>>(
      `${this.apiUrl}/${id}/cantidad?cantidad=${cantidad}`, 
      {}
    ).pipe(
      map(response => response.data!)
    );
  }

  // Actualizar detalle completo
  actualizarDetalleOrden(id: number, detalle: DetalleOrdenDto): Observable<DetalleOrdenDto> {
    return this.http.put<MensajeDto<DetalleOrdenDto>>(`${this.apiUrl}/${id}`, detalle).pipe(
      map(response => response.data!)
    );
  }

  // Eliminar detalle por ID
  eliminarDetalle(id: number): Observable<string> {
    return this.http.delete<MensajeDto<string>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.mensaje)
    );
  }

  // Eliminar detalle por producto y orden
  eliminarDetallePorProductoYOrden(request: EliminarDetalleRequest): Observable<string> {
    return this.http.delete<MensajeDto<string>>(`${this.apiUrl}/producto-orden`, {
      body: request
    }).pipe(
      map(response => response.mensaje)
    );
  }

  // Validar stock disponible
  validarStockDisponible(productoId: number, cantidad: number): Observable<string> {
    return this.http.get<MensajeDto<string>>(
      `${this.apiUrl}/validar-stock/${productoId}/${cantidad}`
    ).pipe(
      map(response => response.mensaje)
    );
  }

  // Métodos auxiliares para aumentar/disminuir cantidad
  aumentarCantidad(id: number, cantidadActual: number): Observable<DetalleOrdenDto> {
    return this.actualizarCantidad(id, cantidadActual + 1);
  }

  disminuirCantidad(id: number, cantidadActual: number): Observable<DetalleOrdenDto> {
    const nuevaCantidad = Math.max(0, cantidadActual - 1);
    return this.actualizarCantidad(id, nuevaCantidad);
  }
}