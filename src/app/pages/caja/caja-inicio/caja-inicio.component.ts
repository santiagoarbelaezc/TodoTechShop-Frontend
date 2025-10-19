import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


// Enums y modelos (debes crear estos según tu backend)
enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO'
}

enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  AGREGANDOPRODUCTOS = 'AGREGANDOPRODUCTOS',
  DISPONIBLEPARAPAGO = 'DISPONIBLEPARAPAGO',
  PAGADA = 'PAGADA',
  ENTREGADA = 'ENTREGADA',
  CERRADA = 'CERRADA'
}

interface ClienteDto {
  id: number;
  nombre: string;
  cedula: string;
  tipoCliente: string;
}

interface VendedorDto {
  id: number;
  nombre: string;
  email: string;
}

interface ProductoDetalleDto {
  producto: {
    id: number;
    nombre: string;
    codigo: string;
    marca: string;
    categoria: {
      id: number;
      nombre: string;
    };
  };
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface OrdenConDetallesDto {
  id: number;
  numeroOrden: string;
  fecha: string;
  estado: EstadoOrden;
  cliente: ClienteDto;
  vendedor: VendedorDto;
  productos: ProductoDetalleDto[];
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  observaciones?: string;
}

interface MetodoPagoDto {
  id: number;
  nombre: string;
  descripcion: string;
}

interface PagoDto {
  id?: number;
  ordenVentaId: number;
  monto: number;
  metodoPagoId: number;
  numeroTransaccion: string;
  fechaPago?: string;
  usuarioId: number;
  comprobante: string;
  estadoPago: EstadoPago;
}

@Component({
  selector: 'app-caja-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja-inicio.component.html',
  styleUrls: ['./caja-inicio.component.css']
})
export class CajaInicioComponent implements OnInit {
  
  // Variables de estado
  seccionActiva: string = 'caja';
  
  // Búsqueda de orden
  numeroOrdenBusqueda: string = '';
  ordenEncontrada: OrdenConDetallesDto | null = null;
  buscandoOrden: boolean = false;
  mensajeBusqueda: string = '';
  busquedaExito: boolean = false;

  // Datos de pago
  pago: PagoDto = this.inicializarPago();
  efectivoRecibido: number = 0;
  cambio: number = 0;
  datosTarjeta: any = {
    numero: '',
    vencimiento: '',
    cvv: ''
  };
  procesandoPago: boolean = false;

  // Métodos de pago disponibles
  metodosPago: MetodoPagoDto[] = [
    { id: 1, nombre: 'Efectivo', descripcion: 'Pago en efectivo' },
    { id: 2, nombre: 'Tarjeta', descripcion: 'Pago con tarjeta débito/crédito' },
    { id: 3, nombre: 'Transferencia', descripcion: 'Transferencia bancaria' }
  ];

  // Estadísticas
  totalTransaccionesHoy: number = 0;
  totalRecaudadoHoy: number = 0;
  ordenesPendientes: number = 0;

  // Historial de pagos
  pagosFiltrados: PagoDto[] = [];
  filtroNumeroOrden: string = '';
  filtroMetodoPago: number = 0;
  filtroEstado: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarHistorialPagos();
  }

  // Inicialización
  private inicializarPago(): PagoDto {
    return {
      ordenVentaId: 0,
      monto: 0,
      metodoPagoId: 0,
      numeroTransaccion: '',
      usuarioId: 1, // Esto debería venir del usuario autenticado
      comprobante: '',
      estadoPago: EstadoPago.PENDIENTE
    };
  }

