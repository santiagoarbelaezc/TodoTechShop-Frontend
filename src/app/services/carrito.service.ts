import { Injectable } from '@angular/core';
import { DetalleOrdenService } from './detalle-orden.service';
import { ProductoService } from './producto.service';
import { OrdenVentaService } from './orden-venta.service';
import { ProductoDTO } from '../models/producto/producto.dto';
import { DetalleOrdenDTO } from '../models/detalle-orden.dto';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carritoSubject = new BehaviorSubject<{ detalle: DetalleOrdenDTO, nombreProducto: string }[]>([]);
carrito$ = this.carritoSubject.asObservable();

  constructor(
    private detalleOrdenService: DetalleOrdenService,
    private productoService: ProductoService,
    private ordenVentaService: OrdenVentaService
  ) {}

  agregarAlCarrito(producto: ProductoDTO): Observable<boolean> {
    const ordenVenta = this.ordenVentaService.getOrden();
  
    if (!ordenVenta) {
      console.error('No hay una orden de venta activa');
      return of(false);
    }
  
    const request = { producto, ordenVentaId: ordenVenta.id };
  
    return new Observable<boolean>(observer => {
      this.detalleOrdenService.crearDetalle(request).subscribe({
        next: (detalleOrden) => {
          console.log('Detalle de orden creado:', detalleOrden);
          this.detalleOrdenService.obtenerCarritoConProductos(ordenVenta.id).subscribe({
            next: detalles => {
              const carritoSimplificado = detalles.map(d => ({
                detalle: d.detalle,
                nombreProducto: (d as any)?.producto?.nombre || 'Sin nombre'
              }));
              this.carritoSubject.next(carritoSimplificado);
              observer.next(true);
              observer.complete();
            },          
            error: err => {
              console.error('Error al obtener detalles luego de agregar:', err);
              observer.error(err);
            }
          });
        },
        error: err => {
          console.error('Error al crear detalle de orden:', err);
          observer.error(err);
        }
      });
    });
  }
  

  obtenerCarrito(): { detalle: DetalleOrdenDTO, producto: ProductoDTO }[] {
    return this.carritoSubject.getValue().map(item => ({
      detalle: item.detalle,
      producto: { nombre: item.nombreProducto } as ProductoDTO
    }));
  }
}