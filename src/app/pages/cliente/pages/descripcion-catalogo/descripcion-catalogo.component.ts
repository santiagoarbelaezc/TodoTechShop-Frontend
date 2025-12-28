import { Component } from '@angular/core';
import { NavbarClienteComponent } from '../../navbar-cliente/navbar-cliente.component';
import { FooterClienteComponent } from '../../footer-cliente/footer-cliente.component';
import { DescripcionClienteComponent } from "../../descripcion-cliente/descripcion-cliente.component";

@Component({
  selector: 'app-descripcion-catalogo',
  standalone: true,
  imports: [NavbarClienteComponent, FooterClienteComponent, DescripcionClienteComponent],
  templateUrl: './descripcion-catalogo.component.html',
  styleUrl: './descripcion-catalogo.component.css'
})
export class DescripcionCatalogoComponent {

}
