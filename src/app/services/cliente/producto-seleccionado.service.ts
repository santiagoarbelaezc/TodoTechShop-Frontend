import { Injectable, signal } from '@angular/core';
import { ProductoDto } from '../../models/producto/producto.dto';


@Injectable({
  providedIn: 'root'
})
export class ProductoSeleccionadoService {
  // Usamos signal para reactividad
  private productoSeleccionadoSignal = signal<ProductoDto | null>(null);
  
  // Propiedad computada para acceder al producto
  readonly productoSeleccionado = this.productoSeleccionadoSignal.asReadonly();

  constructor() {
    console.log('🛒 Servicio ProductoSeleccionado inicializado');
  }

  /**
   * Establece el producto seleccionado
   * @param producto Producto a almacenar
   */
  setProductoSeleccionado(producto: ProductoDto): void {
    console.log('📦 Producto seleccionado guardado:', producto.nombre);
    this.productoSeleccionadoSignal.set(producto);
  }

  /**
   * Obtiene el producto seleccionado
   * @returns Producto seleccionado o null
   */
  getProductoSeleccionado(): ProductoDto | null {
    const producto = this.productoSeleccionadoSignal();
    console.log('📦 Producto seleccionado obtenido:', producto?.nombre || 'Ninguno');
    return producto;
  }

  /**
   * Limpia el producto seleccionado
   */
  clearProductoSeleccionado(): void {
    console.log('🧹 Producto seleccionado limpiado');
    this.productoSeleccionadoSignal.set(null);
  }

  /**
   * Verifica si hay un producto seleccionado
   * @returns true si hay producto seleccionado
   */
  hasProductoSeleccionado(): boolean {
    return this.productoSeleccionadoSignal() !== null;
  }

  /**
   * Obtiene el ID del producto seleccionado
   * @returns ID del producto o null
   */
  getProductoId(): number | null {
    const producto = this.productoSeleccionadoSignal();
    return producto?.id || null;
  }
}