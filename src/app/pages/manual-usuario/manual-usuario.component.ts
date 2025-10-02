import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manual-usuario',
  standalone: true,
  imports: [],
  templateUrl: './manual-usuario.component.html',
  styleUrls: ['./manual-usuario.component.css']
})
export class ManualUsuarioComponent {
  
  constructor(private router: Router) {}

  // Método para volver al login
  goBack(): void {
    this.router.navigate(['/login']);
  }
}