// src/app/components/orden-venta/orden-venta.component.ts
import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../../services/usuario.service';
import { OrdenVentaService } from '../../services/orden-venta.service';
import { Router } from '@angular/router';
import { ClienteDTO } from '../../models/cliente.dto';
import { CrearOrdenDTO } from '../../models/CrearOrden.dto';
import { OrdenVentaDTO } from '../../models/ordenventa.dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioDto } from '../../models/usuario.dto';

@Component({
  selector: 'app-orden-venta',
  templateUrl: './orden-venta.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./orden-venta.component.css']
})
export class OrdenVentaComponent implements OnInit, AfterViewInit {
  fechaHora: string = '';
  currentTheme: string = 'light';
  private hasSwapped: boolean = false;

  cliente: ClienteDTO = {
    nombre: '',
    correo: '',
    telefono: '',
    clave: ''
  };

  private crearOrdenUrl = 'http://localhost:8080/api/ordenes/crear';
  ordenes: OrdenVentaDTO[] = [];

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private ordenVentaService: OrdenVentaService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Implementación pendiente
  }

  ngAfterViewInit(): void {
    // Implementación pendiente
  }

  private initSmoothSwap(): void {
    // Implementación pendiente
  }

  private activateSecondaryEffects(): void {
    // Implementación pendiente
  }

  private activateWaves(): void {
    // Implementación pendiente
  }

  private activateOrbitalDots(): void {
    // Implementación pendiente
  }

  setTheme(theme: string): void {
    // Implementación pendiente
  }

  cargarOrdenes() {
    // Implementación pendiente
  }

  actualizarFechaHora(): void {
    // Implementación pendiente
  }

  onSubmit(): void {
    // Implementación pendiente
  }
}