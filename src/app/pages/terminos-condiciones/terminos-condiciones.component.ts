import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminos-condiciones.component.html',
  styleUrl: './terminos-condiciones.component.css'
})
export class TerminosCondicionesComponent implements OnInit {
  fechaActual: Date = new Date();
  seccionActiva: string = 'uso';

  secciones = [
    { id: 'uso', titulo: 'Uso del Servicio', icon: '📱' },
    { id: 'cuenta', titulo: 'Cuenta y Registro', icon: '👤' },
    { id: 'condiciones', titulo: 'Condiciones Generales', icon: '📋' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.actualizarSeccionActiva();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.actualizarSeccionActiva();
  }

  actualizarSeccionActiva() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    for (const seccion of this.secciones) {
      const element = document.getElementById(seccion.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          this.seccionActiva = seccion.id;
          break;
        }
      }
    }
  }

  scrollToSeccion(seccionId: string) {
    const element = document.getElementById(seccionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      this.seccionActiva = seccionId;
    }
  }

  aceptarTerminos() {
    localStorage.setItem('terminosAceptados', 'true');
    localStorage.setItem('fechaAceptacionTerminos', new Date().toISOString());
    
    // Redirigir a la página anterior o al home
    const returnUrl = localStorage.getItem('returnUrl') || '/';
    this.router.navigate([returnUrl]);
  }

  rechazarTerminos() {
    if (confirm('Para utilizar nuestros servicios es necesario aceptar los términos y condiciones. ¿Desea salir?')) {
      this.router.navigate(['/']);
    }
  }

  descargarPDF() {
    // Simular descarga de PDF
    const link = document.createElement('a');
    link.href = '#';
    link.download = `Terminos-Condiciones-TodoTech-${this.fechaActual.getFullYear()}.pdf`;
    link.click();
    
    alert('La descarga del PDF comenzará en breve.');
  }

  // Método estático para verificar aceptación
  static verificarTerminosAceptados(): boolean {
    const terminosAceptados = localStorage.getItem('terminosAceptados');
    const fechaAceptacion = localStorage.getItem('fechaAceptacionTerminos');
    
    if (terminosAceptados === 'true' && fechaAceptacion) {
      const fechaAceptacionDate = new Date(fechaAceptacion);
      const hoy = new Date();
      const diferenciaDias = (hoy.getTime() - fechaAceptacionDate.getTime()) / (1000 * 3600 * 24);
      
      // Los términos son válidos por 365 días
      return diferenciaDias <= 365;
    }
    return false;
  }

  // Método para forzar re-aceptación
  static forzarReAceptacion() {
    localStorage.removeItem('terminosAceptados');
    localStorage.removeItem('fechaAceptacionTerminos');
  }
}