// src/app/models/producto.dto.ts
import { EstadoProducto } from './estado-producto.enum';

export interface CategoriaDTO {
  id: number;
  nombre: string;
}

export interface ProductoDTO {
  id?: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  categoria: CategoriaDTO;
  precio: number;
  stock: number;
  imagenUrl?: string;
  marca?: string;
  garantia?: number;
  estado?: EstadoProducto;
}

export interface CrearProductoDTO {
  nombre: string;
  codigo: string;
  descripcion?: string;
  categoria: CategoriaDTO;
  precio: number;
  stock: number;
  imagenUrl?: string;
  marca?: string;
  garantia?: number;
  estado?: EstadoProducto;
}