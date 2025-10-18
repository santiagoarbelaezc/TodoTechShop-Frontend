// src/app/models/producto/stock-response.dto.ts
export interface StockResponseDto {
  productoId: number;
  stock: number;
  nombreProducto: string;
  estado: string;
}