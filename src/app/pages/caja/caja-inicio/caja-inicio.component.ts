import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  EstadoOrden, 
  OrdenConDetallesDto, 
  OrdenDto
} from '../../../models/orden-venta/ordenventa.dto';
import { ClienteDto } from '../../../models/cliente.dto';
import { UsuarioDto } from '../../../models/usuario/usuario.dto';
import { DetalleOrdenDto } from '../../../models/detalle-orden/detalle-orden.dto';
import { LoginResponse } from '../../../models/login-response.dto';
import { OrdenVentaService } from '../../../services/orden-venta.service';
import { AuthService } from '../../../services/auth.service';
import { catchError, finalize, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

// Enums locales
enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO'
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
  
  // Servicios
  private ordenVentaService = inject(OrdenVentaService);
  private authService = inject(AuthService);
  private router = inject(Router);

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

  // Estadísticas (calculadas localmente)
  totalTransaccionesHoy: number = 0;
  totalRecaudadoHoy: number = 0;
  ordenesPendientes: number = 0;
  ordenesDisponiblesPago: number = 0;

  // Historial de pagos
  pagosFiltrados: PagoDto[] = [];
  filtroNumeroOrden: string = '';
  filtroMetodoPago: number = 0;
  filtroEstado: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  // Usuario autenticado
  usuarioActual: LoginResponse | null = null;

  // Lista de órdenes para búsqueda
  private todasLasOrdenes: OrdenDto[] = [];

  ngOnInit(): void {
    this.cargarUsuarioActual();
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
      usuarioId: this.usuarioActual?.userId || 1,
      comprobante: '',
      estadoPago: EstadoPago.PENDIENTE
    };
  }

  private cargarUsuarioActual(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioActual = user;
      this.pago.usuarioId = user.userId;
    } else {
      // Usuario por defecto para desarrollo
      this.usuarioActual = { 
        token: 'dev-token',
        tokenType: 'Bearer',
        userId: 1,
        username: 'cajero',
        nombre: 'Usuario Sistema',
        role: 'CAJERO',
        mensaje: 'Usuario de desarrollo'
      };
      this.pago.usuarioId = 1;
    }
  }

  // Navegación
  mostrarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    if (seccion === 'historialPagos') {
      this.cargarHistorialPagos();
    } else if (seccion === 'caja') {
      this.limpiarFormulario();
    }
  }

  // Búsqueda de orden - CON SERVICIO REAL
  buscarOrden(): void {
    if (!this.numeroOrdenBusqueda.trim()) {
      this.mostrarMensaje('Ingrese un número de orden válido', false);
      return;
    }

    this.buscandoOrden = true;
    this.mensajeBusqueda = 'Buscando orden...';
    this.busquedaExito = false;

    // Primero cargar todas las órdenes para buscar
    this.ordenVentaService.obtenerTodasLasOrdenes().pipe(
      map(ordenes => {
        this.todasLasOrdenes = ordenes;
        
        // Buscar la orden por número
        const ordenEncontrada = ordenes.find(orden => 
          orden.numeroOrden.toLowerCase().includes(this.numeroOrdenBusqueda.toLowerCase()) ||
          orden.numeroOrden === this.numeroOrdenBusqueda
        );

        if (!ordenEncontrada) {
          throw new Error('Orden no encontrada');
        }

        return ordenEncontrada;
      }),
      catchError(error => {
        this.mostrarMensaje(error.message || 'Error al buscar la orden', false);
        return of(null);
      }),
      finalize(() => {
        this.buscandoOrden = false;
      })
    ).subscribe({
      next: (orden) => {
        if (orden) {
          // Si encontramos la orden básica, cargar los detalles completos
          this.cargarDetallesOrden(orden.id);
        }
      }
    });
  }

  private cargarDetallesOrden(ordenId: number): void {
    this.ordenVentaService.obtenerOrdenConDetalles(ordenId).pipe(
      catchError(error => {
        this.mostrarMensaje('Error al cargar los detalles de la orden', false);
        return of(null);
      })
    ).subscribe({
      next: (ordenConDetalles) => {
        if (ordenConDetalles) {
          this.ordenEncontrada = ordenConDetalles;
          this.pago.ordenVentaId = ordenConDetalles.id;
          this.pago.monto = ordenConDetalles.total;
          
          if (ordenConDetalles.estado === EstadoOrden.DISPONIBLEPARAPAGO) {
            this.mostrarMensaje(`✅ Orden ${ordenConDetalles.numeroOrden} encontrada - Lista para pago`, true);
          } else {
            this.mostrarMensaje(`⚠️ Orden ${ordenConDetalles.numeroOrden} encontrada - Estado: ${ordenConDetalles.estado}`, false);
          }
        }
      }
    });
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

    if (!this.pago.numeroTransaccion && this.pago.metodoPagoId !== 1) {
      this.mostrarMensaje('El número de transacción/referencia es obligatorio', false);
      this.procesandoPago = false;
      return;
    }

    // Simulación de procesamiento de pago
    setTimeout(() => {
      // Aquí iría la llamada al servicio real de pagos
      console.log('Procesando pago:', this.pago);
      
      // Actualizar estado de la orden a PAGADA
      this.ordenVentaService.marcarComoPagada(this.ordenEncontrada!.id).pipe(
        catchError(error => {
          this.mostrarMensaje('Error al actualizar estado de la orden', false);
          return of(null);
        })
      ).subscribe({
        next: (ordenActualizada) => {
          this.procesandoPago = false;
          
          if (ordenActualizada) {
            this.mostrarMensaje('✅ Pago procesado exitosamente', true);
            this.generarComprobante();
            this.limpiarFormulario();
            this.cargarEstadisticas(); // Actualizar estadísticas
          }
        }
      });
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
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .info { margin-bottom: 15px; }
          .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
          .productos { margin: 20px 0; }
          .producto-item { display: flex; justify-content: space-between; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🏪 TODOTECH</h2>
          <h3>Comprobante de Pago</h3>
        </div>
        <div class="info">
          <p><strong>Orden:</strong> ${this.ordenEncontrada.numeroOrden}</p>
          <p><strong>Cliente:</strong> ${this.ordenEncontrada.cliente.nombre}</p>
          <p><strong>Documento:</strong> ${this.ordenEncontrada.cliente.cedula}</p>
          <p><strong>Método de Pago:</strong> ${this.obtenerNombreMetodoPago(this.pago.metodoPagoId)}</p>
          <p><strong>Transacción:</strong> ${this.pago.numeroTransaccion || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
          <p><strong>Cajero:</strong> ${this.usuarioActual?.nombre}</p>
        </div>
        
        <div class="productos">
          <h4>Productos:</h4>
          ${this.ordenEncontrada.productos.map((producto: any) => `
            <div class="producto-item">
              <span>${producto.producto.nombre} x${producto.cantidad}</span>
              <span>${this.formatearMoneda(producto.subtotal)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="total">
          <p><strong>Total Pagado:</strong> ${this.formatearMoneda(this.pago.monto)}</p>
          ${this.pago.metodoPagoId === 1 ? `
            <p><strong>Efectivo Recibido:</strong> ${this.formatearMoneda(this.efectivoRecibido)}</p>
            <p><strong>Cambio:</strong> ${this.formatearMoneda(this.cambio)}</p>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>¡Gracias por su compra!</p>
          <p>TodoTech - Sistema de Gestión Comercial</p>
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

  // Estadísticas (calculadas localmente)
  cargarEstadisticas(): void {
    this.ordenVentaService.obtenerTodasLasOrdenes().pipe(
      catchError(() => of([]))
    ).subscribe(ordenes => {
      const hoy = new Date().toDateString();
      
      // Calcular estadísticas
      this.ordenesDisponiblesPago = ordenes.filter(orden => 
        orden.estado === EstadoOrden.DISPONIBLEPARAPAGO
      ).length;
      
      this.ordenesPendientes = ordenes.filter(orden => 
        orden.estado === EstadoOrden.PENDIENTE
      ).length;
      
      // Simular transacciones de hoy (en un caso real vendría del backend)
      this.totalTransaccionesHoy = Math.floor(Math.random() * 20) + 5;
      this.totalRecaudadoHoy = this.totalTransaccionesHoy * 500000;
    });
  }

  // Historial de pagos
  cargarHistorialPagos(): void {
    // Simulación de historial - en un caso real vendría del backend
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
      },
      {
        id: 2,
        ordenVentaId: 1002,
        monto: 1500000,
        metodoPagoId: 1,
        numeroTransaccion: 'EF-001',
        fechaPago: new Date(Date.now() - 86400000).toISOString(),
        usuarioId: 1,
        comprobante: '',
        estadoPago: EstadoPago.COMPLETADO
      }
    ];
  }

  aplicarFiltros(): void {
    // Implementar lógica de filtrado básica
    this.cargarHistorialPagos(); // Por ahora recargamos todo
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
    // Implementar exportación básica
    const csvContent = this.convertToCSV(this.pagosFiltrados);
    this.descargarCSV(csvContent, 'historial_pagos.csv');
  }

  private convertToCSV(data: any[]): string {
    const headers = ['ID', 'Orden', 'Monto', 'Método', 'Transacción', 'Estado', 'Fecha'];
    const rows = data.map(pago => [
      pago.id,
      pago.ordenVentaId,
      this.formatearMoneda(pago.monto),
      this.obtenerNombreMetodoPago(pago.metodoPagoId),
      pago.numeroTransaccion,
      pago.estadoPago,
      this.formatearFechaCorta(pago.fechaPago || '')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private descargarCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  verDetallePago(pago: PagoDto): void {
    alert(`Detalles del pago:\n
ID: ${pago.id}
Orden: ${pago.ordenVentaId}
Monto: ${this.formatearMoneda(pago.monto)}
Método: ${this.obtenerNombreMetodoPago(pago.metodoPagoId)}
Transacción: ${pago.numeroTransaccion}
Estado: ${pago.estadoPago}
Fecha: ${this.formatearFecha(pago.fechaPago || '')}`);
  }

  reimprimirComprobante(pago: PagoDto): void {
    alert(`Reimprimiendo comprobante para pago ${pago.id}`);
    // Aquí iría la lógica para reimprimir el comprobante
  }

  // Utilidades
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

  // Método para buscar orden actual guardada
  buscarOrdenActual(): void {
    const ordenActual = this.ordenVentaService.obtenerOrdenActual();
    if (ordenActual) {
      this.numeroOrdenBusqueda = ordenActual.numeroOrden;
      this.buscarOrden();
    } else {
      this.mostrarMensaje('No hay orden actual guardada', false);
    }
  }

  // Método para obtener el nombre del usuario actual
  obtenerNombreUsuario(): string {
    return this.usuarioActual?.nombre || 'Cajero';
  }
}