import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OrdenVentaService } from '../../../services/orden-venta.service';
import { BarcodeService } from '../../../services/barcode.service';
import { OrdenConDetallesDto, EstadoOrden, OrdenDto } from '../../../models/orden-venta/ordenventa.dto'; 

@Component({
  selector: 'app-resumen-orden',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-orden.component.html',
  styleUrls: ['./resumen-orden.component.css']
})
export class ResumenOrdenComponent implements OnInit, OnDestroy {

  private ordenVentaService = inject(OrdenVentaService);
  private barcodeService = inject(BarcodeService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  ordenActual: OrdenConDetallesDto | null = null;
  loading = true;
  error: string | null = null;
  mostrarModal = false;
  procesando = false;
  impresionCompletada = false;

  // 🔥 NUEVO: Variable para almacenar el SVG del código de barras
  codigoBarrasSVG: SafeHtml | null = null;

  // Constante para impuestos
  private readonly PORCENTAJE_IMPUESTOS = 2;  // 2%

  ngOnInit(): void {
    console.log('🔄 Iniciando componente de Resumen de Orden...');
    this.cargarOrdenActual();
  }

  ngOnDestroy(): void {
    // Limpiar URLs de objetos si se generaron
    this.limpiarRecursos();
  }

  private cargarOrdenActual(): void {
    this.loading = true;
    this.error = null;

    const orden = this.ordenVentaService.obtenerOrdenActual();
    
    if (!orden) {
      this.error = 'No hay una orden activa en el sistema.';
      this.loading = false;
      console.log('❌ No se encontró orden actual');
      return;
    }

    console.log('✅ Orden actual encontrada:', orden);
    this.cargarDetallesCompletos(orden.id);
  }

  private cargarDetallesCompletos(ordenId: number): void {
    this.ordenVentaService.obtenerOrdenConDetalles(ordenId).subscribe({
      next: (ordenConDetalles) => {
        this.ordenActual = ordenConDetalles;
        this.loading = false;
        console.log('✅ Detalles de orden cargados:', ordenConDetalles);
        
        // 🔥 NUEVO: Generar código de barras cuando se cargue la orden
        this.generarCodigoBarras();
        
        // ✅ NUEVO: Actualizar el total en el backend después de cargar los detalles
        this.actualizarTotalEnBackend(ordenId);
      },
      error: (err) => {
        console.error('❌ Error al cargar detalles de orden:', err);
        this.error = 'Error al cargar los detalles de la orden.';
        this.loading = false;
      }
    });
  }

  // ✅ NUEVO MÉTODO: Actualizar el total en el backend
  private actualizarTotalEnBackend(ordenId: number): void {
    const totalCalculado = this.getTotal();
    
    console.log(`🔄 Actualizando total en backend - Orden ID: ${ordenId}, Total: ${totalCalculado}`);
    
    this.ordenVentaService.actualizarTotalOrden(ordenId, totalCalculado).subscribe({
      next: (ordenActualizada) => {
        console.log('✅ Total actualizado en backend:', ordenActualizada);
        
        // Actualizar la orden actual con los datos del backend
        this.ordenVentaService.obtenerOrdenConDetalles(ordenId).subscribe({
          next: (ordenConDetallesActualizada) => {
            this.ordenActual = ordenConDetallesActualizada;
            this.ordenVentaService.guardarOrdenActual(ordenConDetallesActualizada);
            console.log('🔄 Orden actualizada con total sincronizado:', ordenConDetallesActualizada);
          },
          error: (err) => {
            console.error('❌ Error al cargar orden actualizada:', err);
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al actualizar total en backend:', err);
        // No mostramos error al usuario ya que esto es una sincronización en segundo plano
      }
    });
  }

  // 🔥 NUEVO MÉTODO: Generar código de barras
  private generarCodigoBarras(): void {
    if (!this.ordenActual?.numeroOrden) return;

    try {
      console.log('📊 Generando código de barras para:', this.ordenActual.numeroOrden);
      
      const opciones = this.barcodeService.getOpcionesParaTicket();
      this.codigoBarrasSVG = this.barcodeService.generarCodigoBarrasSafe(
        this.ordenActual.numeroOrden, 
        opciones
      );
      
      console.log('✅ Código de barras generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando código de barras:', error);
      this.codigoBarrasSVG = this.sanitizer.bypassSecurityTrustHtml(
        this.generarCodigoBarrasFallback()
      );
    }
  }

  // 🔥 NUEVO MÉTODO: Fallback para código de barras
  private generarCodigoBarrasFallback(): string {
    const numeroOrden = this.ordenActual?.numeroOrden || '000000';
    const codigoLimpio = numeroOrden.replace(/[^0-9]/g, '');
    
    return `
      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
        <div style="font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; letter-spacing: 8px; margin-bottom: 10px;">
          ${codigoLimpio.split('').join(' ')}
        </div>
        <div style="font-family: Arial, sans-serif; font-size: 12px; color: #666;">
          ${codigoLimpio}
        </div>
        <div style="font-family: Arial, sans-serif; font-size: 10px; color: #999; margin-top: 5px;">
          (Código de verificación)
        </div>
      </div>
    `;
  }

  // 🔥 NUEVO MÉTODO: Limpiar recursos
  private limpiarRecursos(): void {
    // Si usaste Data URLs, aquí las liberarías
    this.codigoBarrasSVG = null;
  }

  // =============================================
  // MÉTODOS DE CÁLCULO CORREGIDOS - USAR VALORES DEL BACKEND
  // =============================================

  // ✅ Usar directamente los valores del backend
  getSubtotal(): number {
    return this.ordenActual?.subtotal || 0;
  }

  // ✅ Obtener el porcentaje de descuento de la orden
  getPorcentajeDescuento(): number {
    if (!this.ordenActual) return 0;
    
    // Calcular el porcentaje basado en el descuento aplicado y el subtotal
    const subtotal = this.getSubtotal();
    const descuentoAplicado = this.ordenActual.descuento || 0;
    
    if (subtotal > 0 && descuentoAplicado > 0) {
      return (descuentoAplicado / subtotal) * 100;
    }
    
    return 0;
  }

  // ✅ Calcular base imponible (subtotal - descuento)
  getBaseImponible(): number {
    const subtotal = this.getSubtotal();
    const descuento = this.getDescuentoAplicado();
    return Math.max(0, subtotal - (subtotal * descuento / 100));
  }

  // ✅ Calcular impuestos sobre la base imponible
  getImpuestos(): number {
    const baseImponible = this.getBaseImponible();
    const impuestos = baseImponible * (this.PORCENTAJE_IMPUESTOS / 100);
    return this.redondearDecimales(impuestos, 2);
  }

  // ✅ Calcular total (base imponible + impuestos)
  getTotal(): number {
    const baseImponible = this.getBaseImponible();
    const impuestos = this.getImpuestos();
    const total = baseImponible + impuestos;
    return this.redondearDecimales(total, 2);
  }

  // ✅ NUEVO MÉTODO: Redondear decimales elegantemente
  private redondearDecimales(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
  }

  // Método para obtener porcentaje de impuestos
  getPorcentajeImpuestos(): number {
    return this.PORCENTAJE_IMPUESTOS;
  }

  // ✅ NUEVO MÉTODO: Formatear moneda elegante con separadores
  formatearMonedaElegante(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(valor);
  }

  // ✅ NUEVO MÉTODO: Formatear valores decimales para impuestos
  formatearMonedaDecimal(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(valor);
  }

  // Método para generar número de orden
  generarNumero(): void {
    if (!this.ordenActual || !this.puedeGenerarNumero()) {
      return;
    }

    this.procesando = true;
    console.log('🔄 Generando número de orden y marcando como disponible para pago...');

    this.ordenVentaService.marcarComoDisponibleParaPago(this.ordenActual.id).subscribe({
      next: (ordenActualizada) => {
        console.log('✅ Orden marcada como disponible para pago:', ordenActualizada);
        
        this.ordenVentaService.obtenerOrdenConDetalles(this.ordenActual!.id).subscribe({
          next: (ordenConDetallesActualizada) => {
            this.ordenActual = ordenConDetallesActualizada;
            this.ordenVentaService.guardarOrdenActual(ordenConDetallesActualizada);
            
            // 🔥 NUEVO: Regenerar código de barras con el nuevo número
            this.generarCodigoBarras();
            
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
    
    const estadosPermitidos = [EstadoOrden.PENDIENTE, EstadoOrden.AGREGANDOPRODUCTOS];
    return estadosPermitidos.includes(this.ordenActual.estado) && !this.procesando;
  }

  // ✅ MÉTODO ACTUALIZADO: Imprimir número de orden con código de barras real
  imprimirNumeroOrden(): void {
    if (!this.ordenActual) return;

    const contenidoImpresion = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Orden ${this.ordenActual.numeroOrden} - TodoTech</title>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          line-height: 1.4;
          padding: 15px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .ticket-container {
          max-width: 400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 2px solid #e9ecef;
          position: relative;
          overflow: hidden;
        }
        
        /* Efecto de gradiente decorativo */
        .ticket-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #1421cf 0%, #db1f1f 100%);
        }
        
        .logo {
          text-align: center;
          font-size: 28px;
          font-weight: 800;
          color: #1421cf;
          margin-bottom: 5px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        .subtitle {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 500;
        }
        
        .title {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 20px;
          padding: 10px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 10px;
          border: 1px solid #dee2e6;
        }
        
        .numero-orden-container {
          background: linear-gradient(135deg, #1421cf 0%, #3b49df 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
          box-shadow: 0 6px 20px rgba(20, 33, 207, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .numero-orden-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
        }
        
        .numero-orden {
          font-size: 32px;
          font-weight: 800;
          color: white;
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .decoration-line {
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #dee2e6 50%, transparent 100%);
          margin: 20px 0;
          position: relative;
        }
        
        .decoration-line::before {
          content: '⚡';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 0 10px;
          color: #1421cf;
          font-size: 14px;
        }
        
        .barcode-container {
          text-align: center;
          margin: 25px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }
        
        .barcode-svg {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
        }
        
        .barcode-number {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #666;
          letter-spacing: 3px;
          font-weight: 600;
          margin-top: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin: 20px 0;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }
        
        .info-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .info-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          flex: 1;
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          text-align: right;
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
          border: 1px solid #b1dfbb;
        }
        
        .total-amount {
          font-size: 16px;
          font-weight: 700;
          color: #27ae60;
        }
        
        /* Sección de resumen financiero */
        .financial-summary {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #dee2e6;
        }
        
        .financial-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 15px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .financial-title::before {
          content: '💳';
          font-size: 14px;
        }
        
        .financial-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        
        .financial-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px dashed #dee2e6;
        }
        
        .financial-item:last-child {
          border-bottom: none;
        }
        
        .financial-label {
          font-size: 13px;
          color: #666;
        }
        
        .financial-value {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .financial-total {
          border-top: 2px solid #dee2e6;
          margin-top: 8px;
          padding-top: 12px;
        }
        
        .financial-total .financial-label {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
        }
        
        .financial-total .financial-value {
          font-size: 16px;
          font-weight: 800;
          color: #27ae60;
        }
        
        .footer {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 2px solid #e9ecef;
          text-align: center;
        }
        
        .footer-text {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .print-date {
          font-size: 11px;
          color: #999;
          font-family: 'Courier New', monospace;
        }
        
        .warning-note {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 12px 15px;
          margin: 15px 0;
          text-align: center;
        }
        
        .warning-note strong {
          color: #856404;
          font-size: 12px;
          display: block;
          margin-bottom: 5px;
        }
        
        .warning-note span {
          color: #856404;
          font-size: 11px;
          line-height: 1.3;
        }
        
        /* Estilos específicos para impresión */
        @media print {
          body {
            padding: 0;
            background: white;
          }
          
          .ticket-container {
            box-shadow: none;
            border: 1px solid #ccc;
            max-width: 100%;
            margin: 0;
            border-radius: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          @page {
            margin: 0.5cm;
            size: auto;
          }
        }
        
        /* Animación sutil */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ticket-container {
          animation: fadeInUp 0.5s ease-out;
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="logo">TODOTECH</div>
        <div class="subtitle">Comprobante Digital</div>
        <div class="title">Orden de Compra</div>
        
        <div class="numero-orden-container">
          <div class="numero-orden-label">Número de Orden</div>
          <div class="numero-orden">${this.ordenActual.numeroOrden}</div>
        </div>
        
        <div class="decoration-line"></div>
        
        <div class="barcode-container">
          ${this.generarCodigoBarrasParaImpresion()}
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
        </div>
        
        <!-- Sección de Resumen Financiero -->
        <div class="financial-summary">
          <div class="financial-title">Resumen Financiero</div>
          <div class="financial-grid">
            <div class="financial-item">
              <span class="financial-label">Subtotal Productos:</span>
              <span class="financial-value">${this.getSubtotalFormateado()}</span>
            </div>
            ${this.tieneDescuento() ? `
            <div class="financial-item">
              <span class="financial-label">Descuento (${this.getPorcentajeDescuento()}%):</span>
              <span class="financial-value" style="color: #e74c3c;">-${this.getDescuentoFormateado()}</span>
            </div>
            ` : ''}
            <div class="financial-item">
              <span class="financial-label">Base Imponible:</span>
              <span class="financial-value">${this.getBaseImponibleFormateada()}</span>
            </div>
            <div class="financial-item">
              <span class="financial-label">Impuestos (${this.getPorcentajeImpuestos()}%):</span>
              <span class="financial-value">${this.formatearMoneda(this.ordenActual.impuestos || 0)}</span>
            </div>
            <div class="financial-item financial-total">
              <span class="financial-label">Total General:</span>
              <span class="financial-value">${this.getTotalFormateado()}</span>
            </div>
          </div>
        </div>
        
        <div class="warning-note">
          <strong>¡ATENCIÓN!</strong>
          <span>Presente este código para procesar su pago. No se permiten modificaciones después de generada la orden.</span>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            Gracias por su compra en TodoTech
          </div>
          <div class="print-date">
            Impreso: ${new Date().toLocaleString('es-CO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
        
        window.onafterprint = function() {
          setTimeout(function() {
            window.close();
          }, 1000);
        };
      </script>
    </body>
    </html>
    `;

    const ventanaImpresion = window.open('', '_blank', 'width=500,height=700');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
    }
  }

  // 🔥 NUEVO MÉTODO: Generar código de barras para impresión
  private generarCodigoBarrasParaImpresion(): string {
    if (!this.ordenActual?.numeroOrden) return this.generarCodigoBarrasFallback();

    try {
      const opciones = {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: false, // No mostrar el texto debajo en la impresión
        background: "#ffffff",
        lineColor: "#000000",
        margin: 5
      };

      const svgString = this.barcodeService.generarCodigoBarrasSVG(
        this.ordenActual.numeroOrden, 
        opciones
      );
      
      return `<div class="barcode-svg">${svgString}</div>`;
    } catch (error) {
      console.error('❌ Error generando código de barras para impresión:', error);
      return this.generarCodigoBarrasFallback();
    }
  }

  private procesarDespuesDeImpresion(): void {
    console.log('🔄 Procesando después de la impresión...');
    this.impresionCompletada = true;
    this.limpiarOrdenActual();
    this.mostrarModal = false;
    this.router.navigate(['/ordenVenta']);
  }

  cerrarModal(): void {
    console.log('❌ Cerrando modal sin imprimir');
    this.mostrarModal = false;
    
    if (this.impresionCompletada) {
      this.router.navigate(['/ordenVenta']);
    }
  }

  // ✅ NUEVO MÉTODO: Cerrar ventana completamente después de imprimir
cerrarVentana(): void {
  console.log('🚪 Cerrando ventana y limpiando orden...');
  
  // Limpiar la orden actual
  this.limpiarOrdenActual();
  
  // Cerrar el modal
  this.mostrarModal = false;
  
  // Navegar al inicio
  this.router.navigate(['/ordenVenta']);
  
  console.log('✅ Ventana cerrada y orden limpiada correctamente');
}

  private limpiarOrdenActual(): void {
    console.log('🧹 Limpiando orden actual después de imprimir...');
    this.ordenVentaService.limpiarOrdenActual();
    localStorage.removeItem('ordenActual');
    localStorage.removeItem('ordenId');
    localStorage.removeItem('currentOrder');
    this.ordenActual = null;
    this.codigoBarrasSVG = null; // 🔥 NUEVO: Limpiar también el código de barras
    console.log('✅ Orden actual limpiada correctamente');
  }

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // ✅ MANTENER: Método original de formatearMoneda para compatibilidad
  formatearMoneda(valor: number): string {
    return this.formatearMonedaElegante(valor);
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

  // ✅ CORREGIDO: Obtener el valor monetario del descuento aplicado
  getDescuentoAplicado(): number {
    if (!this.ordenActual) return 0;
    
    // Si el backend ya proporciona un descuento como valor monetario, usarlo directamente
    if (this.ordenActual.descuento > 0) {
      return this.ordenActual.descuento;
    }
    
    // Si no hay descuento en el backend, calcularlo basado en el porcentaje
    const subtotal = this.getSubtotal();
    const porcentajeDescuento = this.getPorcentajeDescuento();
    return subtotal * (porcentajeDescuento / 100);
  }

  // ✅ NUEVO MÉTODO: Obtener el valor del descuento formateado para mostrar (sin símbolo %)
  getDescuentoFormateado(): string {
    const descuento = this.getDescuentoAplicado();
    return this.formatearMonedaElegante(descuento);
  }

  // ✅ NUEVO MÉTODO: Obtener el ahorro formateado (para mensajes)
  getAhorroFormateado(): string {
    return this.getDescuentoFormateado();
  }

  // ✅ NUEVO MÉTODO: Verificar si el descuento es significativo
  esDescuentoSignificativo(): boolean {
    const porcentaje = this.getPorcentajeDescuento();
    return porcentaje >= 5; // Considerar significativo si es 5% o más
  }

  // ✅ NUEVO MÉTODO: Obtener mensaje descriptivo del descuento
  getMensajeDescuento(): string {
    const porcentaje = this.getPorcentajeDescuento();
    const valor = this.getDescuentoFormateado();
    
    if (porcentaje > 0) {
      return `¡Descuento del ${porcentaje.toFixed(0)}% aplicado! Ahorras ${valor}`;
    }
    
    return 'Sin descuento aplicado';
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

  recargarOrden(): void {
    this.cargarOrdenActual();
  }

  // ✅ NUEVO MÉTODO: Verificar si hay descuento aplicado
  tieneDescuento(): boolean {
    return this.getDescuentoAplicado() > 0;
  }

  // ✅ NUEVO MÉTODO: Obtener impuestos formateados
  getImpuestosFormateados(): string {
    const impuestos = this.getImpuestos();
    return this.formatearMonedaDecimal(impuestos);
  }

  // ✅ NUEVO MÉTODO: Obtener total formateado
  getTotalFormateado(): string {
    const total = this.getTotal();
    return this.formatearMonedaElegante(total);
  }

  // ✅ NUEVO MÉTODO: Obtener base imponible formateada
  getBaseImponibleFormateada(): string {
    const base = this.getBaseImponible();
    return this.formatearMonedaElegante(base);
  }

  // ✅ NUEVO MÉTODO: Obtener subtotal formateado
  getSubtotalFormateado(): string {
    const subtotal = this.getSubtotal();
    return this.formatearMonedaElegante(subtotal);
  }
}