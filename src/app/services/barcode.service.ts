// services/barcode.service.ts
import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import JsBarcode from 'jsbarcode';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private sanitizer = inject(DomSanitizer);

  /**
   * Genera un código de barras SVG como string
   */
  generarCodigoBarrasSVG(codigo: string, opciones?: any): string {
    try {
      // Limpiar el código (remover caracteres no numéricos)
      const codigoLimpio = codigo.replace(/[^0-9]/g, '');
      
      // Opciones por defecto
      const opcionesDefault = {
        format: "CODE128", // Formato más común
        width: 2,
        height: 80,
        displayValue: true,
        fontOptions: "bold",
        font: "Arial",
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 5,
        fontSize: 14,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 10,
        marginTop: 10,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
        ...opciones
      };

      // Crear elemento SVG temporal
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      
      // Generar el código de barras
      JsBarcode(svg, codigoLimpio, opcionesDefault);
      
      // Convertir a string
      return svg.outerHTML;
      
    } catch (error) {
      console.error('❌ Error generando código de barras:', error);
      return this.generarCodigoBarrasFallback(codigo);
    }
  }

  /**
   * Genera código de barras como SafeHtml para usar en templates
   */
  generarCodigoBarrasSafe(codigo: string, opciones?: any): SafeHtml {
    const svgString = this.generarCodigoBarrasSVG(codigo, opciones);
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  /**
   * Genera código de barras como Data URL para usar en imágenes
   */
  generarCodigoBarrasDataURL(codigo: string, opciones?: any): string {
    try {
      const svgString = this.generarCodigoBarrasSVG(codigo, opciones);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('❌ Error generando Data URL:', error);
      return '';
    }
  }

  /**
   * Método fallback en caso de error
   */
  private generarCodigoBarrasFallback(codigo: string): string {
    const codigoLimpio = codigo.replace(/[^0-9]/g, '');
    return `
      <svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="16" fill="black">
          Código: ${codigoLimpio}
        </text>
        <text x="50%" y="80%" text-anchor="middle" font-family="Arial" font-size="12" fill="gray">
          (Código de barras no disponible)
        </text>
      </svg>
    `;
  }

  /**
   * Opciones predefinidas para diferentes tipos de códigos de barras
   */
  getOpcionesParaTicket(): any {
    return {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
      font: "Arial",
      fontSize: 12,
      textMargin: 3,
      background: "#ffffff",
      lineColor: "#000000",
      margin: 8
    };
  }

  getOpcionesParaEtiqueta(): any {
    return {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: true,
      font: "Arial",
      fontSize: 10,
      textMargin: 2,
      background: "#ffffff",
      lineColor: "#000000",
      margin: 5
    };
  }
}