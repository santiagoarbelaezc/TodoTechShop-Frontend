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
import { BulkStockValidationRequest, BulkValidationResultDto, StockValidationRequest, ValidationResultDto } from '../models/validacion/stock-validation.models';


@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenService {
  private apiUrl = `${environment.apiUrl}/detalles-orden`;

  constructor(private http: HttpClient) {}

  // 🔥 NUEVOS ENDPOINTS DE VALIDACIÓN DE STOCK

  /**
   * Validar stock para un detalle específico (creación o actualización)
   */
  validarStockParaDetalle(request: StockValidationRequest): Observable<ValidationResultDto> {
    return this.http.post<MensajeDto<ValidationResultDto>>(
      `${this.apiUrl}/validar-stock`,
      request
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Validar stock múltiple para varios productos
   */
  validarStockMultiple(request: BulkStockValidationRequest): Observable<BulkValidationResultDto> {
    return this.http.post<MensajeDto<BulkValidationResultDto>>(
      `${this.apiUrl}/validar-stock-multiple`,
      request
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtener lista de productos con stock crítico (≤ 3 unidades)
   */
  obtenerProductosStockCritico(): Observable<ValidationResultDto[]> {
    return this.http.get<MensajeDto<ValidationResultDto[]>>(
      `${this.apiUrl}/stock-critico`
    ).pipe(
      map(response => response.data!)
    );
  }

  /**
   * Obtener stock disponible de un producto específico
   */
  obtenerStockDisponible(productoId: number): Observable<ValidationResultDto> {
    return this.http.get<MensajeDto<ValidationResultDto>>(
      `${this.apiUrl}/stock-disponible/${productoId}`
    ).pipe(
      map(response => response.data!)
    );
  }

  // 🔥 NUEVOS MÉTODOS AUXILIARES PARA VALIDACIÓN

  /**
   * Validar stock antes de crear un nuevo detalle
   */
  validarStockParaCreacion(productoId: number, cantidad: number): Observable<ValidationResultDto> {
    const request: StockValidationRequest = {
      productoId,
      cantidad,
      detalleOrdenId: undefined // Sin detalle existente = creación
    };
    return this.validarStockParaDetalle(request);
  }

  /**
   * Validar stock antes de actualizar un detalle existente
   */
  validarStockParaActualizacion(detalleOrdenId: number, productoId: number, nuevaCantidad: number): Observable<ValidationResultDto> {
    const request: StockValidationRequest = {
      productoId,
      cantidad: nuevaCantidad,
      detalleOrdenId // Con detalle existente = actualización
    };
    return this.validarStockParaDetalle(request);
  }

  /**
   * Validar stock para múltiples productos (útil para checkout)
   */
  validarStockParaCheckout(validaciones: { productoId: number, cantidad: number }[]): Observable<BulkValidationResultDto> {
    const request: BulkStockValidationRequest = {
      validaciones: validaciones.map(v => ({
        productoId: v.productoId,
        cantidad: v.cantidad,
        detalleOrdenId: undefined // Asumimos creación para checkout
      }))
    };
    return this.validarStockMultiple(request);
  }

  /**
   * Verificar rápidamente si un producto está disponible
   */
  verificarDisponibilidadRapida(productoId: number): Observable<boolean> {
    return this.obtenerStockDisponible(productoId).pipe(
      map(resultado => resultado.valido && resultado.stockActual > 0)
    );
  }

  /**
   * Obtener información de stock enriquecida para un producto
   */
  obtenerInfoStockCompleta(productoId: number): Observable<ValidationResultDto> {
    return this.obtenerStockDisponible(productoId);
  }

  // MÉTODOS EXISTENTES (mantenidos para compatibilidad)

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

  // Validar stock disponible (método legacy - mantener por compatibilidad)
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

  // 🔥 NUEVO: Método mejorado para aumentar cantidad con validación
  async aumentarCantidadConValidacion(detalleId: number, productoId: number, cantidadActual: number): Promise<DetalleOrdenDto> {
    // Primero validar el stock
    const validacion = await this.validarStockParaActualizacion(detalleId, productoId, cantidadActual + 1).toPromise();
    
    if (!validacion?.valido) {
      throw new Error(validacion?.mensaje || 'No hay stock suficiente');
    }

    // Si la validación es exitosa, proceder con el aumento
    return this.aumentarCantidad(detalleId, cantidadActual).toPromise() as Promise<DetalleOrdenDto>;
  }

  // 🔥 NUEVO: Método mejorado para crear detalle con validación
  async crearDetalleOrdenConValidacion(ordenId: number, request: CreateDetalleOrdenDto): Promise<DetalleOrdenDto> {
    // Primero validar el stock
    const validacion = await this.validarStockParaCreacion(request.productoId, request.cantidad).toPromise();
    
    if (!validacion?.valido) {
      throw new Error(validacion?.mensaje || 'No hay stock suficiente');
    }

    // Si la validación es exitosa, proceder con la creación
    return this.crearDetalleOrden(ordenId, request).toPromise() as Promise<DetalleOrdenDto>;
  }
}