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

export interface CreateOrdenDto {
  clienteId: number;
  vendedorId: number;
}

export interface OrdenConDetallesDto {
  id: number;
  numeroOrden: string;
  fecha: string; // O Date si prefieres
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
  fecha: string; // O Date si prefieres
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
  fecha: string; // O Date si prefieres
  cliente: ClienteDto;
  vendedor: UsuarioDto;
  productos: DetalleOrdenDto[];
  estado: EstadoOrden;
  total: number;
  porcentajeDescuento: number;
}