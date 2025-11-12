import { Injectable } from '@angular/core';
import { OrdenConDetallesDto } from '../models/orden-venta/ordenventa.dto';

@Injectable({
  providedIn: 'root'
})
export class ImpresionService {

  constructor() { }

  /**
   * Imprime una orden pagada con formato moderno y profesional
   */
  imprimirOrdenPagada(orden: OrdenConDetallesDto): void {
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    if (!ventanaImpresion) {
      console.error('No se pudo abrir la ventana de impresión');
      return;
    }

    const contenido = this.generarContenidoImpresion(orden);
    
    ventanaImpresion.document.write(contenido);
    ventanaImpresion.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    ventanaImpresion.onload = () => {
      setTimeout(() => {
        ventanaImpresion.print();
      }, 500);
    };
  }

  /**
   * Genera el contenido HTML para la impresión con diseño moderno
   */
  private generarContenidoImpresion(orden: OrdenConDetallesDto): string {
    const fecha = new Date(orden.fecha).toLocaleDateString('es-ES');
    const fechaHora = new Date().toLocaleString('es-ES');
    const tieneProductos = orden.productos && orden.productos.length > 0;
    const porcentajeIVA = this.calcularPorcentajeIVA(orden.impuestos, orden.subtotal);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura - Orden #${orden.numeroOrden} - TodoTechShop</title>
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
        
        .header-section {
          text-align: center;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 800;
          color: #1421cf;
          margin-bottom: 5px;
          letter-spacing: 1px;
        }
        
        .empresa-subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .document-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .document-title::before {
          content: '📄';
          font-size: 18px;
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
        
        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
          border: 1px solid #b1dfbb;
          display: inline-block;
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
        
        /* Sección de Productos */
        .productos-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #dee2e6;
        }
        
        .productos-title {
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
        
        .productos-title::before {
          content: '📦';
          font-size: 14px;
        }
        
        .productos-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .productos-table th {
          background: linear-gradient(135deg, #1421cf 0%, #3b49df 100%);
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .productos-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #e9ecef;
          font-size: 12px;
        }
        
        .productos-table tr:last-child td {
          border-bottom: none;
        }
        
        .productos-table tr:hover {
          background-color: #f8f9fa;
        }
        
        .producto-nombre {
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .producto-codigo {
          color: #666;
          font-size: 10px;
          font-family: 'Courier New', monospace;
        }
        
        .producto-cantidad, .producto-precio, .producto-subtotal {
          text-align: center;
          font-weight: 500;
        }
        
        .sin-productos {
          text-align: center;
          padding: 30px 20px;
          color: #666;
          font-style: italic;
          background: white;
          border-radius: 8px;
          border: 1px dashed #dee2e6;
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
        
        .descuento-item .financial-value {
          color: #e74c3c;
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
        <!-- Sección de Encabezado Mejorada -->
        <div class="header-section">
            <div class="logo">TODOTECHSHOP</div>
            <div class="empresa-subtitle">Tecnología y Soluciones Digitales</div>
            <div class="document-title">FACTURA DE VENTA</div>
            
            <div class="numero-orden-container">
                <div class="numero-orden-label">Número de Factura</div>
                <div class="numero-orden">${orden.numeroOrden}</div>
                <div class="status-badge">${orden.estado}</div>
            </div>
        </div>

        <!-- Información Básica -->
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Fecha de Emisión</span>
                <span class="info-value">${fecha}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Vendedor</span>
                <span class="info-value">${orden.vendedor.nombre}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Cliente</span>
                <span class="info-value">${orden.cliente.nombre}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Documento</span>
                <span class="info-value">${orden.cliente.cedula}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tipo Cliente</span>
                <span class="info-value">${orden.cliente.tipoCliente === 'NATURAL' ? 'Natural' : 'Jurídico'}</span>
            </div>
            ${orden.cliente.correo ? `
            <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">${orden.cliente.correo}</span>
            </div>
            ` : ''}
            ${orden.cliente.telefono ? `
            <div class="info-item">
                <span class="info-label">Teléfono</span>
                <span class="info-value">${orden.cliente.telefono}</span>
            </div>
            ` : ''}
        </div>

        <!-- Sección de Productos -->
        <div class="productos-section">
            <div class="productos-title">Detalle de Productos</div>
            ${tieneProductos ? `
            <table class="productos-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${orden.productos.map(producto => `
                    <tr>
                        <td>
                            <div class="producto-nombre">${producto.producto.nombre}</div>
                            <div class="producto-codigo">${producto.producto.codigo}</div>
                        </td>
                        <td class="producto-cantidad">${producto.cantidad}</td>
                        <td class="producto-precio">${this.formatearMoneda(producto.precioUnitario)}</td>
                        <td class="producto-subtotal">${this.formatearMoneda(producto.subtotal)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="sin-productos">
                No hay productos registrados en esta orden
            </div>
            `}
        </div>

        <!-- Sección de Resumen Financiero -->
        <div class="financial-summary">
            <div class="financial-title">Resumen Financiero</div>
            <div class="financial-grid">
                <div class="financial-item">
                    <span class="financial-label">Subtotal Productos:</span>
                    <span class="financial-value">${this.formatearMoneda(orden.subtotal)}</span>
                </div>
                ${orden.descuento > 0 ? `
                <div class="financial-item descuento-item">
                    <span class="financial-label">Descuento (${orden.descuento}%):</span>
                    <span class="financial-value">-${this.formatearMoneda(this.calcularDescuento(orden.subtotal, orden.descuento))}</span>
                </div>
                ` : ''}
                <div class="financial-item">
                    <span class="financial-label">Base Imponible:</span>
                    <span class="financial-value">${this.formatearMoneda(this.calcularBaseImponible(orden.subtotal, orden.descuento))}</span>
                </div>
                <div class="financial-item">
                    <span class="financial-label">IVA (${porcentajeIVA}%):</span>
                    <span class="financial-value">${this.formatearMoneda(orden.impuestos)}</span>
                </div>
                <div class="financial-item financial-total">
                    <span class="financial-label">TOTAL PAGADO:</span>
                    <span class="financial-value">${this.formatearMoneda(orden.total)}</span>
                </div>
            </div>
        </div>

        ${orden.observaciones ? `
        <div class="warning-note">
            <strong>Observaciones:</strong>
            <span>${orden.observaciones}</span>
        </div>
        ` : `
        <div class="warning-note">
            <strong>¡Gracias por su compra!</strong>
            <span>Conserve esta factura como garantía de su compra. No se aceptan devoluciones sin este documento.</span>
        </div>
        `}
        
        <div class="footer">
            <div class="footer-text">
                TodoTechShop - Tecnología de Vanguardia
            </div>
            <div class="print-date">
                Factura generada: ${fechaHora}
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
  }

  /**
   * Formatea un valor numérico a moneda COP
   */
  private formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  /**
   * Calcula el porcentaje de IVA basado en el impuesto y subtotal
   */
  private calcularPorcentajeIVA(impuestos: number, subtotal: number): number {
    if (subtotal === 0) return 0;
    return Math.round((impuestos / subtotal) * 100);
  }

  /**
   * Calcula el monto del descuento
   */
  private calcularDescuento(subtotal: number, porcentajeDescuento: number): number {
    return (subtotal * porcentajeDescuento) / 100;
  }

  /**
   * Calcula la base imponible después del descuento
   */
  private calcularBaseImponible(subtotal: number, porcentajeDescuento: number): number {
    const descuento = this.calcularDescuento(subtotal, porcentajeDescuento);
    return subtotal - descuento;
  }

  /**
   * Método alternativo para generar PDF (placeholder para futura implementación)
   */
  generarPDFOrdenPagada(orden: OrdenConDetallesDto): void {
    console.log('Generando PDF para orden:', orden.numeroOrden);
    this.imprimirOrdenPagada(orden);
  }

  /**
   * Método para previsualizar la orden antes de imprimir
   */
  previsualizarOrdenPagada(orden: OrdenConDetallesDto): void {
    const ventana = window.open('', '_blank', 'width=800,height=600');
    
    if (!ventana) {
      console.error('No se pudo abrir la ventana de previsualización');
      return;
    }

    const contenido = this.generarContenidoImpresion(orden);
    
    ventana.document.write(contenido);
    ventana.document.close();
  }
}