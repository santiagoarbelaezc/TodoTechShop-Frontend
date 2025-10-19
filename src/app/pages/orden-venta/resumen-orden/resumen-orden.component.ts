import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdenVentaService } from '../../../services/orden-venta.service';
import { OrdenConDetallesDto, EstadoOrden, OrdenDto } from '../../../models/orden-venta/ordenventa.dto'; 

@Component({
  selector: 'app-resumen-orden',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-orden.component.html',
  styleUrls: ['./resumen-orden.component.css']
})
export class ResumenOrdenComponent implements OnInit {

  private ordenVentaService = inject(OrdenVentaService);
  private router = inject(Router);

  ordenActual: OrdenConDetallesDto | null = null;
  loading = true;
  error: string | null = null;
  mostrarModal = false;
  procesando = false;
  impresionCompletada = false;

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Resumen de Orden...');
    this.cargarOrdenActual();
  }

  private cargarOrdenActual(): void {
    this.loading = true;
    this.error = null;

    // Obtener la orden actual del servicio
    const orden = this.ordenVentaService.obtenerOrdenActual();
    
    if (!orden) {
      this.error = 'No hay una orden activa en el sistema.';
      this.loading = false;
      console.log('❌ No se encontró orden actual');
      return;
    }

    console.log('✅ Orden actual encontrada:', orden);

    // ✅ SIEMPRE cargar los detalles completos desde el backend
    this.cargarDetallesCompletos(orden.id);
  }

  private cargarDetallesCompletos(ordenId: number): void {
    this.ordenVentaService.obtenerOrdenConDetalles(ordenId).subscribe({
      next: (ordenConDetalles) => {
        this.ordenActual = ordenConDetalles;
        this.loading = false;
        console.log('✅ Detalles de orden cargados:', ordenConDetalles);
      },
      error: (err) => {
        console.error('❌ Error al cargar detalles de orden:', err);
        this.error = 'Error al cargar los detalles de la orden.';
        this.loading = false;
      }
    });
  }

  // Método para generar número de orden y marcar como disponible para pago
  generarNumero(): void {
    if (!this.ordenActual || !this.puedeGenerarNumero()) {
      return;
    }

    this.procesando = true;
    console.log('🔄 Generando número de orden y marcando como disponible para pago...');

    // Marcar la orden como disponible para pago
    this.ordenVentaService.marcarComoDisponibleParaPago(this.ordenActual.id).subscribe({
      next: (ordenActualizada) => {
        console.log('✅ Orden marcada como disponible para pago:', ordenActualizada);
        
        // ✅ ACTUALIZAR: Cargar los detalles completos después de generar el número
        this.ordenVentaService.obtenerOrdenConDetalles(this.ordenActual!.id).subscribe({
          next: (ordenConDetallesActualizada) => {
            this.ordenActual = ordenConDetallesActualizada;
            
            // Actualizar en el servicio y localStorage
            this.ordenVentaService.guardarOrdenActual(ordenConDetallesActualizada);
            
            this.procesando = false;
            this.mostrarModal = true;
            
            console.log('🎉 Número de orden generado:', this.ordenActual.numeroOrden);
          },
          error: (err) => {
            console.error('❌ Error al cargar detalles actualizados:', err);
            this.error = 'Error al cargar los detalles actualizados de la orden.';
            this.procesando = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al generar número de orden:', err);
        this.error = 'Error al generar el número de orden. Por favor, intente nuevamente.';
        this.procesando = false;
      }
    });
  }

  // Verificar si se puede generar el número de orden
  puedeGenerarNumero(): boolean {
    if (!this.ordenActual) return false;
    
    // Solo permitir si la orden está en estado PENDIENTE o AGREGANDOPRODUCTOS
    const estadosPermitidos = [EstadoOrden.PENDIENTE, EstadoOrden.AGREGANDOPRODUCTOS];
    return estadosPermitidos.includes(this.ordenActual.estado) && !this.procesando;
  }

  // ✅ MÉTODO ACTUALIZADO: Imprimir número de orden y luego limpiar
  imprimirNumeroOrden(): void {
    if (!this.ordenActual) return;

    const contenidoImpresion = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Número de Orden - ${this.ordenActual.numeroOrden}</title>
    <meta charset="UTF-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body { 
        font-family: 'Inter', Arial, sans-serif; 
        text-align: center; 
        padding: 20px;
        background: white;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .ticket-container {
        background: white;
        border-radius: 12px;
        padding: 30px 25px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 350px;
        border: 2px solid #e9ecef;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .logo {
        font-size: 18px;
        font-weight: 700;
        color: #1421cf;
        margin-bottom: 6px;
        letter-spacing: -0.5px;
      }
      
      .subtitle {
        font-size: 11px;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-bottom: 3px;
        font-weight: 500;
      }
      
      .title {
        font-size: 13px;
        font-weight: 600;
        color: #495057;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      
      .numero-orden { 
        font-size: 24px;
        font-weight: 700; 
        color: #1421cf;
        margin: 20px 0;
        padding: 15px 12px;
        border: 2px solid #1421cf;
        border-radius: 10px;
        display: inline-block;
        background: #f8f9ff;
        font-family: 'Courier New', monospace;
        letter-spacing: 1.5px;
        line-height: 1.2;
      }
      
      .barcode-container {
        margin: 20px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 1px solid #e9ecef;
      }
      
      .barcode {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1px;
        margin-bottom: 10px;
        padding: 10px;
        background: white;
        border-radius: 6px;
        border: 1px solid #dee2e6;
      }
      
      .barcode-line {
        height: 40px;
        background: #1a1a1a;
        border-radius: 1px;
        flex: 1;
        max-width: 2px;
        min-width: 1px;
      }
      
      .barcode-line:nth-child(odd) {
        height: 35px;
        background: #2c2c2c;
      }
      
      .barcode-line:nth-child(even) {
        height: 30px;
        background: #1a1a1a;
      }
      
      .barcode-line:nth-child(3n) {
        height: 40px;
        background: #000;
      }
      
      .barcode-line:nth-child(5n) {
        height: 25px;
        background: #333;
      }
      
      .barcode-number {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        font-weight: 600;
        color: #495057;
        letter-spacing: 4px;
        margin-top: 6px;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        margin: 20px 0;
        text-align: left;
      }
      
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f1f3f4;
      }
      
      .info-item:last-child {
        border-bottom: none;
      }
      
      .info-label {
        font-size: 12px;
        color: #6c757d;
        font-weight: 500;
      }
      
      .info-value {
        font-size: 12px;
        color: #1a1a1a;
        font-weight: 600;
        text-align: right;
      }
      
      .status-badge {
        display: inline-block;
        padding: 3px 8px;
        background: #e8f5e8;
        color: #2e7d32;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        border: 1px solid #c8e6c9;
      }
      
      .total-amount {
        font-size: 13px;
        color: #1421cf;
        font-weight: 700;
      }
      
      .footer {
        margin-top: 25px;
        padding-top: 15px;
        border-top: 1px solid #e9ecef;
      }
      
      .footer-text {
        font-size: 10px;
        color: #6c757d;
        line-height: 1.3;
        margin-bottom: 6px;
      }
      
      .print-date {
        font-size: 9px;
        color: #adb5bd;
        font-family: 'Courier New', monospace;
      }
      
      .decoration-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, #e9ecef, transparent);
        margin: 15px 0;
      }
      
      /* ESTILOS DE IMPRESIÓN MEJORADOS - UNA SOLA HOJA */
      @media print {
        @page {
          size: auto; /* Tamaño automático para una sola hoja */
          margin: 0; /* Sin márgenes */
          padding: 0;
        }
        
        body {
          background: white !important;
          padding: 10px !important;
          margin: 0 !important;
          height: auto !important;
          width: 100% !important;
          display: block !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .ticket-container {
          box-shadow: none !important;
          border: 2px solid #ccc !important;
          margin: 0 auto !important;
          max-width: 320px !important;
          padding: 20px 15px !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          break-after: avoid !important;
          break-before: avoid !important;
        }
        
        .barcode-container {
          background: #f8f9fa !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Ocultar elementos no esenciales para impresión */
        .no-print {
          display: none !important;
        }
        
        /* Asegurar que no haya saltos de página */
        .ticket-container, .barcode-container, .info-grid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
      
      /* Efectos sutiles */
      .ticket-container {
        transition: all 0.3s ease;
      }
    </style>
  </head>
  <body>
    <div class="ticket-container">
      <div class="logo">TODOTECH</div>
      <div class="subtitle">Comprobante Digital</div>
      <div class="title">Orden de Compra</div>
      
      <div class="numero-orden">${this.ordenActual.numeroOrden}</div>
      
      <div class="decoration-line"></div>
      
      <div class="barcode-container">
        <div class="barcode">
          ${this.generarBarrasCodigo(this.ordenActual.numeroOrden)}
        </div>
        <div class="barcode-number">${this.ordenActual.numeroOrden.replace(/-/g, '')}</div>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Cliente</span>
          <span class="info-value">${this.ordenActual.cliente.nombre}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Documento</span>
          <span class="info-value">${this.ordenActual.cliente.cedula}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Vendedor</span>
          <span class="info-value">${this.ordenActual.vendedor.nombre}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fecha</span>
          <span class="info-value">${this.formatearFechaCorta(this.ordenActual.fecha)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado</span>
          <span class="info-value">
            <span class="status-badge">${this.ordenActual.estado}</span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Total</span>
          <span class="info-value total-amount">${this.formatearMoneda(this.ordenActual.total)}</span>
        </div>
      </div>
      
      <div class="footer">
        <div class="footer-text">
          Presente este código para procesar su pago
        </div>
        <div class="print-date">
          ${new Date().toLocaleString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
    
    <script>
      // Auto-imprimir y cerrar después de imprimir
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 250);
      };
      
      // Cerrar cuando se completa la impresión
      window.onafterprint = function() {
        setTimeout(function() {
          window.close();
        }, 500);
      };
    </script>
  </body>
  </html>
`;

    const ventanaImpresion = window.open('', '_blank', 'width=400,height=600,scrollbars=no');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
      
      // ✅ ESCUCHAR CUANDO SE CIERRA LA VENTANA DE IMPRESIÓN
      const verificarVentana = setInterval(() => {
        if (ventanaImpresion.closed) {
          clearInterval(verificarVentana);
          console.log('✅ Ventana de impresión cerrada, procesando...');
          this.procesarDespuesDeImpresion();
        }
      }, 500);
    } else {
      // Si no se pudo abrir la ventana, procesar inmediatamente
      console.warn('⚠️ No se pudo abrir ventana de impresión, procesando directamente...');
      this.procesarDespuesDeImpresion();
    }
  }

  // ✅ NUEVO MÉTODO: Procesar después de la impresión
  private procesarDespuesDeImpresion(): void {
    console.log('🔄 Procesando después de la impresión...');
    
    // 1. Marcar que la impresión se completó
    this.impresionCompletada = true;
    
    // 2. Limpiar la orden actual
    this.limpiarOrdenActual();
    
    // 3. Cerrar el modal
    this.mostrarModal = false;
    
    // 4. Redirigir a OrdenVentaComponent
    console.log('🔄 Redirigiendo a /ordenVenta...');
    this.router.navigate(['/ordenVenta']);
  }

  // ✅ MÉTODO ACTUALIZADO: Cerrar modal
  cerrarModal(): void {
    console.log('❌ Cerrando modal sin imprimir');
    this.mostrarModal = false;
    
    // Si ya se completó la impresión, redirigir
    if (this.impresionCompletada) {
      this.router.navigate(['/ordenVenta']);
    }
  }

  // ✅ MÉTODO ACTUALIZADO: Limpiar orden actual
  private limpiarOrdenActual(): void {
    console.log('🧹 Limpiando orden actual después de imprimir...');
    
    // Limpiar en el servicio
    this.ordenVentaService.limpiarOrdenActual();
    
    // Limpiar en localStorage
    localStorage.removeItem('ordenActual');
    localStorage.removeItem('ordenId');
    localStorage.removeItem('currentOrder');
    
    // Limpiar en el componente
    this.ordenActual = null;
    
    console.log('✅ Orden actual limpiada correctamente');
  }

  // Método auxiliar para generar barras de código
  generarBarrasCodigo(numeroOrden: string): string {
    const codigo = numeroOrden.replace(/-/g, '');
    let barrasHTML = '';
    
    // Generar barras con diferentes alturas para simular código real
    for (let i = 0; i < 20; i++) {
      const altura = Math.random() > 0.3 ? '40px' : 
                    Math.random() > 0.6 ? '35px' : '30px';
      const grosor = Math.random() > 0.7 ? '3px' : '2px';
      
      barrasHTML += `<div class="barcode-line" style="height: ${altura}; max-width: ${grosor};"></div>`;
    }
    
    return barrasHTML;
  }

  // Método auxiliar para formatear fecha corta
  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // =============================================
  // MÉTODOS DE CÁLCULO CORREGIDOS - USAR VALORES DEL BACKEND
  // =============================================

  // Usar directamente los valores del backend
  calcularSubtotal(): number {
    return this.ordenActual?.subtotal || 0;
  }

  calcularBaseImponible(): number {
    // Base imponible = subtotal - descuento (según lógica del backend)
    const subtotal = this.ordenActual?.subtotal || 0;
    const descuento = this.ordenActual?.descuento || 0;
    return subtotal - descuento;
  }

  calcularImpuestos(): number {
    // Usar el valor del backend en lugar de calcularlo
    return this.ordenActual?.impuestos || 0;
  }

  calcularTotal(): number {
    // Usar el valor del backend en lugar de calcularlo
    return this.ordenActual?.total || 0;
  }

 // ✅ CORREGIDO: Calcular descuento según la fórmula especificada
getDescuentoAplicado(): number {
  if (!this.ordenActual) return 0;
  
  const valorOriginal = this.ordenActual.subtotal;
  const porcentajeDescuento = 0.10; // 10%
  
  // Aplicar la fórmula: valor con descuento = valor original + (valor original × 0.10)
  const valorConDescuento = valorOriginal + (valorOriginal * porcentajeDescuento);
  
  // Descuento = Valor con descuento - valor original
  const descuento = valorConDescuento - valorOriginal;
  
  return descuento;
}

  getPorcentajeImpuestos(): number {
    // Según el backend, los impuestos son del 2%
    return 2;
  }

  // Métodos de utilidad para el template
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

  obtenerImagenProducto(imagenUrl: string | undefined): string {
    if (!imagenUrl) return 'assets/images/default-product.png';
    if (imagenUrl.startsWith('http')) return imagenUrl;
    return imagenUrl.startsWith('assets/') ? imagenUrl : `assets/${imagenUrl}`;
  }

  getBadgeClass(estado: EstadoOrden): string {
    switch (estado) {
      case EstadoOrden.PENDIENTE: return 'badge-pendiente';
      case EstadoOrden.AGREGANDOPRODUCTOS: return 'badge-agregando';
      case EstadoOrden.DISPONIBLEPARAPAGO: return 'badge-disponible';
      case EstadoOrden.PAGADA: return 'badge-pagada';
      case EstadoOrden.ENTREGADA: return 'badge-entregada';
      case EstadoOrden.CERRADA: return 'badge-cerrada';
      default: return 'badge-default';
    }
  }

  // Navegación
  volverAInicio(): void {
    this.router.navigate(['/inicio']);
  }

  // Recargar datos
  recargarOrden(): void {
    this.cargarOrdenActual();
  }
}