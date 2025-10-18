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
  
  constructor(private router: Router) {
    console.log('🔧 AccesoDenegadoComponent - Constructor ejecutado');
    console.log('🔧 Router inyectado:', this.router ? 'SÍ' : 'NO');
  }

  ngOnInit(): void {
    console.log('🔄 AccesoDenegadoComponent - ngOnInit ejecutado');
    
    // Verificar si estamos en el contexto correcto
    console.log('📍 URL actual:', window.location.href);
    console.log('📍 Path actual:', window.location.pathname);
  }

  volverAlLogin(): void {
    console.log('🔄 volverAlLogin() - Método llamado');
    console.log('📍 Intentando navegar a /login');
    
    try {
      // Verificar el estado del router
      console.log('🔧 Estado del router:', this.router);
      
      // Intentar navegación
      this.router.navigate(['/login']).then(success => {
        console.log(success ? '✅ Navegación exitosa' : '❌ Navegación fallida');
        
        if (!success) {
          console.error('❌ Error: No se pudo navegar a /login');
          console.log('🔄 Intentando redirección alternativa...');
          this.alternativeRedirect();
        }
      }).catch(error => {
        console.error('❌ Error en navigate:', error);
        this.alternativeRedirect();
      });
      
    } catch (error) {
      console.error('❌ Error crítico en volverAlLogin:', error);
      this.alternativeRedirect();
    }
  }

  private alternativeRedirect(): void {
    console.log('🔄 alternativeRedirect() - Método llamado');
    
    // Métodos alternativos de redirección
    const alternatives = [
      () => {
        console.log('🔄 Intentando alternativa 1: window.location.href');
        window.location.href = '/login';
      },
      () => {
        console.log('🔄 Intentando alternativa 2: window.location.replace');
        window.location.replace('/login');
      }
    ];
    
    // Probar alternativas secuencialmente
    let currentAlternative = 0;
    
    const tryNextAlternative = () => {
      if (currentAlternative < alternatives.length) {
        console.log(`🔄 Probando alternativa ${currentAlternative + 1}`);
        try {
          alternatives[currentAlternative]();
        } catch (error) {
          console.error(`❌ Alternativa ${currentAlternative + 1} falló:`, error);
          currentAlternative++;
          setTimeout(tryNextAlternative, 100);
        }
      } else {
        console.error('❌ Todas las alternativas fallaron');
        this.showFallbackMessage();
      }
    };
    
    tryNextAlternative();
  }

  private showFallbackMessage(): void {
    console.error('❌ CRÍTICO: No se pudo redirigir al login');
    // Mostrar mensaje al usuario
    alert('Error de redirección. Por favor, recarga la página manualmente.');
  }
}