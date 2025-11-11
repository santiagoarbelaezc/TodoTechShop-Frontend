// src/app/services/producto.service.spec.ts
import { TestBed } from '@angular/core/testing';

import { ProductoService } from './producto.service';
import { ProductoDto } from '../models/producto/producto.dto';
import { EstadoProducto } from '../models/enums/estado-producto.enum';
import { environment } from '../../environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  const mockProducto: ProductoDto = {
    id: 1,
    nombre: 'Producto Test',
    codigo: 'PROD001',
    descripcion: 'Descripción test',
    categoria: {
      id: 1,
      nombre: 'Electrónicos'
    },
    precio: 100,
    stock: 10,
    imagenUrl: 'imagen.jpg',
    marca: 'Marca Test',
    garantia: 12,
    estado: EstadoProducto.ACTIVO
  };

  const mockMensaje = {
    error: false,
    data: 'Operación exitosa',
    mensaje: 'Success'
  };

  const mockMensajeProductos = {
    error: false,
    data: [mockProducto],
    mensaje: 'Success'
  };

  const mockMensajeProducto = {
    error: false,
    data: mockProducto,
    mensaje: 'Success'
  };

  const mockStockResponse = {
    error: false,
    data: { stock: 10 },
    mensaje: 'Success'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductoService]
    });

    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string): string => {
      return store[key] || '';
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): void => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake((): void => {
      store = {};
    });
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Configuración inicial', () => {
    it('debería crearse correctamente', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Gestión de producto seleccionado', () => {
    it('debería seleccionar y obtener producto', () => {
      service.seleccionarProducto(mockProducto);
      
      const productoSeleccionado = service.obtenerProductoSeleccionado();
      expect(productoSeleccionado).toEqual(mockProducto);
    });

    it('debería limpiar selección', () => {
      service.seleccionarProducto(mockProducto);
      service.limpiarSeleccion();
      
      const productoSeleccionado = service.obtenerProductoSeleccionado();
      expect(productoSeleccionado).toBeNull();
    });

    it('debería emitir cambios en el observable', (done) => {
      service.productoSeleccionado$.subscribe(producto => {
        if (producto) {
          expect(producto).toEqual(mockProducto);
          done();
        }
      });

      service.seleccionarProducto(mockProducto);
    });
  });

  describe('Métodos CRUD', () => {
    it('debería crear producto exitosamente', () => {
      service.crearProducto(mockProducto).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProducto);
      req.flush(mockMensaje);
    });

    it('debería actualizar producto exitosamente', () => {
      service.actualizarProducto(1, mockProducto).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockProducto);
      req.flush(mockMensaje);
    });

    it('debería obtener todos los productos exitosamente', () => {
      service.obtenerTodosLosProductos().subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería eliminar producto exitosamente', () => {
      service.eliminarProducto(1).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockMensaje);
    });

    it('debería cambiar estado de producto exitosamente', () => {
      service.cambiarEstadoProducto(1).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1/estado`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockMensaje);
    });
  });

  describe('Búsquedas y filtros', () => {
    it('debería obtener producto por ID exitosamente', () => {
      service.obtenerProductoPorId(1).subscribe(producto => {
        expect(producto).toEqual(mockProducto);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProducto);
    });

    it('debería obtener producto por código exitosamente', () => {
      service.obtenerProductoPorCodigo('PROD001').subscribe(producto => {
        expect(producto).toEqual(mockProducto);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/codigo/PROD001`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProducto);
    });

    it('debería obtener productos por estado exitosamente', () => {
      service.obtenerProductoPorEstado(EstadoProducto.ACTIVO).subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/estado/ACTIVO`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería obtener productos por categoría exitosamente', () => {
      service.obtenerProductoPorCategoria(1).subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/categoria/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería buscar productos por nombre exitosamente', () => {
      service.buscarProductosPorNombre('Test').subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/buscar?nombre=Test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });
  });

  describe('Gestión de stock', () => {
    it('debería incrementar stock exitosamente', () => {
      service.incrementarStock(1, 5).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1/stock/incrementar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ cantidad: 5 });
      req.flush(mockMensaje);
    });

    it('debería decrementar stock exitosamente', () => {
      service.decrementarStock(1, 3).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1/stock/decrementar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ cantidad: 3 });
      req.flush(mockMensaje);
    });

    it('debería establecer stock exitosamente', () => {
      service.establecerStock(1, 20).subscribe(response => {
        expect(response).toEqual(mockMensaje);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1/stock`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ cantidad: 20 });
      req.flush(mockMensaje);
    });

    it('debería consultar stock exitosamente', () => {
      service.consultarStock(1).subscribe(response => {
        expect(response.stock).toBe(10);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1/stock`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStockResponse);
    });

    it('debería obtener stock actual exitosamente', () => {
      service.obtenerStockActual(1).subscribe(stock => {
        expect(stock).toBe(10);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/1/stock`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStockResponse);
    });
  });

  describe('Métodos públicos (sin autenticación)', () => {
    it('debería obtener todos los productos públicos exitosamente', () => {
      service.obtenerTodosLosProductosPublicos().subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/publicos/todos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería obtener productos activos públicos exitosamente', () => {
      service.obtenerProductosActivosPublicos().subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/publicos/activos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería obtener productos disponibles públicos exitosamente', () => {
      service.obtenerProductosDisponiblesPublicos().subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/publicos/disponibles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería obtener productos por categoría pública exitosamente', () => {
      service.obtenerProductoPorCategoriaPublico(1).subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/publicos/categoria/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería buscar productos por nombre público exitosamente', () => {
      service.buscarProductosPorNombrePublico('Test').subscribe(productos => {
        expect(productos).toEqual([mockProducto]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/publicos/buscar?nombre=Test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProductos);
    });

    it('debería obtener producto por ID público exitosamente', () => {
      service.obtenerProductoPorIdPublico(1).subscribe(producto => {
        expect(producto).toEqual(mockProducto);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos/publicos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMensajeProducto);
    });
  });

  describe('Headers y autenticación', () => {
    it('debería incluir token en headers cuando existe', () => {
      localStorage.setItem('authToken', 'test-token');

      service.obtenerTodosLosProductos().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/productos`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockMensajeProductos);
    });

    it('debería no incluir Authorization cuando no hay token', () => {
      localStorage.removeItem('authToken');

      service.obtenerTodosLosProductos().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/productos`);
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush(mockMensajeProductos);
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar error en obtener productos', () => {
      service.obtenerTodosLosProductos().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/productos`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});