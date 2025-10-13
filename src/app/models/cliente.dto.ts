// models/cliente.dto.ts
export interface ClienteDto {
  id?: number;
  nombre: string;
  cedula: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro?: string; // O Date si prefieres
  tipoCliente: 'NATURAL' | 'JURIDICO';
  descuentoAplicable?: number;
}