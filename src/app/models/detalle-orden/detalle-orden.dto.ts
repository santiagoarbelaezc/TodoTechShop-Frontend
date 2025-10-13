import { ProductoDto } from "../producto/producto.dto";


export interface AplicarDescuentoRequest {
  ordenVentaId: number;
  porcentajeDescuento: number;
}

export interface CreateDetalleOrdenDto {
  productoId: number;
  cantidad: number;
}

export interface DetalleOrdenDto {
  id: number;
  producto: ProductoDto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface EliminarDetalleRequest {
  productoId: number;
  ordenVentaId: number;
}