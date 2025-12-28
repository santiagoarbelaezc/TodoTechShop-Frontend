import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { NavbarClienteComponent } from '../../navbar-cliente/navbar-cliente.component';
import { FooterClienteComponent } from '../../footer-cliente/footer-cliente.component';

import { NavbarStateService } from '../../../../services/navbar-state.service';
import { CatalogoComponent } from '../../catalogo/catalogo.component';


@Component({
  selector: 'app-inicio-catalogo',
  standalone: true,
  imports: [NavbarClienteComponent, FooterClienteComponent, CatalogoComponent],
  templateUrl: './inicio-catalogo.component.html',
  styleUrl: './inicio-catalogo.component.css'
})
export class InicioCatalogoComponent implements OnInit{
  private navbarStateService = inject(NavbarStateService);
  ngOnInit(): void {
    this.navbarStateService.setSeccionActiva('inicio');
  }

}
