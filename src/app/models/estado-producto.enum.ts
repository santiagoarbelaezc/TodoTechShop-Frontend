// src/app/models/estado-producto.enum.ts
export enum EstadoProducto {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO', 
  DESCONTINUADO = 'DESCONTINUADO',
  AGOTADO = 'AGOTADO'
}

// Y añade este helper
export function estadoProductoToString(estado: EstadoProducto): string {
  return estado as string;
}