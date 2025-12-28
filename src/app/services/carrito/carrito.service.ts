// services/carrito.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { ProductoDto } from '../../models/producto/producto.dto';
import { OrdenVentaService } from '../orden-venta.service';
import { CreateDetalleOrdenDto, EliminarDetalleRequest } from '../../models/detalle-orden/detalle-orden.dto';
import { DetalleOrdenService } from '../detalle-orden.service';

export interface ItemCarrito {
  producto: ProductoDto;
  cantidad: number;
  subtotal: number;
  detalleId?: number;
}

export interface ResultadoOperacion {
  exito: boolean;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private detalleOrdenService = inject(DetalleOrdenService);
  private ordenVentaService = inject(OrdenVentaService);
  
  // Estados del carrito
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public carrito$ = this.carritoSubject.asObservable();

  // 🔥 CONSERVADO: BehaviorSubject para notificar cambios en productos (usado en carrusel)
  private productosActualizadosSubject = new BehaviorSubject<number[]>([]);
  public productosActualizados$ = this.productosActualizadosSubject.asObservable();

  // Constantes
  private readonly ESTADOS_MODIFICABLES = ['PENDIENTE', 'AGREGANDOPRODUCTOS'];

  constructor() {
    this.cargarCarritoDesdeLocalStorage();
  }

