// crear-detalle-request.dto.ts
import { ProductoDTO } from './producto/producto.dto';

export interface eliminarDetalleRequestDTO {
  producto: ProductoDTO;
  ordenVentaId: number;
}
