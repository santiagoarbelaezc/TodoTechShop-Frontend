// stock-validation.models.ts
export interface StockValidationRequest {
  productoId: number;
  cantidad: number;
  detalleOrdenId?: number;
}

export interface ValidationResultDto {
  valido: boolean;
  mensaje: string;
  stockActual: number;
  stockDisponible: number;
  stockCritico: boolean;
  accionRecomendada: string;
}

export interface BulkStockValidationRequest {
  validaciones: StockValidationRequest[];
}

export interface BulkValidationResultDto {
  todoValido: boolean;
  mensajeGeneral: string;
  resultados: { [productoId: number]: ValidationResultDto };
  productosConProblemas: number[];
  totalProductos: number;
  productosValidos: number;
  productosInvalidos: number;
}