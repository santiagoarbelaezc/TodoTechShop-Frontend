// src/app/models/producto.dto.ts
import { CategoriaDto } from '../categoria.dto';
import { EstadoProducto } from '../enums/estado-producto.enum';


export interface ProductoDto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  categoria: CategoriaDto;
  precio: number;
  stock: number;
  imagenUrl: string;
  marca: string;
  garantia: number;
  estado: EstadoProducto;
}