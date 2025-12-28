import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

export interface ContentCard {
  imageUrl: string;    // URL de la imagen PNG
  altText: string;     // Texto alternativo
  title: string;       // Título principal
  description: string; // Descripción corta
  link?: string;       // Enlace opcional
  textPosition?: 'top' | 'bottom' | 'center'; // Posición del texto
}

@Component({
  selector: 'app-trio-presentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trio-presentation.component.html',
  styleUrls: ['./trio-presentation.component.css']
})
export class TrioPresentationComponent {
  @Input() cards: ContentCard[] = [];
  @Input() backgroundColor: string = '#000000';
  @Input() textColor: string = '#ffffff';
  @Input() cardHeight: string = '500px'; // Altura de cada card
  @Input() gap: string = '2rem'; // Espacio entre cards
  @Input() hoverEffect: boolean = true; // Efecto hover
  @Input() layout: 'default' | 'alternate' | 'custom' = 'default';

  constructor(private sanitizer: DomSanitizer) {}

  // Obtener estilos dinámicos para la sección
  getSectionStyles(): SafeStyle {
    // Determinar si el fondo es claro u oscuro
    const isLightBg = this.isLightColor(this.backgroundColor);
    
    // Colores adaptables basados en el fondo
    const cardBg = isLightBg ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const borderColor = isLightBg ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const overlayStart = isLightBg ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.7)';
    const overlayMid = isLightBg ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)';
    const overlayLight = isLightBg ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)';
    const hoverBg = isLightBg ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
    const hoverBorder = isLightBg ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    const overlayOpacity = isLightBg ? '0.3' : '0.7';
    
    return this.sanitizer.bypassSecurityTrustStyle(`
      --bg-color: ${this.backgroundColor};
      --text-color: ${this.textColor};
      --card-bg: ${cardBg};
      --border-color: ${borderColor};
      --overlay-start: ${overlayStart};
      --overlay-mid: ${overlayMid};
      --overlay-light: ${overlayLight};
      --hover-bg: ${hoverBg};
      --hover-border: ${hoverBorder};
      --overlay-opacity: ${overlayOpacity};
    `);
  }

  // Determinar si un color hex es claro u oscuro
  private isLightColor(hexColor: string): boolean {
    // Remover # si existe
    const hex = hexColor.replace('#', '');
    
    // Convertir a RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si luminancia > 0.5, es claro
    return luminance > 0.5;
  }

  // Determina el orden de contenido según el layout
  getCardLayout(index: number): 'image-text' | 'text-image' | 'image-text' {
    if (this.layout === 'alternate') {
      return index % 2 === 0 ? 'image-text' : 'text-image';
    } else if (this.layout === 'custom') {
      // Para el layout específico que mencionaste
      if (index === 0) return 'image-text';     // Contenedor 1
      if (index === 1) return 'text-image';     // Contenedor 2  
      if (index === 2) return 'image-text';     // Contenedor 3
    }
    return 'image-text'; // Layout por defecto
  }

  // Navega al enlace si existe
  navigateToLink(link?: string): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  // Clase para la posición del texto
  getTextPositionClass(position?: 'top' | 'bottom' | 'center'): string {
    return position || 'center';
  }
}