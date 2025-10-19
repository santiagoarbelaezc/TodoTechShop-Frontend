import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acceso-denegado.component.html',
  styleUrls: ['./acceso-denegado.component.css']
})
export class AccesoDenegadoComponent implements OnInit {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    console.log('🔧 AccesoDenegadoComponent - Constructor ejecutado');
    console.log('🔧 Router inyectado:', this.router ? 'SÍ' : 'NO');
    console.log('🔧 AuthService inyectado:', this.authService ? 'SÍ' : 'NO');
  }

  ngOnInit(): void {
    console.log('🔄 AccesoDenegadoComponent - ngOnInit ejecutado');
    
    // Verificar si estamos en el contexto correcto
    console.log('📍 URL actual:', window.location.href);
    console.log('📍 Path actual:', window.location.pathname);
  }

  volverAlLogin(): void {
    console.log('🔄 volverAlLogin() - Método llamado');
    
    try {
      console.log('📍 Usando AuthService.logout() para redirección');
      
      // ✅ Usar el logout del servicio que ya maneja todo automáticamente
      this.authService.logout();
      
    } catch (error) {
      console.error('❌ Error en volverAlLogin:', error);
      
      // Fallback si el servicio falla
      this.alternativeRedirect();
    }
  }

  private alternativeRedirect(): void {
    console.log('🔄 alternativeRedirect() - Método llamado');
    
    // Limpiar estado de autenticación manualmente
    this.authService.clearAuthState();
    
    // Métodos alternativos de redirección
    const alternatives = [
      () => {
        console.log('🔄 Intentando alternativa 1: window.location.href');
        window.location.href = '/login';
      },
      () => {
        console.log('🔄 Intentando alternativa 2: window.location.replace');
        window.location.replace('/login');
      },
      () => {
        console.log('🔄 Intentando alternativa 3: router.navigate con fallback');
        this.router.navigate(['/login']).then(success => {
          if (!success) {
            window.location.href = '/login';
          }
        });
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
    alert('Error de redirección. Por favor, recarga la página manualmente y ve a /login');
  }
}