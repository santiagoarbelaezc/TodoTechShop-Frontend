import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manual-usuario',
  standalone: true,
  imports: [],
  templateUrl: './manual-usuario.component.html',
  styleUrls: ['./manual-usuario.component.css']
})
export class ManualUsuarioComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Inicializar la primera sección como activa
    this.showSection('cliente-catalogo');
  }

  // Método para volver al login
  goBack(): void {
    this.router.navigate(['/login']);
  }

  // Método para cambiar entre secciones
  showSection(sectionId: string): void {
    // Remover clase active de todos los items del menú
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Remover clase active de todos los content items
    const contentItems = document.querySelectorAll('.content-item');
    contentItems.forEach(content => content.classList.remove('active'));

    // Agregar clase active al item del menú clickeado
    const clickedNav = Array.from(navItems).find(item => {
      const textElement = item.querySelector('.nav-text');
      const sectionText = this.getSectionText(sectionId);
      return textElement?.textContent?.includes(sectionText);
    });
    
    if (clickedNav) {
      clickedNav.classList.add('active');
    }

    // Mostrar la sección correspondiente
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.classList.add('active');
    }
  }

  // Método auxiliar para obtener el texto de la sección
  private getSectionText(sectionId: string): string {
    const sections: { [key: string]: string } = {
      'cliente-catalogo': 'Soy cliente, ¿cómo puedo ver el catálogo?',
      'problema-ingreso': 'No me está dejando ingresar',
      'recuperar-contrasena': 'Cómo recuperar mi contraseña',
      'descargar-manual': 'Descargar Manual'
    };
    return sections[sectionId] || '';
  }

  // Método para descargar el manual completo
  descargarManual(): void {
    // Crear contenido del manual en formato HTML para PDF
    const manualContent = this.generarContenidoManual();
    
    // Crear un blob con el contenido
    const blob = new Blob([manualContent], { type: 'text/html' });
    
    // Crear URL para descarga
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento de enlace para descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Manual_Usuario_TodoTech_Shop.html';
    
    // Simular click para descargar
    link.click();
    
    // Liberar recursos
    window.URL.revokeObjectURL(url);
  }

  // Método para generar el contenido completo del manual
  private generarContenidoManual(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual de Usuario - TodoTech Shop</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        body {
            background: white;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .manual-page {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 25px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            min-height: 297mm;
            position: relative;
            page-break-after: always;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #1421cf;
            padding-bottom: 25px;
            margin-bottom: 35px;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            padding: 30px;
            border-radius: 10px;
        }
        
        .logo-container {
            margin-bottom: 20px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(0, 0, 0, 0.1);
            padding: 3px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #1421cf;
            margin-bottom: 10px;
            font-weight: 700;
            font-size: 32px;
        }
        
        h2 {
            color: #db1f1f;
            border-bottom: 2px solid #db1f1f;
            padding-bottom: 8px;
            margin-top: 35px;
            margin-bottom: 20px;
            font-weight: 600;
            font-size: 24px;
        }
        
        h3 {
            color: #1a1a1a;
            margin-top: 25px;
            margin-bottom: 15px;
            font-weight: 600;
            font-size: 18px;
        }
        
        .role-section {
            background: #f8f9fa;
            padding: 20px;
            border-left: 4px solid #1421cf;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .process-step {
            margin: 18px 0;
            padding: 18px;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }
        
        .page-number {
            position: absolute;
            bottom: 25px;
            right: 35px;
            color: #666;
            font-size: 12px;
            font-weight: 500;
        }
        
        .note-box {
            background: #f0f9ff;
            border: 1px solid #0d6efd;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #0d6efd;
        }
        
        .warning-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
        }
        
        .confidentiality-section {
            background: linear-gradient(135deg, #1421cf 0%, #db1f1f 100%);
            color: white;
            padding: 25px;
            margin: 25px 0;
            border-radius: 10px;
            text-align: center;
        }
        
        ul {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        li {
            margin: 8px 0;
            line-height: 1.5;
        }
        
        p {
            margin: 12px 0;
            line-height: 1.6;
        }
        
        strong {
            color: #1a1a1a;
        }
        
        .section-divider {
            height: 2px;
            background: linear-gradient(90deg, #1421cf 0%, #db1f1f 100%);
            margin: 30px 0;
            border: none;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .feature-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <!-- Página 1 -->
    <div class="manual-page">
        <div class="header">
            
            <h1>Manual de Usuario</h1>
            <h2>Sistema de Gestión TodoTech Shop</h2>
            <p><strong>Versión 2.0</strong></p>
            <p><em>Fecha de publicación: 16/10/2025</em></p>
        </div>
        
        <div class="confidentiality-section">
            <h3>🔒 Compromiso con la Confidencialidad</h3>
            <p>Este manual contiene información confidencial y propiedad de TodoTech Shop. Su distribución está restringida al personal autorizado.</p>
        </div>
        
        <h2>Introducción</h2>
        <p>Bienvenido al sistema de gestión integral de TodoTech Shop, diseñado específicamente para optimizar los procesos de venta, inventario y administración en nuestra cadena de tiendas de tecnología.</p>
        
        <div class="note-box">
            <strong>🎯 Propósito del Sistema:</strong> Agilizar las ventas en tiendas físicas, reducir errores en precios y mejorar significativamente la experiencia del cliente mediante procesos digitalizados y eficientes.
        </div>
        
        <h2>Compromiso con la Atención al Usuario</h2>
        <p>En TodoTech Shop, priorizamos la excelencia en el servicio al cliente. Nuestro sistema está diseñado para:</p>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h4>👥 Atención Personalizada</h4>
                <p>Cada interacción con el cliente es única y merece una atención especializada y personalizada.</p>
            </div>
            <div class="feature-card">
                <h4>⚡ Eficiencia en Procesos</h4>
                <p>Reducción de tiempos de espera y optimización de todos los procesos de venta.</p>
            </div>
            <div class="feature-card">
                <h4>🔍 Transparencia Total</h4>
                <p>Información clara y accesible para el cliente en cada etapa del proceso.</p>
            </div>
        </div>
        
        <hr class="section-divider">
        
        <h2>Roles del Sistema</h2>
        
        <div class="role-section">
            <h3>🔧 Administrador (Admin)</h3>
            <p><strong>Responsabilidades Principales:</strong></p>
            <ul>
                <li>Gestión integral de usuarios y permisos del sistema</li>
                <li>Configuración y mantenimiento de parámetros del sistema</li>
                <li>Generación de reportes analíticos y de ventas</li>
                <li>Supervisión del inventario general y niveles de stock</li>
                <li>Configuración de precios, promociones y productos</li>
                <li>Auditoría de procesos y cumplimiento de políticas</li>
            </ul>
        </div>
        
        <div class="role-section">
            <h3>👨‍💼 Vendedor</h3>
            <p><strong>Responsabilidades Principales:</strong></p>
            <ul>
                <li>Atención especializada al cliente en tienda física</li>
                <li>Creación y gestión de órdenes de venta</li>
                <li>Consulta experta del catálogo electrónico</li>
                <li>Verificación en tiempo real de disponibilidad de stock</li>
                <li>Asesoramiento técnico personalizado a clientes</li>
                <li>Manejo de objeciones y cierre de ventas</li>
            </ul>
        </div>
        
        <div class="page-number">Página 1 de 5</div>
    </div>

    <!-- Página 2 -->
    <div class="manual-page">
        <h2>Roles del Sistema (Continuación)</h2>
        
        <div class="role-section">
            <h3>💰 Cajero</h3>
            <p><strong>Responsabilidades Principales:</strong></p>
            <ul>
                <li>Procesamiento eficiente de pagos de órdenes de venta</li>
                <li>Aceptación y manejo de diferentes métodos de pago:
                    <ul>
                        <li>💵 Efectivo</li>
                        <li>💳 Tarjeta bancaria (crédito/débito)</li>
                        <li>📱 Redcompra y transferencias</li>
                    </ul>
                </li>
                <li>Entrega profesional de comprobantes de pago</li>
                <li>Conciliación diaria de caja y reportes financieros</li>
                <li>Atención al cliente en proceso de pago</li>
            </ul>
        </div>
        
        <div class="role-section">
            <h3>📦 Despachador</h3>
            <p><strong>Responsabilidades Principales:</strong></p>
            <ul>
                <li>Validación precisa de órdenes de venta pagadas</li>
                <li>Preparación eficiente de pedidos según ubicación en bodega</li>
                <li>Entrega física cuidadosa de productos al cliente</li>
                <li>Verificación de aceptación y satisfacción del cliente</li>
                <li>Cierre correcto de órdenes de venta en sistema</li>
                <li>Manejo de inventario y organización de bodega</li>
            </ul>
        </div>
        
        <hr class="section-divider">
        
        <h2>Políticas de Confidencialidad y Seguridad</h2>
        
        <div class="warning-box">
            <h4>⚠️ Información Confidencial</h4>
            <p>Todo el personal debe mantener la confidencialidad de:</p>
            <ul>
                <li>Datos personales de clientes</li>
                <li>Información financiera de la empresa</li>
                <li>Estrategias comerciales y de precios</li>
                <li>Procesos internos del sistema</li>
            </ul>
        </div>
        
        <div class="note-box">
            <h4>🔐 Medidas de Seguridad</h4>
            <ul>
                <li>Acceso restringido por roles y permisos</li>
                <li>Contraseñas seguras y cambio periódico</li>
                <li>Registro de actividades en el sistema</li>
                <li>Backup automático de información</li>
            </ul>
        </div>
        
        <div class="page-number">Página 2 de 5</div>
    </div>

    <!-- Página 3 -->
    <div class="manual-page">
        <h2>Proceso de Compra para Clientes</h2>
        
        <div class="note-box">
            <strong>🏪 Modalidad de Venta:</strong> TodoTech Shop opera exclusivamente a través de tiendas físicas. No realizamos ventas en línea para garantizar la mejor experiencia de compra.
        </div>
        
        <h3>Paso 1: Visita a la Tienda Física</h3>
        <div class="process-step">
            <p>El cliente debe acudir personalmente a una de nuestras tiendas físicas, donde será recibido por nuestro equipo de atención al cliente.</p>
            <p><strong>Compromiso:</strong> Ambiente acogedor y atención inmediata.</p>
        </div>
        
        <h3>Paso 2: Asesoramiento Especializado</h3>
        <div class="process-step">
            <p>Un vendedor especializado atenderá al cliente, realizando un diagnóstico de necesidades y recomendando soluciones tecnológicas adecuadas.</p>
            <p><strong>Compromiso:</strong> Asesoramiento técnico profesional y personalizado.</p>
        </div>
        
        <h3>Paso 3: Creación de Orden de Venta</h3>
        <div class="process-step">
            <p>El vendedor crea una orden de venta en el sistema ingresando:</p>
            <ul>
                <li>📝 Información completa del cliente (con consentimiento)</li>
                <li>🛒 Productos seleccionados del catálogo electrónico</li>
                <li>✅ Verificación inmediata de stock en tiempo real</li>
                <li>💰 Cálculo automático de precios y totales</li>
            </ul>
        </div>
        
        <h3>Paso 4: Generación de Número de Orden</h3>
        <div class="process-step">
            <p>El sistema genera un número de orden único que identifica la transacción. El cliente recibe este número para presentar en caja.</p>
            <p><strong>Beneficio:</strong> Seguimiento preciso y sin errores.</p>
        </div>
        
        <div class="page-number">Página 3 de 5</div>
    </div>

    <!-- Página 4 -->
    <div class="manual-page">
        <h2>Proceso de Compra para Clientes (Continuación)</h2>
        
        <h3>Paso 5: Proceso de Pago</h3>
        <div class="process-step">
            <p>En el área de caja, el cajero:</p>
            <ul>
                <li>🔢 Solicita y verifica el número de orden</li>
                <li>💳 Procesa el pago por el método elegido por el cliente</li>
                <li>🧾 Entrega comprobante de pago detallado</li>
                <li>😊 Brinda atención cordial y eficiente</li>
            </ul>
        </div>
        
        <h3>Paso 6: Retiro en Despacho</h3>
        <div class="process-step">
            <p>Con el comprobante de pago, el cliente se dirige a despacho donde:</p>
            <ul>
                <li>📋 El despachador valida la orden en el sistema</li>
                <li>📦 Prepara los productos desde bodega con cuidado</li>
                <li>🤝 Entrega personalmente los productos al cliente</li>
                <li>⭐ Verifica la aceptación y satisfacción del cliente</li>
                <li>✅ Cierra la orden en el sistema</li>
            </ul>
        </div>
        
        <hr class="section-divider">
        
        <h2>Estándares de Atención al Cliente</h2>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h4>🎯 Enfoque en el Cliente</h4>
                <p>Cada interacción debe ser amable, profesional y centrada en las necesidades del cliente.</p>
            </div>
            <div class="feature-card">
                <h4>⏱️ Eficiencia</h4>
                <p>Tiempos de espera mínimos y procesos optimizados para mejor experiencia.</p>
            </div>
            <div class="feature-card">
                <h4>🔧 Conocimiento Técnico</h4>
                <p>Todo el personal debe conocer los productos y poder asesorar competentemente.</p>
            </div>
        </div>
        
        <div class="page-number">Página 4 de 5</div>
    </div>

    <!-- Página 5 -->
    <div class="manual-page">
        <h2>Integración con Sistemas</h2>
        
        <div class="role-section">
            <h3>📊 Sistema de Inventario</h3>
            <p>Integración en tiempo real que permite:</p>
            <ul>
                <li>Consulta inmediata y precisa de stock disponible</li>
                <li>Actualización automática al cerrar órdenes de venta</li>
                <li>Prevención de ventas de productos sin stock</li>
                <li>Alertas de reposición y niveles mínimos</li>
                <li>Gestión eficiente de múltiples bodegas</li>
            </ul>
        </div>
        
        <div class="role-section">
            <h3>💼 Sistema de Finanzas</h3>
            <p>Todas las órdenes cerradas se almacenan automáticamente para:</p>
            <ul>
                <li>Contabilidad precisa y reportes financieros</li>
                <li>Análisis detallado de ventas y rentabilidad</li>
                <li>Auditoría y cumplimiento normativo</li>
                <li>Proyecciones y planificación estratégica</li>
                <li>Control de gastos y flujo de caja</li>
            </ul>
        </div>
        
        <hr class="section-divider">
        
        <h2>Beneficios del Sistema</h2>
        
        <div class="process-step">
            <h3>🎯 Para TodoTech Shop</h3>
            <ul>
                <li>Reducción del 95% en errores de precios</li>
                <li>Optimización del 60% en tiempo de procesos de venta</li>
                <li>Control de inventario en tiempo real</li>
                <li>Procesos contables 100% automatizados</li>
                <li>Reportes ejecutivos en tiempo real</li>
                <li>Mejora continua basada en datos</li>
            </ul>
        </div>
        
        <div class="process-step">
            <h3>👍 Para Nuestros Clientes</h3>
            <ul>
                <li>Atención más rápida y personalizada</li>
                <li>Asesoramiento técnico especializado</li>
                <li>Garantía de stock disponible al momento de la compra</li>
                <li>Proceso de compra seguro, organizado y transparente</li>
                <li>Comprobantes digitales y seguimiento de compras</li>
                <li>Experiencia de compra superior</li>
            </ul>
        </div>
        
        <div class="confidentiality-section">
            <h3>📞 Contacto y Soporte</h3>
            <p><strong>Soporte Técnico:</strong> soporte@todotechshop.cl</p>
            <p><strong>Teléfono:</strong> +56 2 2345 6789</p>
            <p><strong>Horario de atención:</strong> Lunes a Viernes 9:00 - 18:00 hrs</p>
            <p><strong>Emergencias técnicas:</strong> +56 9 8765 4321</p>
        </div>
        
        <div class="page-number">Página 5 de 5</div>
    </div>
</body>
</html>
    `;
  }
}