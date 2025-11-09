// services/invoice.service.ts
import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrdenConDetallesDto, EstadoOrden } from '../models/orden-venta/ordenventa.dto';
import { ClienteDto } from '../models/cliente.dto';
import { UsuarioDto } from '../models/usuario/usuario.dto';
import { DetalleOrdenDto } from '../models/detalle-orden/detalle-orden.dto';
import { ProductoDto } from '../models/producto/producto.dto';

export interface FacturaDto {
  id: number;
  numeroFactura: string;
  fechaEmision: Date;
  ordenId: number;
  numeroOrden: string;
  cliente: ClienteDto;
  vendedor: UsuarioDto;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodoPago: string;
  estadoPago: string;
  productos: ProductoFacturaDto[];
  observaciones?: string;
}

export interface ProductoFacturaDto {
  nombre: string;
  codigo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento?: number;
}

export interface MetodoPagoInfo {
  nombre: string;
  referencia?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private facturas: FacturaDto[] = [];
  private consecutivo = 1;

  constructor() { }

  /**
   * Genera una factura a partir de una orden pagada
   */
  generarFactura(
    orden: OrdenConDetallesDto, 
    metodoPago: string, 
    referenciaPago?: string
  ): FacturaDto {
    
    const numeroFactura = this.generarNumeroFactura();
    const fechaEmision = new Date();

    const factura: FacturaDto = {
      id: this.consecutivo++,
      numeroFactura,
      fechaEmision,
      ordenId: orden.id,
      numeroOrden: orden.numeroOrden,
      cliente: orden.cliente,
      vendedor: orden.vendedor,
      subtotal: orden.subtotal,
      descuento: orden.descuento,
      impuestos: orden.impuestos,
      total: orden.total,
      metodoPago: metodoPago + (referenciaPago ? ` - Ref: ${referenciaPago}` : ''),
      estadoPago: 'PAGADO',
      productos: this.mapearProductosFactura(orden.productos),
      observaciones: orden.observaciones
    };

    this.facturas.push(factura);
    
    // Guardar en localStorage para persistencia
    this.guardarFacturas();
    
    return factura;
  }

  /**
   * Mapea los productos de la orden al formato de factura
   */
  private mapearProductosFactura(productos: DetalleOrdenDto[]): ProductoFacturaDto[] {
    return productos.map(detalle => ({
      nombre: detalle.producto.nombre,
      codigo: detalle.producto.codigo,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
      subtotal: detalle.subtotal
    }));
  }

  /**
   * Genera número de factura consecutivo
   */
  private generarNumeroFactura(): string {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const consecutivo = this.consecutivo.toString().padStart(6, '0');
    return `FAC-${year}${month}-${consecutivo}`;
  }

  /**
   * Genera el PDF de la factura
   */
  generarPDF(factura: FacturaDto): jsPDF {
    const doc = new jsPDF();
    
    // Configuración inicial
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Encabezado de la factura
    this.agregarEncabezado(doc, factura, pageWidth, yPosition);
    yPosition = 50;

    // Información del cliente y vendedor
    yPosition = this.agregarInformacionPartes(doc, factura, yPosition, margin);
    yPosition += 15;

    // Tabla de productos
    const finalY = this.agregarTablaProductos(doc, factura, yPosition, margin);
    
    // Totales
    this.agregarTotales(doc, factura, finalY + 10, pageWidth, margin);

    // Pie de página
    this.agregarPiePagina(doc, factura, pageWidth);

    return doc;
  }

