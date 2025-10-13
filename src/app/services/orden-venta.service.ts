import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { 
  OrdenDto, 
  OrdenConDetallesDto, 
  CreateOrdenDto 
} from '../models/orden-venta/ordenventa.dto';
import { MensajeDto } from '../models/mensaje.dto';

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
  ENTREGADA = 'ENTREGADA',
  CERRADA = 'CERRADA'
}

@Injectable({
  providedIn: 'root'
})
export class OrdenVentaService {
  private apiUrl = 'http://localhost:8080/ordenes';
  private ordenActual: OrdenDto | null = null;

  constructor(private http: HttpClient) { }

  // Métodos para manejar la orden actual en memoria
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

  // Métodos principales del servicio
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

  // Métodos específicos para los estados comunes (conveniencia)
  obtenerOrdenesPendientes(): Observable<OrdenDto[]> {
    return this.obtenerOrdenesPorEstado(EstadoOrden.PENDIENTE);
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
}