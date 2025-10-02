import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Output() seccionCambiada = new EventEmitter<string>();
  @Input() seccionActiva: string = 'bienvenida';

  usuarioNombre: string = '';
  usuarioRol: string = '';
  rutaActual: string = '';

  // Mapeo de rutas a secciones
  private rutaASeccion: { [key: string]: string } = {
    '/admin-creacion': 'usuarios',
    '/admin': 'usuariosRegistrados',
    '/admin-productos': 'productos'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarInformacionUsuario();
    this.obtenerRutaActual();
    
    // Escuchar cambios de ruta para actualizar la sección activa
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.obtenerRutaActual();
        this.actualizarSeccionDesdeRuta();
      });
  }

  private obtenerRutaActual() {
    this.rutaActual = this.router.url;
  }

  private actualizarSeccionDesdeRuta() {
    const seccion = this.rutaASeccion[this.rutaActual];
    if (seccion && seccion !== this.seccionActiva) {
      this.seccionActiva = seccion;
      this.seccionCambiada.emit(seccion);
    }
  }

  private cargarInformacionUsuario() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.usuarioNombre = user.nombre || 'Administrador';
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
    const rutas: { [key: string]: string } = {
      'usuarios': 'admin-creacion', // Sin la barra inicial
      'usuariosRegistrados': 'admin-tabla',
      'productos': 'admin-productos',
      'ordenes': 'admin',
      'reportes': 'admin', 
      'configuracion': 'admin'
    };

    const ruta = rutas[seccion] || 'admin';

    // Navegar a la ruta
    this.router.navigate([ruta]).then(() => {
      // Actualizar la sección activa
      this.seccionActiva = seccion;
      // Emitir el evento para que el componente padre sepa
      this.seccionCambiada.emit(seccion);
    });
  }

  salir() {
    const confirmacion = confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmacion) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}