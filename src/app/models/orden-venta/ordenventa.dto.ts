import { ClienteDto } from "../cliente.dto";
import { DetalleOrdenDto } from "../detalle-orden/detalle-orden.dto";
import { UsuarioDto } from "../usuario/usuario.dto";

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  AGREGANDOPRODUCTOS = 'AGREGANDOPRODUCTOS',
  DISPONIBLEPARAPAGO = 'DISPONIBLEPARAPAGO',
  PAGADA = 'PAGADA',
  ENTREGADA = 'ENTREGADA',
  CERRADA = 'CERRADA'
}

// ✅ DTO CORREGIDO: Agregar descuento
export interface CreateOrdenDto {
  clienteId: number;
  vendedorId: number;
  descuento: number; // ✅ NUEVO: Descuento obligatorio
}

export interface OrdenConDetallesDto {
  id: number;
  numeroOrden: string;
  fecha: string;
  cliente: ClienteDto;
  vendedor: UsuarioDto;
  productos: DetalleOrdenDto[];
  estado: EstadoOrden;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  observaciones?: string;
}

export interface OrdenDto {
  id: number;
  numeroOrden: string;
  fecha: string;
  cliente: ClienteDto;
  vendedor: UsuarioDto;
  estado: EstadoOrden;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  observaciones?: string;
}

export interface OrdenVentaDescuentoRequest {
  id: number;
  fecha: string;
  cliente: ClienteDto;
  vendedor: UsuarioDto;
  productos: DetalleOrdenDto[];
  estado: EstadoOrden;
  total: number;
  porcentajeDescuento: number;
}