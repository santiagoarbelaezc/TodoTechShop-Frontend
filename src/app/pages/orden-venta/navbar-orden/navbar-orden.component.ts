import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar-orden',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-orden.component.html',
  styleUrls: ['./navbar-orden.component.css']
})
export class NavbarOrdenComponent implements OnInit, OnDestroy {
  @Output() seccionCambiada = new EventEmitter<string>();
  @Input() seccionActiva: string = 'creacionOrden';

  usuarioNombre: string = '';
  usuarioRol: string = '';
  rutaActual: string = '';
  fechaHora: string = '';
  private intervalo: any;

  // Mapeo bidireccional de rutas a secciones
  private rutaASeccion: { [key: string]: string } = {
    '/vendedor-creacion-orden': 'creacionOrden',
    '/ordenVenta/clientes-registrados': 'clientes',
    '/ordenVenta/ordenes-activas': 'ordenes'
  };

  private seccionARuta: { [key: string]: string } = {
    'creacionOrden': '/vendedor-creacion-orden',
    'clientes': '/ordenVenta/clientes-registrados',
    'ordenes': '/ordenVenta/ordenes-activas'
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
    if (this.rutaActual.includes('clientes')) {
      this.actualizarSeccion('clientes');
    } else if (this.rutaActual.includes('ordenes')) {
      this.actualizarSeccion('ordenes');
    } else if (this.rutaActual.includes('creacion-orden')) {
      this.actualizarSeccion('creacionOrden');
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
      this.usuarioNombre = user.nombre || 'Vendedor';
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
    const ruta = this.seccionARuta[seccion] || '/vendedor-creacion-orden';

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
      this.authService.logout();
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