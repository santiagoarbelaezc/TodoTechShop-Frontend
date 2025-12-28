import { Component } from '@angular/core';
import { NavbarClienteComponent } from '../../navbar-cliente/navbar-cliente.component';
import { FooterClienteComponent } from '../../footer-cliente/footer-cliente.component';
import { CatalogoPresentacionComponent } from "../../catalogo-presentacion/catalogo-presentacion.component";

@Component({
  selector: 'app-presentacion-catalogo',
  standalone: true,
  imports: [NavbarClienteComponent, FooterClienteComponent, CatalogoPresentacionComponent],
  templateUrl: './presentacion-catalogo.component.html',
  styleUrl: './presentacion-catalogo.component.css'
})
export class PresentacionCatalogoComponent {

}
