import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceso-denegado.component.html',
  styleUrls: ['./acceso-denegado.component.css']
})
export class AccesoDenegadoComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Efectos de animación al inicializar el componente
    this.animateElements();
  }

  volverAlLogin(): void {
    this.router.navigate(['/login']);
  }

  volverAlInicio(): void {
    this.router.navigate(['/login']);
  }

  private animateElements(): void {
    // Animación de aparición escalonada
    setTimeout(() => {
      const elements = document.querySelectorAll('.denied-content > *');
      elements.forEach((element, index) => {
        (element as HTMLElement).style.animationDelay = `${index * 0.2}s`;
      });
    }, 100);
  }
}