export interface CrearUsuarioDTO {
  nombre: string;
  cedula: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  contrasena: string;
  cambiarContrasena: boolean; // ← AÑADIR ESTE CAMPO
  tipoUsuario: 'ADMIN' | 'VENDEDOR' | 'CAJERO' | 'DESPACHADOR';
  estado: boolean;
}