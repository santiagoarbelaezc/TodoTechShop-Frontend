import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { 
  OrdenDto, 
  OrdenConDetallesDto, 
  CreateOrdenDto 
} from '../models/orden-venta/ordenventa.dto';
import { MensajeDto } from '../models/mensaje.dto';
import { environment } from '../../environments/environment';

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  AGREGANDOPRODUCTOS = 'AGREGANDOPRODUCTOS',
  DISPONIBLEPARAPAGO = 'DISPONIBLEPARAPAGO',
  PAGADA = 'PAGADA',
  ENTREGADA = 'ENTREGADA',
  CERRADA = 'CERRADA'
}

@Injectable({
  providedIn: 'root'
})
export class OrdenVentaService {
  private apiUrl = `${environment.apiUrl}/ordenes`;
  private ordenActual: OrdenDto | null = null;

  constructor(private http: HttpClient) { }

  // ========== MÉTODOS SIMPLIFICADOS PARA GUARDAR LA ORDEN ACTUAL ==========

  /**
   * Guarda la orden actual completa en memoria y localStorage
   */
  guardarOrdenActual(orden: OrdenDto): void {
    console.log('💾 Guardando orden actual en servicio:', orden);
    
    // Guardar en memoria
    this.ordenActual = orden;
    
    // Guardar en localStorage como string
    localStorage.setItem('ordenActual', JSON.stringify(orden));
    
    console.log('✅ Orden guardada correctamente en servicio');
  }

  /**
   * Obtiene la orden actual guardada
   */
  obtenerOrdenActual(): OrdenDto | null {
    // Primero intentar obtener de memoria
    if (this.ordenActual) {
      console.log('📂 Orden actual obtenida de memoria:', this.ordenActual);
      return this.ordenActual;
    }
    
    // Si no hay en memoria, intentar obtener de localStorage
    const ordenGuardada = localStorage.getItem('ordenActual');
    if (ordenGuardada) {
      const orden = JSON.parse(ordenGuardada);
      this.ordenActual = orden; // Guardar en memoria para próximas consultas
      console.log('📂 Orden actual obtenida de localStorage:', orden);
      return orden;
    }
    
    console.log('ℹ️ No hay orden actual guardada');
    return null;
  }

  /**
   * Verifica si hay una orden actual guardada
   */
  tieneOrdenActual(): boolean {
    const tieneOrden = this.ordenActual !== null || localStorage.getItem('ordenActual') !== null;
    console.log('🔍 ¿Tiene orden actual?', tieneOrden);
    return tieneOrden;
  }

  /**
   * Obtiene el ID de la orden actual guardada
   */
  obtenerOrdenActualId(): number | null {
    const orden = this.obtenerOrdenActual();
    return orden?.id || null;
  }

  /**
   * Limpia la orden actual de memoria y localStorage
   */
  limpiarOrdenActual(): void {
    console.log('🗑️ Limpiando orden actual del servicio');
    this.ordenActual = null;
    localStorage.removeItem('ordenActual');
  }

  // ========== MÉTODOS EXISTENTES (se mantienen igual) ==========

  // Métodos para manejar la orden actual en memoria (mantener por compatibilidad)
  setOrden(orden: OrdenDto): void {
    this.ordenActual = orden;
  }

  getOrden(): OrdenDto | null {
    return this.ordenActual;
  }

  limpiarOrden(): void {
    this.ordenActual = null;
  }

  // Métodos para manejar el ID de orden en localStorage
  getOrdenIdDesdeLocalStorage(): number | null {
    const id = localStorage.getItem('ordenId');
    return id ? parseInt(id, 10) : null;
  }

  setOrdenIdEnLocalStorage(ordenId: number): void {
    localStorage.setItem('ordenId', ordenId.toString());
  }

  limpiarOrdenId(): void {
    localStorage.removeItem('ordenId');
  }

  // Métodos principales del servicio (se mantienen igual)
  crearOrden(createOrdenDto: CreateOrdenDto): Observable<OrdenDto> {
    return this.http.post<MensajeDto<OrdenDto>>(this.apiUrl, createOrdenDto).pipe(
      map(response => response.data!)
    );
  }

