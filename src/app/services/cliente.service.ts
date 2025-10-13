import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Models
import { ClienteDto } from '../models/cliente.dto';
import { MensajeDto } from '../models/mensaje.dto';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) { }

  // Crear cliente
  crearCliente(cliente: ClienteDto): Observable<MensajeDto<ClienteDto>> {
    return this.http.post<MensajeDto<ClienteDto>>(this.apiUrl, cliente);
  }

  // Actualizar cliente
  actualizarCliente(id: number, cliente: ClienteDto): Observable<MensajeDto<ClienteDto>> {
    return this.http.put<MensajeDto<ClienteDto>>(`${this.apiUrl}/${id}`, cliente);
  }

  // Eliminar cliente
  eliminarCliente(id: number): Observable<MensajeDto<string>> {
    return this.http.delete<MensajeDto<string>>(`${this.apiUrl}/${id}`);
  }

  // Obtener cliente por ID
  obtenerClientePorId(id: number): Observable<MensajeDto<ClienteDto>> {
    return this.http.get<MensajeDto<ClienteDto>>(`${this.apiUrl}/${id}`);
  }

  // Obtener cliente por cédula
  obtenerClientePorCedula(cedula: string): Observable<MensajeDto<ClienteDto>> {
    return this.http.get<MensajeDto<ClienteDto>>(`${this.apiUrl}/cedula/${cedula}`);
  }

  // Obtener cliente por correo
  obtenerClientePorCorreo(correo: string): Observable<MensajeDto<ClienteDto>> {
    return this.http.get<MensajeDto<ClienteDto>>(`${this.apiUrl}/correo/${correo}`);
  }

  // Obtener clientes por tipo
  obtenerClientesPorTipo(tipo: 'NATURAL' | 'JURIDICO'): Observable<MensajeDto<ClienteDto[]>> {
    return this.http.get<MensajeDto<ClienteDto[]>>(`${this.apiUrl}/tipo/${tipo}`);
  }

  // Obtener clientes por nombre
  obtenerClientesPorNombre(nombre: string): Observable<MensajeDto<ClienteDto[]>> {
    return this.http.get<MensajeDto<ClienteDto[]>>(`${this.apiUrl}/nombre/${nombre}`);
  }

  // Obtener clientes registrados después de una fecha
  obtenerClientesRegistradosDespuesDe(fecha: string): Observable<MensajeDto<ClienteDto[]>> {
    return this.http.get<MensajeDto<ClienteDto[]>>(`${this.apiUrl}/registrados-despues/${fecha}`);
  }

  // Obtener clientes registrados entre fechas
  obtenerClientesRegistradosEntre(inicio: string, fin: string): Observable<MensajeDto<ClienteDto[]>> {
    let params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);
    
    return this.http.get<MensajeDto<ClienteDto[]>>(`${this.apiUrl}/registrados-entre`, { params });
  }

  // Contar clientes por tipo
  contarClientesPorTipo(tipo: 'NATURAL' | 'JURIDICO'): Observable<MensajeDto<number>> {
    return this.http.get<MensajeDto<number>>(`${this.apiUrl}/contar/tipo/${tipo}`);
  }

  // Obtener todos los clientes (nuevo método si existe en el backend)
  obtenerTodosLosClientes(): Observable<MensajeDto<ClienteDto[]>> {
    return this.http.get<MensajeDto<ClienteDto[]>>(this.apiUrl);
  }
}