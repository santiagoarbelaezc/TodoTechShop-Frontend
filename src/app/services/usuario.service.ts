// src/app/services/usuario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UsuarioDto } from '../models/usuario.dto';
import { MensajeDto } from '../models/mensaje.dto';
import { LoginResponse } from '../models/login-response.dto';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private adminService = inject(AdminService);
  private http = inject(HttpClient);
  
  private apiUrl: string = 'https://todotechbackend-iqb0.onrender.com';
  private usuarioSubject = new BehaviorSubject<LoginResponse | null>(null);

  obtenerUsuarios(): Observable<UsuarioDto[]> {
  return this.adminService.get<MensajeDto<UsuarioDto[]>>('/usuarios').pipe(
    map(response => {
      if (response && typeof response.error === 'boolean' && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        throw new Error('Estructura de respuesta inválida del servidor');
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('Error completo en obtenerUsuarios:', error);
      
      if (error.status === 403) {
        // Token inválido o expirado
        console.error('Acceso denegado. El token puede haber expirado.');
        // No hacer logout automáticamente aquí, el interceptor se encarga
      }
      
      throw error;
    })
  );
}

  // MÉTODOS EXISTENTES - Actualizados para usar AdminService
  crearUsuario(usuarioDTO: UsuarioDto): Observable<MensajeDto<string>> {
    return this.adminService.post<MensajeDto<string>>('/usuarios', usuarioDTO);
  }

  obtenerUltimoUsuario(): Observable<UsuarioDto> {
    return this.adminService.get<MensajeDto<UsuarioDto>>('/usuarios/ultimo').pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUltimoUsuario:', error);
        throw error;
      })
    );
  }

  // Método actualizarUsuarioAdmin
  actualizarUsuarioAdmin(id: number, usuario: UsuarioDto): Observable<MensajeDto<string>> {
    console.log('Enviando usuario para actualizar:', usuario);
    console.log('Estado enviado:', usuario.estado, 'Tipo:', typeof usuario.estado);
    
    return this.adminService.put<MensajeDto<string>>(`/usuarios/${id}`, usuario);
  }

  cambiarEstadoUsuario(id: number, estado: boolean): Observable<MensajeDto<string>> {
    return this.adminService.patch<MensajeDto<string>>(`/usuarios/${id}/estado?estado=${estado}`);
  }

  eliminarUsuario(id: number): Observable<MensajeDto<string>> {
    return this.adminService.delete<MensajeDto<string>>(`/usuarios/${id}`);
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioDto> {
    return this.adminService.get<MensajeDto<UsuarioDto>>(`/usuarios/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUsuarioPorId:', error);
        throw error;
      })
    );
  }

  obtenerUsuariosActivos(): Observable<UsuarioDto[]> {
    return this.adminService.get<MensajeDto<UsuarioDto[]>>('/usuarios/activos').pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUsuariosActivos:', error);
        throw error;
      })
    );
  }

  obtenerUsuariosInactivos(): Observable<UsuarioDto[]> {
    return this.adminService.get<MensajeDto<UsuarioDto[]>>('/usuarios/inactivos').pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUsuariosInactivos:', error);
        throw error;
      })
    );
  }

  // Buscar usuarios por nombre (búsqueda parcial)
  buscarUsuariosPorNombre(nombre: string): Observable<UsuarioDto[]> {
    return this.adminService.get<MensajeDto<UsuarioDto[]>>(`/usuarios/buscar/nombre?nombre=${encodeURIComponent(nombre)}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en buscarUsuariosPorNombre:', error);
        throw error;
      })
    );
  }

  // Buscar usuarios por cédula (búsqueda parcial)
  buscarUsuariosPorCedula(cedula: string): Observable<UsuarioDto[]> {
    return this.adminService.get<MensajeDto<UsuarioDto[]>>(`/usuarios/buscar/cedula?cedula=${encodeURIComponent(cedula)}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en buscarUsuariosPorCedula:', error);
        throw error;
      })
    );
  }

  // Obtener usuarios por tipo
  obtenerUsuariosPorTipo(tipo: string): Observable<UsuarioDto[]> {
    return this.adminService.get<MensajeDto<UsuarioDto[]>>(`/usuarios/tipo/${tipo}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUsuariosPorTipo:', error);
        throw error;
      })
    );
  }

  // Obtener usuarios por rango de fechas
  obtenerUsuariosPorFechaCreacion(fechaInicio: Date, fechaFin: Date): Observable<UsuarioDto[]> {
    const fechaInicioStr = fechaInicio.toISOString();
    const fechaFinStr = fechaFin.toISOString();
    
    return this.adminService.get<MensajeDto<UsuarioDto[]>>(
      `/usuarios/fecha-creacion?fechaInicio=${fechaInicioStr}&fechaFin=${fechaFinStr}`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUsuariosPorFechaCreacion:', error);
        throw error;
      })
    );
  }

  // Obtener usuarios creados después de una fecha
  obtenerUsuariosCreadosDespuesDe(fecha: Date): Observable<UsuarioDto[]> {
    const fechaStr = fecha.toISOString();
    
    return this.adminService.get<MensajeDto<UsuarioDto[]>>(
      `/usuarios/fecha-creacion/despues?fecha=${fechaStr}`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUsuariosCreadosDespuesDe:', error);
        throw error;
      })
    );
  }

  // Obtener usuarios creados antes de una fecha
  obtenerUsuariosCreadosAntesDe(fecha: Date): Observable<UsuarioDto[]> {
    const fechaStr = fecha.toISOString();
    
    return this.adminService.get<MensajeDto<UsuarioDto[]>>(
      `/usuarios/fecha-creacion/antes?fecha=${fechaStr}`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error en obtenerUsuariosCreadosAntesDe:', error);
        throw error;
      })
    );
  }

  // Solicitar recordatorio de contraseña
  solicitarRecordatorioContrasena(correo: string): Observable<MensajeDto<string>> {
    return this.adminService.post<MensajeDto<string>>(
      `/usuarios/recordar-contrasena?correo=${encodeURIComponent(correo)}`,
      {}
    );
  }

  // Los siguientes métodos son para manejo local del estado del usuario
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
        console.error('Error parsing usuario from localStorage:', error);
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