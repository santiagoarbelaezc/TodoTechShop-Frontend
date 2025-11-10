import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politica-privacidad.component.html',
  styleUrl: './politica-privacidad.component.css'
})
export class PoliticaPrivacidadComponent implements OnInit {
  fechaActual: Date = new Date();
  seccionActiva: string = 'informacion';

  secciones = [
    { id: 'informacion', titulo: 'Información Recopilada', icon: '📊' },
    { id: 'uso', titulo: 'Uso de la Información', icon: '🎯' },
    { id: 'proteccion', titulo: 'Protección de Datos', icon: '🛡️' },
    { id: 'derechos', titulo: 'Derechos del Titular', icon: '⚖️' }
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

  aceptarPolitica() {
    localStorage.setItem('politicaPrivacidadAceptada', 'true');
    localStorage.setItem('fechaAceptacionPolitica', new Date().toISOString());
    
    // Redirigir a la página anterior o al home
    const returnUrl = localStorage.getItem('returnUrl') || '/';
    this.router.navigate([returnUrl]);
  }

  rechazarPolitica() {
    if (confirm('Para utilizar nuestros servicios es necesario aceptar la política de privacidad. ¿Desea salir?')) {
      this.router.navigate(['/']);
    }
  }

  descargarPDF() {
    // Simular descarga de PDF
    const link = document.createElement('a');
    link.href = '#';
    link.download = `Politica-Privacidad-TodoTech-${this.fechaActual.getFullYear()}.pdf`;
    link.click();
    
    alert('La descarga del PDF comenzará en breve.');
  }

  // Método estático para verificar aceptación
  static verificarPoliticaAceptada(): boolean {
    const politicaAceptada = localStorage.getItem('politicaPrivacidadAceptada');
    const fechaAceptacion = localStorage.getItem('fechaAceptacionPolitica');
    
    if (politicaAceptada === 'true' && fechaAceptacion) {
      const fechaAceptacionDate = new Date(fechaAceptacion);
      const hoy = new Date();
      const diferenciaDias = (hoy.getTime() - fechaAceptacionDate.getTime()) / (1000 * 3600 * 24);
      
      // La política es válida por 365 días
      return diferenciaDias <= 365;
    }
    return false;
  }

  // Método para forzar re-aceptación
  static forzarReAceptacion() {
    localStorage.removeItem('politicaPrivacidadAceptada');
    localStorage.removeItem('fechaAceptacionPolitica');
  }

  // Método combinado para verificar ambos (términos y política)
  static verificarAceptacionCompleta(): boolean {
    return this.verificarPoliticaAceptada() && TerminosCondicionesComponent.verificarTerminosAceptados();
  }
}

// Necesitamos importar el componente de términos para el método combinado
import { TerminosCondicionesComponent } from '../terminos-condiciones/terminos-condiciones.component';