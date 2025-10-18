import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarStateService {
  private seccionActivaSubject = new BehaviorSubject<string>('inicio');
  public seccionActiva$ = this.seccionActivaSubject.asObservable();

  constructor() {}

  // Establecer la sección activa
  setSeccionActiva(seccion: string): void {
    console.log('🔄 NavbarStateService: Cambiando sección a:', seccion);
    this.seccionActivaSubject.next(seccion);
  }

  // Obtener la sección activa actual
  getSeccionActiva(): string {
    return this.seccionActivaSubject.value;
  }

  // Obtener el Observable para suscribirse
  getSeccionActivaObservable() {
    return this.seccionActiva$;
  }
}