  // 🔥 CONSERVADO: Notificación de productos actualizados
  private notificarProductoActualizado(productoId: number): void {
    console.log('📢 Notificando actualización del producto:', productoId);
    const productosActuales = this.productosActualizadosSubject.value;
    if (!productosActuales.includes(productoId)) {
      this.productosActualizadosSubject.next([...productosActuales, productoId]);
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        const productosFiltrados = this.productosActualizadosSubject.value.filter(id => id !== productoId);
        this.productosActualizadosSubject.next(productosFiltrados);
      }, 1000);
    }
  }

  // 🔥 SIMPLIFICADO: Verificar si la orden permite modificaciones
  async puedeModificarCarrito(): Promise<boolean> {
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) {
      return true;
    }

    try {
      const orden = await firstValueFrom(
        this.ordenVentaService.obtenerOrdenPorId(ordenId)
      );

      const puedeModificar = this.ESTADOS_MODIFICABLES.includes(orden.estado);
      console.log(`🔍 Estado de orden: ${orden.estado}, ¿Puede modificar?: ${puedeModificar}`);
      return puedeModificar;
      
    } catch (error) {
      console.error('❌ Error verificando estado de la orden:', error);
      return false;
    }
  }

  // 🔥 SIMPLIFICADO: Agregar producto sin validaciones de stock
  async agregarProducto(producto: ProductoDto): Promise<ResultadoOperacion> {
    console.log('🛒 Agregando producto:', producto.nombre);

    try {
      // 1. Validar permisos de modificación
      if (!await this.puedeModificarCarrito()) {
        return this.crearError('La orden no permite agregar más productos');
      }

      const carritoActual = this.carritoSubject.value;
      const itemExistente = carritoActual.find(item => item.producto.id === producto.id);

      if (itemExistente) {
        // Actualizar item existente
        await this.actualizarItemExistente(itemExistente, itemExistente.cantidad + 1);
      } else {
        // Crear nuevo item
        await this.crearNuevoItem(producto, carritoActual);
      }

      // 🔥 CONSERVADO: Notificar actualización del producto
      this.notificarProductoActualizado(producto.id);
      
      return this.crearExito();

    } catch (error: any) {
      console.error('❌ Error agregando producto:', error);
      return this.crearError(error.message);
    }
  }

  // 🔥 SIMPLIFICADO: Eliminar producto
  async eliminarProducto(productoId: number): Promise<ResultadoOperacion> {
    console.log('🗑️ Eliminando producto ID:', productoId);

    try {
      if (!await this.puedeModificarCarrito()) {
        return this.crearError('La orden no permite eliminar productos');
      }

      const carritoActual = this.carritoSubject.value;
      const itemAEliminar = carritoActual.find(item => item.producto.id === productoId);
      
      if (itemAEliminar) {
        // Eliminar del backend
        if (itemAEliminar.detalleId) {
          await this.eliminarDetalleEnBackend(itemAEliminar.detalleId);
        } else {
          await this.eliminarDetallePorProductoYOrden(productoId);
        }

        // 🔥 CONSERVADO: Notificar actualización del producto
        this.notificarProductoActualizado(productoId);
      }

      const nuevoCarrito = carritoActual.filter(item => item.producto.id !== productoId);
      this.actualizarCarrito(nuevoCarrito);
      
      return this.crearExito();

    } catch (error: any) {
      console.error('❌ Error eliminando producto:', error);
      return this.crearError(error.message);
    }
  }

  // 🔥 SIMPLIFICADO: Ajustar cantidad sin validaciones de stock
  async ajustarCantidad(productoId: number, cambio: number): Promise<ResultadoOperacion> {
    console.log('⚖️ Ajustando cantidad para producto ID:', productoId, 'Cambio:', cambio);

    try {
      if (!await this.puedeModificarCarrito()) {
        return this.crearError('La orden no permite modificar cantidades');
      }

      const carritoActual = this.carritoSubject.value;
      const item = carritoActual.find(item => item.producto.id === productoId);
      
      if (!item) {
        return this.crearError('Producto no encontrado en carrito');
      }

      if (cambio > 0) {
        return await this.aumentarCantidadItem(item);
      } else {
        return await this.disminuirCantidadItem(item);
      }

    } catch (error: any) {
      console.error('❌ Error ajustando cantidad:', error);
      return this.crearError(error.message);
    }
  }

  // 🔥 SIMPLIFICADO: Aumentar cantidad
  private async aumentarCantidadItem(item: ItemCarrito): Promise<ResultadoOperacion> {
    const nuevaCantidad = item.cantidad + 1;

    // Actualizar item
    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.producto.precio;

    // Sincronizar con backend
    if (item.detalleId) {
      await this.actualizarCantidadEnBackend(item.detalleId, item.cantidad);
    } else {
      await this.crearDetalleEnBackend(item.producto.id, item.cantidad);
    }

    // 🔥 CONSERVADO: Notificar actualización del producto
    this.notificarProductoActualizado(item.producto.id);
    
    this.actualizarCarrito(this.carritoSubject.value);
    
    return this.crearExito();
  }

  // 🔥 SIMPLIFICADO: Disminuir cantidad
  private async disminuirCantidadItem(item: ItemCarrito): Promise<ResultadoOperacion> {
    if (item.cantidad > 1) {
      // Disminuir cantidad
      item.cantidad--;
      item.subtotal = item.cantidad * item.producto.precio;

      // Sincronizar con backend
      if (item.detalleId) {
        await this.actualizarCantidadEnBackend(item.detalleId, item.cantidad);
      } else {
        await this.crearDetalleEnBackend(item.producto.id, item.cantidad);
      }

      // 🔥 CONSERVADO: Notificar actualización del producto
      this.notificarProductoActualizado(item.producto.id);
      
      this.actualizarCarrito(this.carritoSubject.value);
      
      return this.crearExito();
    } else {
      // Eliminar si llega a 0
      return await this.eliminarProducto(item.producto.id);
    }
  }

  private async actualizarItemExistente(item: ItemCarrito, nuevaCantidad: number): Promise<void> {
    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.producto.precio;

    if (item.detalleId) {
      await this.actualizarCantidadEnBackend(item.detalleId, item.cantidad);
    } else {
      await this.crearDetalleEnBackend(item.producto.id, item.cantidad);
    }

    this.actualizarCarrito(this.carritoSubject.value);
  }

  private async crearNuevoItem(producto: ProductoDto, carritoActual: ItemCarrito[]): Promise<void> {
    const nuevoItem: ItemCarrito = {
      producto: producto,
      cantidad: 1,
      subtotal: producto.precio
    };

    carritoActual.push(nuevoItem);
    await this.crearDetalleEnBackend(producto.id, 1);
    this.actualizarCarrito(carritoActual);
  }

  // 🔥 SIMPLIFICADO: Vaciar carrito
  async vaciarCarrito(): Promise<ResultadoOperacion> {
    console.log('🗑️ Vaciando carrito completo');

    try {
      if (!await this.puedeModificarCarrito()) {
        return this.crearError('La orden no permite vaciar el carrito');
      }

      // 🔥 CONSERVADO: Notificar actualización de todos los productos
      const carritoActual = this.obtenerCarrito();
      carritoActual.forEach(item => {
        this.notificarProductoActualizado(item.producto.id);
      });

      // Eliminar todos los detalles del backend
      const ordenId = this.ordenVentaService.obtenerOrdenActualId();
      if (ordenId) {
        const detalles = await firstValueFrom(
          this.detalleOrdenService.obtenerDetallesPorOrden(ordenId)
        );
        
        for (const detalle of detalles) {
          await firstValueFrom(
            this.detalleOrdenService.eliminarDetalle(detalle.id)
          );
        }
      }

      this.actualizarCarrito([]);
      return this.crearExito();

    } catch (error: any) {
      console.error('❌ Error vaciando carrito:', error);
      return this.crearError(error.message);
    }
  }

  // 🔥 SIMPLIFICADO: Sincronizar carrito - SIN VALIDACIONES DE STOCK
  async sincronizarCarritoCompleto(): Promise<boolean> {
    console.log('🔄 Sincronizando carrito completo...');

    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) return false;

    try {
      // Verificar estado de la orden
      const orden = await firstValueFrom(
        this.ordenVentaService.obtenerOrdenPorId(ordenId)
      );

      if (!this.ESTADOS_MODIFICABLES.includes(orden.estado)) {
        console.warn(`⚠️ Orden en estado ${orden.estado}, no se puede sincronizar`);
        return false;
      }

      const carrito = this.obtenerCarrito();

      // 🔥 ELIMINADO: Validaciones de stock innecesarias
      // Los productos ya están reservados, no necesitamos validar stock

      // Sincronizar cada item
      for (const item of carrito) {
        if (item.detalleId) {
          await this.actualizarCantidadEnBackend(item.detalleId, item.cantidad);
        } else {
          await this.crearDetalleEnBackend(item.producto.id, item.cantidad);
        }

        // 🔥 CONSERVADO: Notificar actualización del producto
        this.notificarProductoActualizado(item.producto.id);
      }

      console.log('🎉 Carrito sincronizado exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error sincronizando carrito:', error);
      return false;
    }
  }

  // 🔥 CORREGIDO: Cargar carrito desde backend
  async cargarCarritoDesdeBackend(): Promise<void> {
    console.log('📥 Cargando carrito desde backend...');

    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) {
      this.actualizarCarrito([]);
      return;
    }

    try {
      const detalles = await firstValueFrom(
        this.detalleOrdenService.obtenerDetallesPorOrden(ordenId)
      );

      const carrito: ItemCarrito[] = detalles.map(detalle => ({
        producto: detalle.producto,
        cantidad: detalle.cantidad,
        subtotal: detalle.subtotal,
        detalleId: detalle.id
      }));

      this.actualizarCarrito(carrito);
      console.log(`✅ Carrito cargado: ${carrito.length} productos`);

      // 🔥 CONSERVADO: Notificar actualización de todos los productos cargados
      carrito.forEach(item => {
        this.notificarProductoActualizado(item.producto.id);
      });

    } catch (error) {
      console.error('❌ Error cargando carrito:', error);
      this.actualizarCarrito([]);
    }
  }

  // 🔥 MÉTODOS DE CONVENIENCIA
  private crearExito(): ResultadoOperacion {
    return { exito: true };
  }

  private crearError(mensaje: string): ResultadoOperacion {
    return { 
      exito: false, 
      mensaje
    };
  }

  // 🔹 MÉTODOS PÚBLICOS BÁSICOS
  obtenerCarrito(): ItemCarrito[] {
    return this.carritoSubject.value;
  }

  obtenerTotal(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.subtotal, 0);
  }

  obtenerCantidadTotal(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  estaEnCarrito(productoId: number): boolean {
    return this.carritoSubject.value.some(item => item.producto.id === productoId);
  }

  obtenerCantidadProducto(productoId: number): number {
    const item = this.carritoSubject.value.find(item => item.producto.id === productoId);
    return item ? item.cantidad : 0;
  }

  // 🔹 MÉTODOS PRIVADOS DE BACKEND
  private async crearDetalleEnBackend(productoId: number, cantidad: number): Promise<void> {
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) return;

    try {
      const detalleDto: CreateDetalleOrdenDto = {
        productoId: productoId,
        cantidad: cantidad
      };

      const detalleCreado = await firstValueFrom(
        this.detalleOrdenService.crearDetalleOrden(ordenId, detalleDto)
      );

      // Actualizar detalleId en el carrito
      const carritoActual = this.carritoSubject.value;
      const item = carritoActual.find(item => item.producto.id === productoId);
      if (item) {
        item.detalleId = detalleCreado.id;
        this.actualizarCarrito(carritoActual);
      }
    } catch (error) {
      console.error('❌ Error creando detalle:', error);
      throw error;
    }
  }

  private async actualizarCantidadEnBackend(detalleId: number, cantidad: number): Promise<void> {
    try {
      await firstValueFrom(
        this.detalleOrdenService.actualizarCantidad(detalleId, cantidad)
      );
    } catch (error) {
      console.error('❌ Error actualizando cantidad:', error);
      throw error;
    }
  }

  private async eliminarDetalleEnBackend(detalleId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.detalleOrdenService.eliminarDetalle(detalleId)
      );
    } catch (error) {
      console.error('❌ Error eliminando detalle:', error);
      throw error;
    }
  }

  private async eliminarDetallePorProductoYOrden(productoId: number): Promise<void> {
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) return;

    try {
      const request: EliminarDetalleRequest = {
        productoId: productoId,
        ordenVentaId: ordenId
      };

      await firstValueFrom(
        this.detalleOrdenService.eliminarDetallePorProductoYOrden(request)
      );
    } catch (error) {
      console.error('❌ Error eliminando detalle por producto:', error);
      throw error;
    }
  }

  // 🔹 GESTIÓN LOCAL
  private actualizarCarrito(nuevoCarrito: ItemCarrito[]): void {
    this.carritoSubject.next(nuevoCarrito);
    this.guardarEnLocalStorage(nuevoCarrito);
    console.log('💾 Carrito actualizado:', nuevoCarrito.length, 'productos');
  }

  private guardarEnLocalStorage(carrito: ItemCarrito[]): void {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }

  private cargarCarritoDesdeLocalStorage(): void {
    try {
      const carritoGuardado = localStorage.getItem('carrito');
      if (carritoGuardado) {
        const carrito = JSON.parse(carritoGuardado);
        this.carritoSubject.next(carrito);
        console.log('📂 Carrito cargado desde localStorage:', carrito.length, 'productos');
      }
    } catch (error) {
      console.error('❌ Error cargando carrito desde localStorage:', error);
      this.actualizarCarrito([]);
    }
  }
}