  // Navegación
  mostrarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    if (seccion === 'historialPagos') {
      this.cargarHistorialPagos();
    }
  }

  // Búsqueda de orden
  buscarOrden(): void {
    if (!this.numeroOrdenBusqueda.trim()) {
      this.mostrarMensaje('Ingrese un número de orden válido', false);
      return;
    }

    this.buscandoOrden = true;
    this.mensajeBusqueda = '';

    // Simulación de búsqueda - reemplazar con servicio real
    setTimeout(() => {
      // Aquí iría la llamada al servicio real
      // this.ordenService.buscarPorNumero(this.numeroOrdenBusqueda).subscribe(...)
      
      // Datos de ejemplo para demostración
      const ordenEjemplo: OrdenConDetallesDto = {
        id: 1,
        numeroOrden: this.numeroOrdenBusqueda,
        fecha: new Date().toISOString(),
        estado: EstadoOrden.DISPONIBLEPARAPAGO,
        cliente: {
          id: 1,
          nombre: 'Juan Pérez',
          cedula: '123456789',
          tipoCliente: 'NATURAL'
        },
        vendedor: {
          id: 1,
          nombre: 'María García',
          email: 'maria@todotech.com'
        },
        productos: [
          {
            producto: {
              id: 1,
              nombre: 'Laptop Gaming',
              codigo: 'LTG-001',
              marca: 'ASUS',
              categoria: { id: 1, nombre: 'Computación' }
            },
            cantidad: 1,
            precioUnitario: 2500000,
            subtotal: 2500000
          },
          {
            producto: {
              id: 2,
              nombre: 'Mouse Inalámbrico',
              codigo: 'MS-002',
              marca: 'Logitech',
              categoria: { id: 2, nombre: 'Accesorios' }
            },
            cantidad: 2,
            precioUnitario: 80000,
            subtotal: 160000
          }
        ],
        subtotal: 2660000,
        descuento: 0,
        impuestos: 79800,
        total: 2739800
      };

      this.ordenEncontrada = ordenEjemplo;
      this.pago.ordenVentaId = ordenEjemplo.id;
      this.pago.monto = ordenEjemplo.total;
      
      this.buscandoOrden = false;
      this.mostrarMensaje(`Orden ${this.numeroOrdenBusqueda} encontrada`, true);
    }, 1000);
  }

  private mostrarMensaje(mensaje: string, exito: boolean): void {
    this.mensajeBusqueda = mensaje;
    this.busquedaExito = exito;
    
    setTimeout(() => {
      this.mensajeBusqueda = '';
    }, 5000);
  }

  // Procesamiento de pagos
  onMetodoPagoChange(): void {
    this.calcularCambio();
  }

  calcularCambio(): void {
    if (this.pago.metodoPagoId === 1 && this.efectivoRecibido > 0) {
      this.cambio = this.efectivoRecibido - (this.pago.monto || 0);
    } else {
      this.cambio = 0;
    }
  }

  procesarPago(): void {
    if (!this.ordenEncontrada) return;

    this.procesandoPago = true;

    // Validaciones adicionales
    if (this.pago.metodoPagoId === 1 && this.efectivoRecibido < this.pago.monto) {
      this.mostrarMensaje('El efectivo recibido es insuficiente', false);
      this.procesandoPago = false;
      return;
    }

    // Simulación de procesamiento de pago - reemplazar con servicio real
    setTimeout(() => {
      // Aquí iría la llamada al servicio real
      // this.pagoService.registrarPago(this.pago).subscribe(...)
      
      this.procesandoPago = false;
      this.mostrarMensaje('Pago procesado exitosamente', true);
      
      // Generar comprobante
      this.generarComprobante();
      
      // Limpiar formulario
      this.limpiarFormulario();
    }, 2000);
  }

  generarComprobante(): void {
    if (!this.ordenEncontrada) return;

    const contenidoComprobante = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante de Pago - ${this.ordenEncontrada.numeroOrden}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 15px; }
          .total { font-weight: bold; font-size: 1.2em; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.8em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>TODOTECH - Comprobante de Pago</h2>
        </div>
        <div class="info">
          <p><strong>Orden:</strong> ${this.ordenEncontrada.numeroOrden}</p>
          <p><strong>Cliente:</strong> ${this.ordenEncontrada.cliente.nombre}</p>
          <p><strong>Método de Pago:</strong> ${this.obtenerNombreMetodoPago(this.pago.metodoPagoId)}</p>
          <p><strong>Monto:</strong> ${this.formatearMoneda(this.pago.monto)}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
        </div>
        <div class="footer">
          <p>¡Gracias por su compra!</p>
        </div>
      </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoComprobante);
      ventanaImpresion.document.close();
      ventanaImpresion.print();
    }
  }

  cancelarPago(): void {
    this.limpiarFormulario();
    this.mostrarMensaje('Pago cancelado', false);
  }

  limpiarFormulario(): void {
    this.ordenEncontrada = null;
    this.pago = this.inicializarPago();
    this.efectivoRecibido = 0;
    this.cambio = 0;
    this.datosTarjeta = { numero: '', vencimiento: '', cvv: '' };
    this.numeroOrdenBusqueda = '';
  }

  // Historial de pagos
  cargarHistorialPagos(): void {
    // Simulación de carga de historial - reemplazar con servicio real
    this.pagosFiltrados = [
      {
        id: 1,
        ordenVentaId: 1001,
        monto: 2739800,
        metodoPagoId: 2,
        numeroTransaccion: 'TXN-001',
        fechaPago: new Date().toISOString(),
        usuarioId: 1,
        comprobante: '',
        estadoPago: EstadoPago.COMPLETADO
      }
    ];
  }

  aplicarFiltros(): void {
    // Implementar lógica de filtrado
    this.cargarHistorialPagos(); // Simulación
  }

  limpiarFiltros(): void {
    this.filtroNumeroOrden = '';
    this.filtroMetodoPago = 0;
    this.filtroEstado = '';
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.cargarHistorialPagos();
  }

  exportarHistorial(): void {
    // Implementar exportación a Excel/PDF
    alert('Funcionalidad de exportación en desarrollo');
  }

  verDetallePago(pago: PagoDto): void {
    // Implementar vista de detalle
    alert(`Detalles del pago ${pago.id} - Orden ${pago.ordenVentaId}`);
  }

  reimprimirComprobante(pago: PagoDto): void {
    // Implementar reimpresión de comprobante
    alert(`Reimprimiendo comprobante para pago ${pago.id}`);
  }

  // Utilidades
  cargarEstadisticas(): void {
    // Simulación de estadísticas - reemplazar con servicio real
    this.totalTransaccionesHoy = 15;
    this.totalRecaudadoHoy = 12500000;
    this.ordenesPendientes = 3;
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }

  obtenerNombreMetodoPago(metodoId: number): string {
    const metodo = this.metodosPago.find(m => m.id === metodoId);
    return metodo ? metodo.nombre : 'Desconocido';
  }
}