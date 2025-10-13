import { OrdenDto } from "./orden-venta/ordenventa.dto";


export interface PagoDTO {
    id: number;
    orden: OrdenDto;
    monto: number;
    metodoPago: string;
  }