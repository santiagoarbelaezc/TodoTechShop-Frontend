import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarSelectionStoreService {
  
  // Usamos localStorage para persistir la selección
  private readonly STORAGE_KEY = 'navbar_cliente_selection';

  constructor() {}

  // Guardar la sección activa
  guardarSeccion(seccion: string): void {
    const data = {
      seccionActiva: seccion,
      fecha: new Date().toISOString()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    console.log(`💾 NavbarSelectionStore: Sección guardada -> "${seccion}"`);
  }

  // Obtener la sección guardada
  obtenerSeccion(): string {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.seccionActiva || 'inicio';
      }
    } catch (error) {
      console.error('Error al leer selección:', error);
    }
    return 'inicio'; // Valor por defecto
  }

  // Limpiar la selección (opcional)
  limpiarSeleccion(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ NavbarSelectionStore: Selección limpiada');
  }
}