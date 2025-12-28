import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer-cliente',
  templateUrl: './footer-cliente.component.html',
  styleUrls: ['./footer-cliente.component.css'],
  
  standalone: true,

})
export class FooterClienteComponent {
  
  constructor(private router: Router) {}

  /**
   * Navega al catálogo de productos
   */
  volverAlCatalogo(): void {
    this.router.navigate(['/catalogo']);
  }

  /**
   * Navega a la página de login
   */
  irALogin(): void {
    this.router.navigate(['/login']);
  }
}