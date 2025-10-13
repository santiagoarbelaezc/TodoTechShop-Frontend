import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdenConDetallesDto, EstadoOrden } from '../../models/orden-venta/ordenventa.dto';

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.css'
})
export class DespachoComponent implements OnInit {
  ordenes: OrdenConDetallesDto[] = [];
  ordenSeleccionada: OrdenConDetallesDto | null = null;
  mostrarMensajeria = false;
  metodoDespacho = '';
  empresaMensajeria = 'servientrega';
  numeroGuia = '';
  fechaDespacho = '';
  codigoRastreo = '';
  estadoRastreo = false;
  eventosRastreo: any[] = [];

  currentOrderDetails = {
    seller: '',
    client: '',
    date: '',
    status: '',
    taxes: '',
    total: '',
    toPay: ''
  };

  menuItems = [
    { icon: 'fa-truck', text: 'Despachos Pendientes', active: true },
    { icon: 'fa-map-marker-alt', text: 'Rastrear Pedidos', active: false },
    { icon: 'fa-history', text: 'Historial de Despachos', active: false }
  ];

  constructor() {}

  ngOnInit(): void {
    // TODO: Implementar inicialización del componente
  }

  cargarOrdenes(): void {
    // TODO: Implementar carga de órdenes pendientes de despacho
  }

  seleccionarOrden(orden: OrdenConDetallesDto): void {
    // TODO: Implementar selección de orden
  }

  mostrarCamposMensajeria(mostrar: boolean): void {
    // TODO: Implementar mostrar/ocultar campos de mensajería
  }

  selectItem(item: { icon: string; text: string; active: boolean }): void {
    // TODO: Implementar selección de ítem del menú
  }

  rastrearPedido(): void {
    // TODO: Implementar lógica de rastreo de pedido
  }

  confirmarDespacho(): void {
    // TODO: Implementar confirmación de despacho
  }

  cancelarDespacho(): void {
    // TODO: Implementar cancelación de despacho
  }
}