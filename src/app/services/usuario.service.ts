// src/app/services/usuario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UsuarioDto } from '../models/usuario/usuario.dto';
import { MensajeDto } from '../models/mensaje.dto';
import { LoginResponse } from '../models/login-response.dto';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  
  private apiUrl: string = 'http://localhost:8080';
  private usuarioSubject = new BehaviorSubject<LoginResponse | null>(null);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerUsuarios(): Observable<UsuarioDto[]> {
    return this.http.get<MensajeDto<UsuarioDto[]>>(`${this.apiUrl}/usuarios`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => {
        if (response && typeof response.error === 'boolean' && Array.isArray(response.data)) {
          return response.data;
        } else {
          throw new Error('Estructura de respuesta inválida del servidor');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        throw error;
      })
    );
  }

  crearUsuario(usuarioDTO: UsuarioDto): Observable<MensajeDto<string>> {
    return this.http.post<MensajeDto<string>>(
      `${this.apiUrl}/usuarios`, 
      usuarioDTO, 
      { headers: this.getHeaders() }
    );
  }

  obtenerUltimoUsuario(): Observable<UsuarioDto> {
    return this.http.get<MensajeDto<UsuarioDto>>(
      `${this.apiUrl}/usuarios/ultimo`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  actualizarUsuarioAdmin(id: number, usuario: UsuarioDto): Observable<MensajeDto<string>> {
    return this.http.put<MensajeDto<string>>(
      `${this.apiUrl}/usuarios/${id}`, 
      usuario, 
      { headers: this.getHeaders() }
    );
  }

  cambiarEstadoUsuario(id: number, estado: boolean): Observable<MensajeDto<string>> {
    return this.http.patch<MensajeDto<string>>(
      `${this.apiUrl}/usuarios/${id}/estado?estado=${estado}`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  eliminarUsuario(id: number): Observable<MensajeDto<string>> {
    return this.http.delete<MensajeDto<string>>(
      `${this.apiUrl}/usuarios/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioDto> {
    return this.http.get<MensajeDto<UsuarioDto>>(
      `${this.apiUrl}/usuarios/${id}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  obtenerUsuariosActivos(): Observable<UsuarioDto[]> {
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/activos`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  obtenerUsuariosInactivos(): Observable<UsuarioDto[]> {
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/inactivos`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  buscarUsuariosPorNombre(nombre: string): Observable<UsuarioDto[]> {
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/buscar/nombre?nombre=${encodeURIComponent(nombre)}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  buscarUsuariosPorCedula(cedula: string): Observable<UsuarioDto[]> {
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/buscar/cedula?cedula=${encodeURIComponent(cedula)}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  obtenerUsuariosPorTipo(tipo: string): Observable<UsuarioDto[]> {
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/tipo/${tipo}`, 
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  obtenerUsuariosPorFechaCreacion(fechaInicio: Date, fechaFin: Date): Observable<UsuarioDto[]> {
    const fechaInicioStr = fechaInicio.toISOString();
    const fechaFinStr = fechaFin.toISOString();
    
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/fecha-creacion?fechaInicio=${fechaInicioStr}&fechaFin=${fechaFinStr}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  obtenerUsuariosCreadosDespuesDe(fecha: Date): Observable<UsuarioDto[]> {
    const fechaStr = fecha.toISOString();
    
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/fecha-creacion/despues?fecha=${fechaStr}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  obtenerUsuariosCreadosAntesDe(fecha: Date): Observable<UsuarioDto[]> {
    const fechaStr = fecha.toISOString();
    
    return this.http.get<MensajeDto<UsuarioDto[]>>(
      `${this.apiUrl}/usuarios/fecha-creacion/antes?fecha=${fechaStr}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  solicitarRecordatorioContrasena(correo: string): Observable<MensajeDto<string>> {
    return this.http.post<MensajeDto<string>>(
      `${this.apiUrl}/usuarios/recordar-contrasena?correo=${encodeURIComponent(correo)}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  setUsuario(usuario: LoginResponse): void {
    this.usuarioSubject.next(usuario);
    if (usuario) {
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuarioActual');
    }
  }

  getUsuario(): LoginResponse | null {
    const currentUser = this.usuarioSubject.value;
    if (currentUser) {
      return currentUser;
    }
    
    const usuarioStorage = localStorage.getItem('usuarioActual');
    if (usuarioStorage) {
      try {
        const usuario = JSON.parse(usuarioStorage) as LoginResponse;
        this.usuarioSubject.next(usuario);
        return usuario;
      } catch (error) {
        this.limpiarUsuario();
        return null;
      }
    }
    
    return null;
  }

  getUsuarioObservable(): Observable<LoginResponse | null> {
    return this.usuarioSubject.asObservable();
  }

  limpiarUsuario(): void {
    this.usuarioSubject.next(null);
    localStorage.removeItem('usuarioActual');
  }

  isUsuarioLogueado(): boolean {
    return this.getUsuario() !== null;
  }

  actualizarUsuario(usuario: LoginResponse): void {
    const currentUser = this.getUsuario();
    if (currentUser && currentUser.userId === usuario.userId) {
      this.setUsuario(usuario);
    }
  }
}