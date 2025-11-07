import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar-caja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-caja.component.html',
  styleUrls: ['./navbar-caja.component.css']
})
export class NavbarCajaComponent implements OnInit, OnDestroy {
  @Output() seccionCambiada = new EventEmitter<string>();
  @Input() seccionActiva: string = 'registrarPago';

  usuarioNombre: string = '';
  usuarioRol: string = '';
  rutaActual: string = '';
  fechaHora: string = '';
  private intervalo: any;

  // Mapeo bidireccional de rutas a secciones
  private rutaASeccion: { [key: string]: string } = {
    '/caja-registrar-pago': 'registrarPago',
    '/caja-lista-pagos': 'listaPagos',
    '/caja-ordenes': 'ordenes'
  };

  private seccionARuta: { [key: string]: string } = {
    'registrarPago': '/caja-registrar-pago',
    'listaPagos': '/caja-lista-pagos',
    'ordenes': '/caja-ordenes'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarInformacionUsuario();
    this.iniciarReloj();
    
    // Escuchar cambios de ruta para actualizar la sección activa
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.obtenerRutaActual();
        this.actualizarSeccionDesdeRuta();
      });

    // Inicializar con la ruta actual
    this.obtenerRutaActual();
    this.actualizarSeccionDesdeRuta();
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private iniciarReloj() {
    this.actualizarFechaHora();
    this.intervalo = setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
  }

  private actualizarFechaHora() {
    const ahora = new Date();
    
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const fecha = ahora.toLocaleDateString('es-ES', opcionesFecha);
    const hora = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    this.fechaHora = `${fecha} - ${hora}`;
  }

  private obtenerRutaActual() {
    this.rutaActual = this.router.url.split('?')[0]; // Eliminar query params
  }

  private actualizarSeccionDesdeRuta() {
    // Buscar la sección correspondiente a la ruta actual
    const seccion = this.rutaASeccion[this.rutaActual];
    
    if (seccion && seccion !== this.seccionActiva) {
      this.seccionActiva = seccion;
      this.seccionCambiada.emit(seccion);
    } else if (!seccion) {
      // Si no encuentra una sección específica, intentar determinar por patrón
      this.determinarSeccionPorPatron();
    }
  }

  private determinarSeccionPorPatron() {
    // Lógica alternativa para determinar la sección por patrones de ruta
    if (this.rutaActual.includes('registrar-pago') || this.rutaActual.includes('pago')) {
      this.actualizarSeccion('registrarPago');
    } else if (this.rutaActual.includes('lista-pagos')) {
      this.actualizarSeccion('listaPagos');
    } else if (this.rutaActual.includes('ordenes')) {
      this.actualizarSeccion('ordenes');
    }
  }

  private actualizarSeccion(seccion: string) {
    if (this.seccionActiva !== seccion) {
      this.seccionActiva = seccion;
      this.seccionCambiada.emit(seccion);
    }
  }

  private cargarInformacionUsuario() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioNombre = user.nombre || 'Cajero';
      this.usuarioRol = this.formatearRol(user.role);
    }
  }

  private formatearRol(rol: string): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'VENDEDOR': 'Vendedor',
      'CAJERO': 'Cajero',
      'DESPACHADOR': 'Despachador'
    };
    return roles[rol] || rol;
  }

  navegar(seccion: string) {
    const ruta = this.seccionARuta[seccion] || '/caja-registrar-pago';

    // Navegar a la ruta
    this.router.navigate([ruta]).then((navegacionExitosa) => {
      if (navegacionExitosa) {
        // La sección se actualizará automáticamente mediante el listener de rutas
        console.log(`Navegación exitosa a: ${seccion}`);
      } else {
        console.error('Error en la navegación');
      }
    }).catch(error => {
      console.error('Error al navegar:', error);
    });
  }

  salir() {
    const confirmacion = confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmacion) {
      console.log('🚪 Cerrando sesión...');
      
      // Cerrar sesión
      this.authService.logout();
      
      // Navegar al login
      this.router.navigate(['/login']);
    }
  }

  // Método público para forzar la actualización de sección (útil desde componentes padres)
  public actualizarSeccionActiva(seccion: string) {
    if (this.seccionActiva !== seccion) {
      this.seccionActiva = seccion;
      this.seccionCambiada.emit(seccion);
    }
  }
}