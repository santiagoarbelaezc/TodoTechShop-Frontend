// src/app/services/carrito.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CarritoService } from './carrito.service';
import { DetalleOrdenService } from './detalle-orden.service';
import { OrdenVentaService } from './orden-venta.service';

class MockDetalleOrdenService {
  obtenerDetallesPorOrden = jasmine.createSpy().and.returnValue(of([]));
  crearDetalleOrden = jasmine.createSpy().and.returnValue(of({ id: 1 }));
  actualizarCantidad = jasmine.createSpy().and.returnValue(of({}));
  eliminarDetalle = jasmine.createSpy().and.returnValue(of({}));
  eliminarDetallePorProductoYOrden = jasmine.createSpy().and.returnValue(of({}));
}

class MockOrdenVentaService {
  obtenerOrdenActualId = jasmine.createSpy().and.returnValue(1);
  obtenerOrdenPorId = jasmine.createSpy().and.returnValue(of({ id: 1, estado: 'PENDIENTE', total: 100 }));
}

describe('CarritoService', () => {
  let service: CarritoService;

  const mockProducto = { id: 1, nombre: 'Producto Test', precio: 100 };
  const mockProducto2 = { id: 2, nombre: 'Producto Test 2', precio: 200 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CarritoService,
        { provide: DetalleOrdenService, useClass: MockDetalleOrdenService },
        { provide: OrdenVentaService, useClass: MockOrdenVentaService }
      ]
    });

    service = TestBed.inject(CarritoService);
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería agregar producto al carrito', async () => {
    const resultado = await service.agregarProducto(mockProducto as any);
    expect(resultado.exito).toBeTrue();
  });

  it('debería eliminar producto del carrito', async () => {
    await service.agregarProducto(mockProducto as any);
    const resultado = await service.eliminarProducto(1);
    expect(resultado.exito).toBeTrue();
  });

  it('debería calcular total', async () => {
    await service.agregarProducto(mockProducto as any);
    await service.agregarProducto(mockProducto2 as any);
    const total = service.obtenerTotal();
    expect(total).toBeGreaterThan(0);
  });

  it('debería verificar si producto está en carrito', async () => {
    await service.agregarProducto(mockProducto as any);
    expect(service.estaEnCarrito(1)).toBeTrue();
  });

  it('debería ajustar cantidad', async () => {
    await service.agregarProducto(mockProducto as any);
    const resultado = await service.ajustarCantidad(1, 1);
    expect(resultado.exito).toBeTrue();
  });

  it('debería vaciar carrito', async () => {
    await service.agregarProducto(mockProducto as any);
    const resultado = await service.vaciarCarrito();
    expect(resultado.exito).toBeTrue();
  });

  it('debería cargar desde backend', async () => {
    const mockDetalles = [{ id: 1, producto: mockProducto, cantidad: 2, subtotal: 200 }];
    const detalleService = TestBed.inject(DetalleOrdenService) as any;
    detalleService.obtenerDetallesPorOrden.and.returnValue(of(mockDetalles));
    
    await service.cargarCarritoDesdeBackend();
    expect(service.obtenerCarrito().length).toBeGreaterThan(0);
  });
});