  /**
   * Agrega el encabezado de la factura
   */
  private agregarEncabezado(doc: jsPDF, factura: FacturaDto, pageWidth: number, yPosition: number): void {
    // Logo y título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', pageWidth - 60, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nº: ${factura.numeroFactura}`, pageWidth - 60, yPosition + 8);
    doc.text(`Fecha: ${this.formatearFecha(factura.fechaEmision)}`, pageWidth - 60, yPosition + 16);
    
    // Información de la empresa
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TIENDA COMERCIAL', 20, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Nit: 900.123.456-7', 20, yPosition + 8);
    doc.text('Dirección: Calle 123 #45-67', 20, yPosition + 16);
    doc.text('Teléfono: (601) 123 4567', 20, yPosition + 24);
    doc.text('Email: info@tiendacomercial.com', 20, yPosition + 32);
  }

  /**
   * Agrega información del cliente y vendedor
   */
  private agregarInformacionPartes(doc: jsPDF, factura: FacturaDto, yPosition: number, margin: number): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const colWidth = (pageWidth - (margin * 3)) / 2;
    
    // Información del cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE:', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${factura.cliente.nombre}`, margin, yPosition + 8);
    doc.text(`Cédula/Nit: ${factura.cliente.cedula}`, margin, yPosition + 16);
    doc.text(`Email: ${factura.cliente.correo || 'No especificado'}`, margin, yPosition + 24);
    doc.text(`Teléfono: ${factura.cliente.telefono || 'No especificado'}`, margin, yPosition + 32);
    doc.text(`Dirección: ${factura.cliente.direccion || 'No especificada'}`, margin, yPosition + 40);
    
    // Información del vendedor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VENDEDOR:', margin + colWidth + 20, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${factura.vendedor.nombre}`, margin + colWidth + 20, yPosition + 8);
    doc.text(`Código: ${factura.numeroOrden}`, margin + colWidth + 20, yPosition + 16);
    doc.text(`Método Pago: ${factura.metodoPago}`, margin + colWidth + 20, yPosition + 24);
    doc.text(`Estado: ${factura.estadoPago}`, margin + colWidth + 20, yPosition + 32);
    
    return yPosition + 45;
  }

  /**
   * Agrega la tabla de productos
   */
  private agregarTablaProductos(doc: jsPDF, factura: FacturaDto, yPosition: number, margin: number): number {
    const tableColumn = [
      'Código',
      'Producto', 
      'Cantidad',
      'P. Unitario',
      'Subtotal'
    ];
    
    const tableRows = factura.productos.map(producto => [
      producto.codigo,
      producto.nombre,
      producto.cantidad.toString(),
      this.formatCurrency(producto.precioUnitario),
      this.formatCurrency(producto.subtotal)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      margin: { left: margin, right: margin }
    });
    
    return (doc as any).lastAutoTable.finalY;
  }

  /**
   * Agrega los totales de la factura
   */
  private agregarTotales(doc: jsPDF, factura: FacturaDto, yPosition: number, pageWidth: number, margin: number): void {
    const totalX = pageWidth - margin - 80;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', totalX, yPosition);
    doc.text(this.formatCurrency(factura.subtotal), totalX + 40, yPosition);
    
    doc.text('Descuento:', totalX, yPosition + 8);
    doc.text(this.formatCurrency(factura.descuento), totalX + 40, yPosition + 8);
    
    doc.text('Impuestos:', totalX, yPosition + 16);
    doc.text(this.formatCurrency(factura.impuestos), totalX + 40, yPosition + 16);
    
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalX, yPosition + 28);
    doc.text(this.formatCurrency(factura.total), totalX + 40, yPosition + 28);
  }

  /**
   * Agrega el pie de página
   */
  private agregarPiePagina(doc: jsPDF, factura: FacturaDto, pageWidth: number): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por su compra!', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    if (factura.observaciones) {
      doc.text(`Observaciones: ${factura.observaciones}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    }
    
    doc.text(`Factura generada el ${this.formatearFechaHora(factura.fechaEmision)}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
  }

  /**
   * Descarga el PDF de la factura
   */
  descargarPDF(factura: FacturaDto, nombreArchivo?: string): void {
    const pdf = this.generarPDF(factura);
    const fileName = nombreArchivo || `factura_${factura.numeroFactura}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Abre el PDF en una nueva ventana
   */
  verPDF(factura: FacturaDto): void {
    const pdf = this.generarPDF(factura);
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  }

  /**
   * Obtiene todas las facturas generadas
   */
  obtenerFacturas(): FacturaDto[] {
    return [...this.facturas];
  }

  /**
   * Obtiene una factura por ID de orden
   */
  obtenerFacturaPorOrdenId(ordenId: number): FacturaDto | undefined {
    return this.facturas.find(f => f.ordenId === ordenId);
  }

  /**
   * Formatea currency
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  /**
   * Formatea fecha
   */
  private formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea fecha y hora
   */
  private formatearFechaHora(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Guarda facturas en localStorage
   */
  private guardarFacturas(): void {
    try {
      localStorage.setItem('facturas_generadas', JSON.stringify(this.facturas));
      localStorage.setItem('consecutivo_facturas', this.consecutivo.toString());
    } catch (error) {
      console.warn('No se pudieron guardar las facturas en localStorage:', error);
    }
  }

  /**
   * Carga facturas desde localStorage
   */
  cargarFacturasDesdeStorage(): void {
    try {
      const facturasGuardadas = localStorage.getItem('facturas_generadas');
      const consecutivoGuardado = localStorage.getItem('consecutivo_facturas');
      
      if (facturasGuardadas) {
        this.facturas = JSON.parse(facturasGuardadas);
      }
      
      if (consecutivoGuardado) {
        this.consecutivo = parseInt(consecutivoGuardado, 10);
      }
    } catch (error) {
      console.warn('Error cargando facturas desde localStorage:', error);
    }
  }
}