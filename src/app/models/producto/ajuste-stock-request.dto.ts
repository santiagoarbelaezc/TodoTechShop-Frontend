// src/app/models/producto/ajuste-stock-request.dto.ts
export interface AjusteStockRequestDto {
  cantidad: number;
  operacion: 'INCREMENTAR' | 'DECREMENTAR' | 'AJUSTAR';
}