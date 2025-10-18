// services/carrito.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { ProductoDto } from '../models/producto/producto.dto';
import { DetalleOrdenService } from './detalle-orden.service';
import { OrdenVentaService } from './orden-venta.service';
import { CreateDetalleOrdenDto, EliminarDetalleRequest } from '../models/detalle-orden/detalle-orden.dto';
import { ProductoService } from './producto.service';
import { OrdenDto } from '../models/orden-venta/ordenventa.dto';

export interface ItemCarrito {
  producto: ProductoDto;
  cantidad: number;
  subtotal: number;
  detalleId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private detalleOrdenService = inject(DetalleOrdenService);
  private ordenVentaService = inject(OrdenVentaService);
  private productoService = inject(ProductoService);
  
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);
  public carrito$ = this.carritoSubject.asObservable();

  // 🔥 NUEVO: BehaviorSubject para notificar cambios en productos
  private productosActualizadosSubject = new BehaviorSubject<number[]>([]);
  public productosActualizados$ = this.productosActualizadosSubject.asObservable();

  constructor() {
    this.cargarCarritoDesdeLocalStorage();
  }

  // 🔹 NUEVO MÉTODO: NOTIFICAR ACTUALIZACIONES DE PRODUCTOS
  private notificarProductoActualizado(productoId: number): void {
    console.log('📢 Notificando actualización del producto:', productoId);
    const productosActuales = this.productosActualizadosSubject.value;
    this.productosActualizadosSubject.next([...productosActuales, productoId]);
    
    // Limpiar después de un tiempo para evitar acumulación
    setTimeout(() => {
      const productosFiltrados = this.productosActualizadosSubject.value.filter(id => id !== productoId);
      this.productosActualizadosSubject.next(productosFiltrados);
    }, 1000);
  }

  // 🔹 NUEVO MÉTODO: VERIFICAR SI LA ORDEN PERMITE MODIFICACIONES - CORREGIDO
  async puedeModificarCarrito(): Promise<boolean> {
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) {
      return true; // Sin orden = se puede modificar
    }

    try {
      // ✅ CORREGIDO: Usar obtenerOrdenPorId en lugar de obtenerOrden
      const orden = await firstValueFrom(
        this.ordenVentaService.obtenerOrdenPorId(ordenId)
      );

      const estadosModificables = ['PENDIENTE', 'AGREGANDOPRODUCTOS'];
      const puedeModificar = estadosModificables.includes(orden.estado);
      
      console.log(`🔍 Estado de orden: ${orden.estado}, ¿Puede modificar?: ${puedeModificar}`);
      return puedeModificar;
      
    } catch (error) {
      console.error('❌ Error verificando estado de la orden:', error);
      return false;
    }
  }

  // 🔹 AGREGAR PRODUCTO AL CARRITO (LOCAL Y BACKEND) - CORREGIDO
  async agregarProducto(producto: ProductoDto): Promise<void> {
    console.log('🛒 [CarritoService] Agregando producto:', producto.nombre);
    
    // Verificar si la orden permite modificaciones
    const puedeModificar = await this.puedeModificarCarrito();
    if (!puedeModificar) {
      console.warn('❌ No se puede agregar producto: La orden no permite modificaciones');
      throw new Error('La orden ya tiene un número generado y no se pueden agregar más productos');
    }
    
    const carritoActual = this.carritoSubject.value;
    const itemExistente = carritoActual.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      // Incrementar cantidad si ya existe
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * producto.precio;
      console.log(`📈 Cantidad aumentada a: ${itemExistente.cantidad}`);
      
      // Sincronizar con backend si hay detalleId
      if (itemExistente.detalleId) {
        await this.actualizarCantidadEnBackend(itemExistente.detalleId, itemExistente.cantidad);
      } else {
        // Si no tiene detalleId, crear uno nuevo
        await this.crearDetalleEnBackend(producto.id, itemExistente.cantidad);
      }

      // ACTUALIZAR STOCK EN BACKEND - DECREMENTAR
      await this.actualizarStockBackend(producto.id, -1);
      
      // 🔥 NOTIFICAR ACTUALIZACIÓN
      this.notificarProductoActualizado(producto.id);
    } else {
      // Agregar nuevo item
      const nuevoItem: ItemCarrito = {
        producto: producto,
        cantidad: 1,
        subtotal: producto.precio
      };
      carritoActual.push(nuevoItem);
      console.log('🆕 Nuevo producto agregado al carrito');
      
      // Crear detalle en backend
      await this.crearDetalleEnBackend(producto.id, 1);

      // ACTUALIZAR STOCK EN BACKEND - DECREMENTAR
      await this.actualizarStockBackend(producto.id, -1);
      
      // 🔥 NOTIFICAR ACTUALIZACIÓN
      this.notificarProductoActualizado(producto.id);
    }

    this.actualizarCarrito(carritoActual);
  }

  // 🔹 ELIMINAR PRODUCTO DEL CARRITO (LOCAL Y BACKEND) - CORREGIDO
  async eliminarProducto(productoId: number): Promise<void> {
    console.log('🗑️ [CarritoService] Eliminando producto ID:', productoId);
    
    // Verificar si la orden permite modificaciones
    const puedeModificar = await this.puedeModificarCarrito();
    if (!puedeModificar) {
      console.warn('❌ No se puede eliminar producto: La orden no permite modificaciones');
      throw new Error('La orden ya tiene un número generado y no se pueden eliminar productos');
    }
    
    const carritoActual = this.carritoSubject.value;
    const itemAEliminar = carritoActual.find(item => item.producto.id === productoId);
    
    if (itemAEliminar) {
      // RESTAURAR STOCK EN BACKEND - INCREMENTAR
      await this.actualizarStockBackend(productoId, itemAEliminar.cantidad);

      // Eliminar del backend si tiene detalleId
      if (itemAEliminar.detalleId) {
        await this.eliminarDetalleEnBackend(itemAEliminar.detalleId);
      } else {
        // Si no tiene detalleId, eliminar por producto y orden
        await this.eliminarDetallePorProductoYOrden(productoId);
      }
      
      // 🔥 NOTIFICAR ACTUALIZACIÓN
      this.notificarProductoActualizado(productoId);
    }
    
    const nuevoCarrito = carritoActual.filter(item => item.producto.id !== productoId);
    this.actualizarCarrito(nuevoCarrito);
  }

  // 🔹 AJUSTAR CANTIDAD (LOCAL Y BACKEND) - CORREGIDO
  async ajustarCantidad(productoId: number, cambio: number): Promise<void> {
    console.log('⚖️ [CarritoService] Ajustando cantidad para producto ID:', productoId, 'Cambio:', cambio);
    
    // Verificar si la orden permite modificaciones
    const puedeModificar = await this.puedeModificarCarrito();
    if (!puedeModificar) {
      console.warn('❌ No se puede ajustar cantidad: La orden no permite modificaciones');
      throw new Error('La orden ya tiene un número generado y no se pueden modificar cantidades');
    }
    
    const carritoActual = this.carritoSubject.value;
    const item = carritoActual.find(item => item.producto.id === productoId);
    
    if (!item) {
      console.warn('❌ Producto no encontrado en carrito');
      return;
    }

    const cantidadAnterior = item.cantidad;

    if (cambio > 0) {
      // Aumentar cantidad
      item.cantidad++;
      item.subtotal = item.cantidad * item.producto.precio;
      console.log(`📈 Nueva cantidad: ${item.cantidad}`);
      
      // Sincronizar con backend
      if (item.detalleId) {
        await this.actualizarCantidadEnBackend(item.detalleId, item.cantidad);
      } else {
        await this.crearDetalleEnBackend(productoId, item.cantidad);
      }

      // ACTUALIZAR STOCK EN BACKEND - DECREMENTAR 1 UNIDAD
      await this.actualizarStockBackend(productoId, -1);
      
      // 🔥 NOTIFICAR ACTUALIZACIÓN
      this.notificarProductoActualizado(productoId);

    } else {
      // Disminuir cantidad
      if (item.cantidad > 1) {
        item.cantidad--;
        item.subtotal = item.cantidad * item.producto.precio;
        console.log(`📉 Nueva cantidad: ${item.cantidad}`);
        
        // Sincronizar con backend
        if (item.detalleId) {
          await this.actualizarCantidadEnBackend(item.detalleId, item.cantidad);
        } else {
          await this.crearDetalleEnBackend(productoId, item.cantidad);
        }

        // ACTUALIZAR STOCK EN BACKEND - INCREMENTAR 1 UNIDAD
        await this.actualizarStockBackend(productoId, 1);
        
        // 🔥 NOTIFICAR ACTUALIZACIÓN
        this.notificarProductoActualizado(productoId);

      } else {
        // Eliminar si la cantidad llega a 0
        await this.eliminarProducto(productoId);
        return;
      }
    }

    this.actualizarCarrito(carritoActual);
  }

  // 🔹 OBTENER CARRITO ACTUAL
  obtenerCarrito(): ItemCarrito[] {
    return this.carritoSubject.value;
  }

  // 🔹 VACIAR CARRITO (LOCAL Y BACKEND) - CORREGIDO
  async vaciarCarrito(): Promise<void> {
    console.log('🗑️ [CarritoService] Vaciando carrito completo');
    
    // Verificar si la orden permite modificaciones
    const puedeModificar = await this.puedeModificarCarrito();
    if (!puedeModificar) {
      console.warn('❌ No se puede vaciar carrito: La orden no permite modificaciones');
      throw new Error('La orden ya tiene un número generado y no se puede vaciar el carrito');
    }
    
    // RESTAURAR STOCK DE TODOS LOS PRODUCTOS
    const carritoActual = this.obtenerCarrito();
    for (const item of carritoActual) {
      try {
        await this.actualizarStockBackend(item.producto.id, item.cantidad);
        console.log(`🔄 Stock restaurado para: ${item.producto.nombre}`);
        
        // 🔥 NOTIFICAR ACTUALIZACIÓN
        this.notificarProductoActualizado(item.producto.id);
      } catch (error) {
        console.error(`❌ Error restaurando stock para ${item.producto.nombre}:`, error);
      }
    }

    // Obtener orden actual para eliminar todos los detalles
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (ordenId) {
      try {
        // Obtener todos los detalles de la orden y eliminarlos uno por uno
        const detalles = await firstValueFrom(
          this.detalleOrdenService.obtenerDetallesPorOrden(ordenId)
        );
        
        for (const detalle of detalles) {
          await firstValueFrom(
            this.detalleOrdenService.eliminarDetalle(detalle.id)
          );
          console.log(`🗑️ Detalle ${detalle.id} eliminado del backend`);
        }
      } catch (error) {
        console.error('❌ Error eliminando detalles del backend:', error);
      }
    }
    
    this.actualizarCarrito([]);
  }

  // 🔹 OBTENER TOTAL DEL CARRITO
  obtenerTotal(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.subtotal, 0);
  }

  // 🔹 OBTENER CANTIDAD TOTAL DE ITEMS
  obtenerCantidadTotal(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }

  // 🔹 SINCRONIZAR CARRITO COMPLETO CON BACKEND - CORREGIDO
  async sincronizarCarritoCompleto(): Promise<boolean> {
    console.log('🔄 [CarritoService] Sincronizando carrito completo con backend...');
    
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) {
      console.error('❌ No hay orden actual para sincronizar');
      return false;
    }

    try {
      // 🔥 NUEVO: Verificar el estado de la orden antes de sincronizar - CORREGIDO
      // ✅ CORREGIDO: Usar obtenerOrdenPorId en lugar de obtenerOrden
      const orden = await firstValueFrom(
        this.ordenVentaService.obtenerOrdenPorId(ordenId)
      );

      // Estados que permiten modificación de detalles
      const estadosModificables = ['PENDIENTE', 'AGREGANDOPRODUCTOS'];
      
      if (!estadosModificables.includes(orden.estado)) {
        console.warn(`⚠️ La orden está en estado ${orden.estado}, no se pueden modificar detalles`);
        console.log('ℹ️ Solo se pueden sincronizar órdenes en estado PENDIENTE o AGREGANDOPRODUCTOS');
        return false;
      }

      console.log(`✅ Orden en estado ${orden.estado}, procediendo con sincronización...`);

    } catch (error) {
      console.error('❌ Error verificando estado de la orden:', error);
      return false;
    }

    const carrito = this.obtenerCarrito();
    let todosExitosos = true;

    for (const item of carrito) {
      try {
        // Si ya tiene detalleId, actualizar cantidad
        if (item.detalleId) {
          await this.actualizarCantidadEnBackend(item.detalleId, item.cantidad);
        } else {
          // Si no tiene detalleId, crear nuevo detalle
          await this.crearDetalleEnBackend(item.producto.id, item.cantidad);
        }
        console.log(`✅ Producto sincronizado: ${item.producto.nombre}`);
        
      } catch (error) {
        console.error(`❌ Error sincronizando producto ${item.producto.nombre}:`, error);
        todosExitosos = false;
      }
    }

    if (todosExitosos) {
      console.log('🎉 Todos los productos sincronizados exitosamente');
    } else {
      console.warn('⚠️ Algunos productos no se pudieron sincronizar');
    }

    return todosExitosos;
  }

  // 🔹 CARGAR CARRITO DESDE BACKEND
  async cargarCarritoDesdeBackend(): Promise<void> {
    console.log('📥 [CarritoService] Cargando carrito desde backend...');
    
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) {
      console.log('ℹ️ No hay orden actual, carrito vacío');
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
      console.log(`✅ Carrito cargado desde backend: ${carrito.length} productos`);
      
    } catch (error) {
      console.error('❌ Error cargando carrito desde backend:', error);
      this.actualizarCarrito([]);
    }
  }

  // ========== MÉTODO PARA ACTUALIZAR STOCK ==========

  /**
   * Actualiza el stock en el backend cuando se modifica el carrito
   * @param productoId ID del producto
   * @param cambio Cantidad a cambiar (positivo para incrementar, negativo para decrementar)
   */
  private async actualizarStockBackend(productoId: number, cambio: number): Promise<void> {
    try {
      if (cambio > 0) {
        // Incrementar stock (devolver productos al inventario)
        await firstValueFrom(
          this.productoService.incrementarStock(productoId, cambio)
        );
        console.log(`📦 Stock incrementado en ${cambio} unidades para producto ${productoId}`);
      } else if (cambio < 0) {
        // Decrementar stock (reservar productos del inventario)
        const cantidad = Math.abs(cambio);
        await firstValueFrom(
          this.productoService.decrementarStock(productoId, cantidad)
        );
        console.log(`📦 Stock decrementado en ${cantidad} unidades para producto ${productoId}`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando stock para producto ${productoId}:`, error);
      throw error;
    }
  }

  // ========== MÉTODOS PRIVADOS PARA COMUNICACIÓN CON BACKEND ==========

  private async crearDetalleEnBackend(productoId: number, cantidad: number): Promise<void> {
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) {
      console.warn('⚠️ No hay orden actual, no se puede crear detalle en backend');
      return;
    }

    try {
      const detalleDto: CreateDetalleOrdenDto = {
        productoId: productoId,
        cantidad: cantidad
      };

      const detalleCreado = await firstValueFrom(
        this.detalleOrdenService.crearDetalleOrden(ordenId, detalleDto)
      );

      console.log(`✅ Detalle creado en backend: ${detalleCreado.id}`);

      // Actualizar el item del carrito con el detalleId
      const carritoActual = this.carritoSubject.value;
      const item = carritoActual.find(item => item.producto.id === productoId);
      if (item) {
        item.detalleId = detalleCreado.id;
        this.actualizarCarrito(carritoActual);
      }
      
    } catch (error) {
      console.error(`❌ Error creando detalle en backend para producto ${productoId}:`, error);
      throw error;
    }
  }

  private async actualizarCantidadEnBackend(detalleId: number, cantidad: number): Promise<void> {
    try {
      await firstValueFrom(
        this.detalleOrdenService.actualizarCantidad(detalleId, cantidad)
      );
      console.log(`✅ Cantidad actualizada en backend para detalle ${detalleId}: ${cantidad}`);
    } catch (error) {
      console.error(`❌ Error actualizando cantidad en backend para detalle ${detalleId}:`, error);
      throw error;
    }
  }

  private async eliminarDetalleEnBackend(detalleId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.detalleOrdenService.eliminarDetalle(detalleId)
      );
      console.log(`✅ Detalle ${detalleId} eliminado del backend`);
    } catch (error) {
      console.error(`❌ Error eliminando detalle ${detalleId} del backend:`, error);
      throw error;
    }
  }

  private async eliminarDetallePorProductoYOrden(productoId: number): Promise<void> {
    const ordenId = this.ordenVentaService.obtenerOrdenActualId();
    if (!ordenId) {
      console.warn('⚠️ No hay orden actual, no se puede eliminar detalle en backend');
      return;
    }

    try {
      const request: EliminarDetalleRequest = {
        productoId: productoId,
        ordenVentaId: ordenId
      };

      await firstValueFrom(
        this.detalleOrdenService.eliminarDetallePorProductoYOrden(request)
      );
      console.log(`✅ Detalle eliminado del backend por producto ${productoId} y orden ${ordenId}`);
    } catch (error) {
      console.error(`❌ Error eliminando detalle por producto ${productoId}:`, error);
      throw error;
    }
  }

  // ========== MÉTODOS PRIVADOS PARA GESTIÓN LOCAL ==========

  private actualizarCarrito(nuevoCarrito: ItemCarrito[]): void {
    this.carritoSubject.next(nuevoCarrito);
    this.guardarEnLocalStorage(nuevoCarrito);
    console.log('💾 Carrito actualizado:', nuevoCarrito.length, 'productos');
  }

  private guardarEnLocalStorage(carrito: ItemCarrito[]): void {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }

  private cargarCarritoDesdeLocalStorage(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        const carrito = JSON.parse(carritoGuardado);
        this.carritoSubject.next(carrito);
        console.log('📂 Carrito cargado desde localStorage:', carrito.length, 'productos');
      } catch (error) {
        console.error('❌ Error cargando carrito desde localStorage:', error);
        this.actualizarCarrito([]);
      }
    }
  }
}