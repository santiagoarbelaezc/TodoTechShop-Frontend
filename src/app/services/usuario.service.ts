// src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UsuarioDto } from '../models/usuario.dto';
import { MensajeDto } from '../models/mensaje.dto';
import { AdminService } from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl: string = 'https://todotechbackend-iqb0.onrender.com/usuarios';
  private usuarioSubject = new BehaviorSubject<UsuarioDto | null>(null);

  constructor(
    private adminService: AdminService,
    private http: HttpClient // Mantenemos HttpClient para el login
  ) {}

  // MÉTODO PRINCIPAL PARA OBTENER USUARIOS
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
      catchError(error => {
        console.error('Error en obtenerUsuarios:', error);
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

  // En usuario.service.ts - método actualizarUsuarioAdmin
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

  // Login method - MANTENIDO COMO ANTES (sin autenticación básica)
  login(nombreUsuario: string, contrasena: string): Observable<MensajeDto<any>> {
    return this.http.post<MensajeDto<any>>(`${this.apiUrl}/login`, null, {
      params: { nombreUsuario, contrasena }
    });
  }

  // Los siguientes métodos son para manejo local del estado del usuario
  setUsuario(usuario: UsuarioDto): void {
    this.usuarioSubject.next(usuario);
    if (usuario) {
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('usuarioActual');
    }
  }

  getUsuario(): UsuarioDto | null {
    const currentUser = this.usuarioSubject.value;
    if (currentUser) {
      return currentUser;
    }
    
    const usuarioStorage = localStorage.getItem('usuarioActual');
    if (usuarioStorage) {
      try {
        const usuario = JSON.parse(usuarioStorage) as UsuarioDto;
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

  getUsuarioObservable(): Observable<UsuarioDto | null> {
    return this.usuarioSubject.asObservable();
  }

  limpiarUsuario(): void {
    this.usuarioSubject.next(null);
    localStorage.removeItem('usuarioActual');
  }

  isUsuarioLogueado(): boolean {
    return this.getUsuario() !== null;
  }

  actualizarUsuario(usuario: UsuarioDto): void {
    const currentUser = this.getUsuario();
    if (currentUser && currentUser.id === usuario.id) {
      this.setUsuario(usuario);
    }
  }
}