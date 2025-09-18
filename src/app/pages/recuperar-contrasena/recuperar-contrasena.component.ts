// src/app/components/recuperar-contrasena/recuperar-contrasena.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { MensajeDto } from '../../models/mensaje.dto';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.css']
})
export class RecuperarContrasenaComponent {
  correo: string = '';
  isLoading: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' | '' = '';
  solicitudEnviada: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  solicitarRecuperacion(): void {
    if (!this.correo) {
      this.mostrarMensaje('Por favor ingresa tu correo electrónico', 'error');
      return;
    }

    if (!this.validarEmail(this.correo)) {
      this.mostrarMensaje('Por favor ingresa un correo electrónico válido', 'error');
      return;
    }

    this.isLoading = true;
    this.mensaje = '';

    this.usuarioService.solicitarRecordatorioContrasena(this.correo).subscribe({
      next: (response: MensajeDto<string>) => {
        this.isLoading = false;
        if (!response.error) {
          this.mostrarMensaje(response.mensaje, 'exito');
          this.solicitudEnviada = true;
        } else {
          this.mostrarMensaje(response.mensaje, 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al solicitar recuperación:', error);
        
        let mensajeError = 'Error al procesar la solicitud';
        if (error.error && error.error.mensaje) {
          mensajeError = error.error.mensaje;
        } else if (error.status === 0) {
          mensajeError = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.status === 404) {
          mensajeError = 'No se encontró el servicio de recuperación.';
        }
        
        this.mostrarMensaje(mensajeError, 'error');
      }
    });
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  mostrarMensaje(mensaje: string, tipo: 'exito' | 'error'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    
    // Auto-ocultar mensaje después de 5 segundos
    if (tipo === 'exito') {
      setTimeout(() => {
        this.mensaje = '';
        this.tipoMensaje = '';
      }, 5000);
    }
  }

  volverALogin(): void {
    this.router.navigate(['/login']);
  }
}