  obtenerOrdenPorId(id: number): Observable<OrdenDto> {
    return this.http.get<MensajeDto<OrdenDto>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data!)
    );
  }

  obtenerOrdenConDetalles(id: number): Observable<OrdenConDetallesDto> {
    return this.http.get<MensajeDto<OrdenConDetallesDto>>(`${this.apiUrl}/${id}/detalles`).pipe(
      map(response => response.data!)
    );
  }

  obtenerTodasLasOrdenes(): Observable<OrdenDto[]> {
    return this.http.get<MensajeDto<OrdenDto[]>>(this.apiUrl).pipe(
      map(response => response.data!)
    );
  }

  obtenerOrdenesPorCliente(clienteId: number): Observable<OrdenDto[]> {
    return this.http.get<MensajeDto<OrdenDto[]>>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      map(response => response.data!)
    );
  }

  obtenerOrdenesPorEstado(estado: EstadoOrden): Observable<OrdenDto[]> {
    return this.http.get<MensajeDto<OrdenDto[]>>(`${this.apiUrl}/estado/${estado}`).pipe(
      map(response => response.data!)
    );
  }

  actualizarOrden(id: number, ordenDto: OrdenDto): Observable<OrdenDto> {
    return this.http.put<MensajeDto<OrdenDto>>(`${this.apiUrl}/${id}`, ordenDto).pipe(
      map(response => response.data!)
    );
  }

  actualizarEstadoOrden(id: number, nuevoEstado: EstadoOrden): Observable<OrdenDto> {
    return this.http.patch<MensajeDto<OrdenDto>>(
      `${this.apiUrl}/${id}/estado?nuevoEstado=${nuevoEstado}`, 
      {}
    ).pipe(
      map(response => response.data!)
    );
  }

  // ========== MÉTODOS CORREGIDOS PARA LOS NUEVOS ESTADOS ==========

  // ✅ CORREGIDO: Usa el endpoint específico en lugar del genérico
  marcarComoAgregandoProductos(id: number): Observable<OrdenDto> {
    return this.http.patch<MensajeDto<OrdenDto>>(
      `${this.apiUrl}/${id}/agregando-productos`, 
      {}
    ).pipe(
      map(response => response.data!)
    );
  }

  // ✅ CORREGIDO: Usa el endpoint específico en lugar del genérico
  marcarComoDisponibleParaPago(id: number): Observable<OrdenDto> {
    return this.http.patch<MensajeDto<OrdenDto>>(
      `${this.apiUrl}/${id}/disponible-pago`, 
      {}
    ).pipe(
      map(response => response.data!)
    );
  }

  // ✅ MÉTODOS QUE YA ESTÁN CORRECTOS (se mantienen igual)
  marcarComoPagada(id: number): Observable<OrdenDto> {
    return this.http.patch<MensajeDto<OrdenDto>>(`${this.apiUrl}/${id}/pagada`, {}).pipe(
      map(response => response.data!)
    );
  }

  marcarComoEntregada(id: number): Observable<OrdenDto> {
    return this.http.patch<MensajeDto<OrdenDto>>(`${this.apiUrl}/${id}/entregada`, {}).pipe(
      map(response => response.data!)
    );
  }

  marcarComoCerrada(id: number): Observable<OrdenDto> {
    return this.http.patch<MensajeDto<OrdenDto>>(`${this.apiUrl}/${id}/cerrada`, {}).pipe(
      map(response => response.data!)
    );
  }

  aplicarDescuento(id: number, porcentajeDescuento: number): Observable<OrdenDto> {
    return this.http.patch<MensajeDto<OrdenDto>>(
      `${this.apiUrl}/${id}/descuento?porcentajeDescuento=${porcentajeDescuento}`, 
      {}
    ).pipe(
      map(response => response.data!)
    );
  }

  eliminarOrden(id: number): Observable<string> {
    return this.http.delete<MensajeDto<string>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.mensaje)
    );
  }

  // ========== MÉTODOS ESPECÍFICOS PARA LOS ESTADOS (CONVENIENCIA) ==========

  obtenerOrdenesPendientes(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.PENDIENTE);
  }

  obtenerOrdenesAgregandoProductos(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.AGREGANDOPRODUCTOS);
  }

  obtenerOrdenesDisponiblesParaPago(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.DISPONIBLEPARAPAGO);
  }

  obtenerOrdenesPagadas(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.PAGADA);
  }

  obtenerOrdenesEntregadas(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.ENTREGADA);
  }

  obtenerOrdenesCerradas(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.CERRADA);
  }

  // ========== MÉTODOS ADICIONALES PARA FLUJO DE TRABAJO ==========

  /**
   * Obtiene órdenes que están en estado activo (no cerradas ni entregadas)
   */
  obtenerOrdenesActivas(): Observable<OrdenDto[]> {
    return this.obtenerTodasLasOrdenes().pipe(
      map(ordenes => ordenes.filter(orden => 
        orden.estado !== EstadoOrden.CERRADA && 
        orden.estado !== EstadoOrden.ENTREGADA
      ))
    );
  }

  /**
   * Obtiene órdenes que están listas para procesar pago
   */
  obtenerOrdenesListasParaPago(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.DISPONIBLEPARAPAGO);
  }

  /**
   * Obtiene órdenes que están en proceso (agregando productos)
   */
  obtenerOrdenesEnProceso(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.AGREGANDOPRODUCTOS);
  }

  /**
   * Obtiene todas las órdenes de un vendedor específico
   */
  obtenerOrdenesPorVendedor(vendedorId: number): Observable<OrdenDto[]> {
    return this.http.get<MensajeDto<OrdenDto[]>>(`${this.apiUrl}/vendedor/${vendedorId}`).pipe(
      map(response => response.data!)
    );
  }

  /**
 * Actualiza el total de una orden existente
 * @param id ID de la orden a actualizar
 * @param total Nuevo valor para el total de la orden
 * @returns Orden actualizada
 */
actualizarTotalOrden(id: number, total: number): Observable<OrdenDto> {
  return this.http.patch<MensajeDto<OrdenDto>>(
    `${this.apiUrl}/${id}/total?total=${total}`, 
    {}
  ).pipe(
    map(response => response.data!)
  );
}


}