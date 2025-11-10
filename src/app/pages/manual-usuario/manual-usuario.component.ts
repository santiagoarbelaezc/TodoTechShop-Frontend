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
      'cliente-catalogo': '1. Ver Catálogo de Productos',
      'proceso-compra': '2. Proceso de Compra',
      'pago-caja': '3. Pago en Caja',
      'recuperar-contrasena': '4. Recuperar Contraseña',
      'verificar-stock': '5. Verificar Stock',
      'gestion-admin': '6. Gestión Administrativa',
      'reportes-analitica': '7. Reportes y Análitica',
      'soporte-tecnico': '8. Soporte Técnico',
      'descargar-manual': 'Descargar Manual Completo'
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
            padding: 0;
            color: #333;
        }
        
        .manual-page {
            background: white;
            padding: 40px;
            margin-bottom: 0;
            min-height: 297mm;
            position: relative;
            page-break-after: always;
        }
        
        /* Portada */
        .cover-page {
            background: linear-gradient(135deg, #1421cf 0%, #db1f1f 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            min-height: 297mm;
            padding: 60px;
        }
        
        .cover-logo {
            width: 120px;
            height: 120px;
            background: white;
            border-radius: 50%;
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: bold;
            color: #1421cf;
        }
        
        .cover-title {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-subtitle {
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 40px;
            opacity: 0.9;
        }
        
        .cover-version {
            font-size: 16px;
            margin-top: 60px;
            opacity: 0.8;
        }
        
        /* Tabla de Contenidos */
        .toc-page {
            background: #f8f9fa;
        }
        
        .toc-title {
            color: #1421cf;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 40px;
            text-align: center;
        }
        
        .toc-list {
            list-style: none;
            margin: 0 auto;
            max-width: 600px;
        }
        
        .toc-item {
            margin: 15px 0;
            padding: 15px 20px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #1421cf;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .toc-number {
            font-weight: 600;
            color: #1421cf;
            margin-right: 10px;
        }
        
        /* Contenido Principal */
        .header {
            text-align: center;
            border-bottom: 2px solid #1421cf;
            padding-bottom: 25px;
            margin-bottom: 35px;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            padding: 30px;
            border-radius: 10px;
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
        
        .section-number {
            background: #1421cf;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-weight: 700;
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
        
        .success-box {
            background: #d1f2eb;
            border: 1px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #28a745;
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
        
        .step-indicator {
            display: flex;
            align-items: center;
            margin: 15px 0;
        }
        
        .step-number {
            background: #db1f1f;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-weight: 600;
        }
        
        .step-content {
            flex: 1;
        }
        
        .url-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
            border-left: 4px solid #1421cf;
        }
        
        .section-divider {
            height: 2px;
            background: linear-gradient(90deg, #1421cf 0%, #db1f1f 100%);
            margin: 30px 0;
            border: none;
        }
    </style>
</head>
<body>
    <!-- Portada -->
    <div class="manual-page cover-page">
        <div class="cover-logo">TT</div>
        <h1 class="cover-title">Manual de Usuario</h1>
        <h2 class="cover-subtitle">Sistema de Gestión Integral</h2>
        <p style="font-size: 18px; margin-top: 20px; opacity: 0.9;">TodoTech Shop</p>
        <div class="cover-version">
            <p>Versión 2.0 | Octubre 2025</p>
            <p style="margin-top: 10px;">Documento Confidencial</p>
        </div>
    </div>

    <!-- Tabla de Contenidos -->
    <div class="manual-page toc-page">
        <h1 class="toc-title">Tabla de Contenidos</h1>
        <ul class="toc-list">
            <li class="toc-item">
                <span class="toc-number">1.</span>
                Ver Catálogo de Productos
            </li>
            <li class="toc-item">
                <span class="toc-number">2.</span>
                Proceso de Compra en Tienda
            </li>
            <li class="toc-item">
                <span class="toc-number">3.</span>
                Pago en Módulo de Caja
            </li>
            <li class="toc-item">
                <span class="toc-number">4.</span>
                Recuperación de Contraseña
            </li>
            <li class="toc-item">
                <span class="toc-number">5.</span>
                Verificación de Stock
            </li>
            <li class="toc-item">
                <span class="toc-number">6.</span>
                Gestión Administrativa
            </li>
            <li class="toc-item">
                <span class="toc-number">7.</span>
                Reportes y Análitica
            </li>
            <li class="toc-item">
                <span class="toc-number">8.</span>
                Soporte Técnico
            </li>
        </ul>
        
        <div class="note-box" style="margin-top: 60px;">
            <strong>📋 Nota:</strong> Este manual está diseñado para guiar a usuarios y personal en el correcto uso del sistema TodoTech Shop. Cada sección incluye instrucciones detalladas y mejores prácticas.
        </div>
        
        <div class="page-number">Página 2 de 10</div>
    </div>

    <!-- Página 3 - Sección 1 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">1</span> Ver Catálogo de Productos</h1>
            <p>Acceso público al catálogo electrónico de TodoTech Shop</p>
        </div>
        
        <div class="note-box">
            <strong>🎯 Propósito:</strong> Permitir a los clientes explorar nuestros productos disponibles antes de visitar la tienda física.
        </div>
        
        <h2>Acceso al Catálogo</h2>
        
        <div class="step-indicator">
            <div class="step-number">1</div>
            <div class="step-content">
                <h3>Ingresar a la URL del Sistema</h3>
                <div class="url-box">http://todotech-frontend.s3-website.us-east-2.amazonaws.com/catalogo-cliente</div>
                <p>Esta dirección es de acceso público y no requiere credenciales.</p>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">2</div>
            <div class="step-content">
                <h3>Navegar por el Catálogo</h3>
                <p>Una vez en la página, podrás:</p>
                <ul>
                    <li>🔍 Ver productos organizados por categorías</li>
                    <li>📱 Filtrar por marca, precio o características técnicas</li>
                    <li>💡 Ver detalles completos de cada producto</li>
                    <li>📊 Ver disponibilidad en tiempo real</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">3</div>
            <div class="step-content">
                <h3>Botón "Ingresar al Catálogo"</h3>
                <p>Al acceder a la URL, encontrarás un botón prominente que dice <strong>"Ingresar al Catálogo"</strong>. Al hacer clic:</p>
                <ul>
                    <li>Se cargará la interfaz completa del catálogo</li>
                    <li>Podrás ver todos los productos disponibles</li>
                    <li>Tendrás acceso a filtros avanzados</li>
                    <li>Verás precios actualizados</li>
                </ul>
            </div>
        </div>
        
        <div class="success-box">
            <strong>✅ Beneficios:</strong> 
            <ul>
                <li>Consulta 24/7 desde cualquier dispositivo</li>
                <li>Información actualizada en tiempo real</li>
                <li>Previsualización antes de la compra</li>
                <li>Comparación de productos fácil</li>
            </ul>
        </div>
        
        <div class="page-number">Página 3 de 10</div>
    </div>

    <!-- Página 4 - Sección 2 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">2</span> Proceso de Compra en Tienda</h1>
            <p>Gestión completa de ventas por parte del vendedor</p>
        </div>
        
        <div class="warning-box">
            <strong>⚠️ Importante:</strong> Este proceso solo puede ser realizado por vendedores autorizados con credenciales válidas.
        </div>
        
        <h2>Flujo del Proceso de Venta</h2>
        
        <div class="step-indicator">
            <div class="step-number">1</div>
            <div class="step-content">
                <h3>Inicio de Sesión del Vendedor</h3>
                <p>El vendedor debe acceder al sistema con sus credenciales:</p>
                <div class="url-box">http://todotech-frontend.s3-website.us-east-2.amazonaws.com/catalogo-cliente</div>
                <ul>
                    <li>Usuario: [número de empleado o email]</li>
                    <li>Contraseña: [contraseña personal]</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">2</div>
            <div class="step-content">
                <h3>Creación de Orden de Venta</h3>
                <p>En el módulo de ventas, el vendedor:</p>
                <ul>
                    <li>Hace clic en "Nueva Orden"</li>
                    <li>Registra los datos del cliente (con consentimiento)</li>
                    <li>Selecciona la tienda física correspondiente</li>
                    <li>Asigna número de orden automático</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">3</div>
            <div class="step-content">
                <h3>Agregar Productos al Carrito</h3>
                <p>Desde el catálogo interno, el vendedor:</p>
                <ul>
                    <li>Busca productos por código o nombre</li>
                    <li>Verifica stock disponible en tiempo real</li>
                    <li>Agrega cantidades requeridas</li>
                    <li>Aplica promociones vigentes</li>
                    <li>Confirma precios y totales</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">4</div>
            <div class="step-content">
                <h3>Generación de Comprobante</h3>
                <p>Al finalizar la selección:</p>
                <ul>
                    <li>Sistema calcula totales automáticamente</li>
                    <li>Genera número de orden único</li>
                    <li>Imprime comprobante preliminar</li>
                    <li>Entrega número de orden al cliente</li>
                </ul>
            </div>
        </div>
        
        <div class="page-number">Página 4 de 10</div>
    </div>

    <!-- Página 5 - Sección 3 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">3</span> Pago en Módulo de Caja</h1>
            <p>Procesamiento seguro de pagos y cierre de venta</p>
        </div>
        
        <h2>Proceso de Pago</h2>
        
        <div class="step-indicator">
            <div class="step-number">1</div>
            <div class="step-content">
                <h3>Recepción en Caja</h3>
                <p>El cliente se dirige al módulo de caja con:</p>
                <ul>
                    <li>Número de orden generado</li>
                    <li>Productos seleccionados</li>
                    <li>Método de pago elegido</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">2</div>
            <div class="step-content">
                <h3>Consulta de Orden por Cajero</h3>
                <p>El cajero accede al sistema y:</p>
                <ul>
                    <li>Ingresa el número de orden</li>
                    <li>Verifica productos y montos</li>
                    <li>Confirma disponibilidad de stock</li>
                    <li>Prepara transacción de pago</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">3</div>
            <div class="step-content">
                <h3>Procesamiento de Pago</h3>
                <p>El sistema permite dos métodos principales:</p>
                
                <div class="feature-grid">
                    <div class="feature-card">
                        <h4>💵 Pago en Efectivo</h4>
                        <ul>
                            <li>Ingreso del monto recibido</li>
                            <li>Cálculo automático de vuelto</li>
                            <li>Registro en caja correspondiente</li>
                            <li>Comprobante impreso</li>
                        </ul>
                    </div>
                    <div class="feature-card">
                        <h4>💳 Pago con Stripe</h4>
                        <ul>
                            <li>Integración con pasarela Stripe</li>
                            <li>Procesamiento seguro de tarjetas</li>
                            <li>Tokenización de datos sensibles</li>
                            <li>Comprobante digital e impreso</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">4</div>
            <div class="step-content">
                <h3>Cierre y Entrega</h3>
                <p>Una vez confirmado el pago:</p>
                <ul>
                    <li>Sistema actualiza estado de la orden</li>
                    <li>Genera comprobante final</li>
                    <li>Actualiza inventario automáticamente</li>
                    <li>Entrega orden a despacho</li>
                </ul>
            </div>
        </div>
        
        <div class="page-number">Página 5 of 10</div>
    </div>

    <!-- Página 6 - Sección 4 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">4</span> Recuperación de Contraseña</h1>
            <p>Sistema seguro de recuperación de acceso</p>
        </div>
        
        <h2>Proceso de Recuperación</h2>
        
        <div class="step-indicator">
            <div class="step-number">1</div>
            <div class="step-content">
                <h3>Acceso a Recuperación</h3>
                <p>En la pantalla de login:</p>
                <ul>
                    <li>Hacer clic en "¿Olvidaste tu contraseña?"</li>
                    <li>Ingresar email registrado en el sistema</li>
                    <li>Hacer clic en "Enviar enlace de recuperación"</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">2</div>
            <div class="step-content">
                <h3>Recepción de Email</h3>
                <p>El sistema enviará un email con:</p>
                <ul>
                    <li>Enlace único de recuperación (válido por 24 horas)</li>
                    <li>Instrucciones paso a paso</li>
                    <li>Información de seguridad</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">3</div>
            <div class="step-content">
                <h3>Creación de Nueva Contraseña</h3>
                <p>Al acceder al enlace:</p>
                <ul>
                    <li>Ingresar nueva contraseña (mínimo 8 caracteres)</li>
                    <li>Confirmar nueva contraseña</li>
                    <li>Hacer clic en "Actualizar contraseña"</li>
                    <li>Recibir confirmación por email</li>
                </ul>
            </div>
        </div>
        
        <div class="warning-box">
            <strong>🔒 Requisitos de Seguridad:</strong>
            <ul>
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un carácter especial</li>
                <li>No usar contraseñas anteriores</li>
            </ul>
        </div>
        
        <div class="page-number">Página 6 of 10</div>
    </div>

    <!-- Página 7 - Sección 5 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">5</span> Verificación de Stock</h1>
            <p>Control en tiempo real de inventario</p>
        </div>
        
        <h2>Consulta de Disponibilidad</h2>
        
        <div class="step-indicator">
            <div class="step-number">1</div>
            <div class="step-content">
                <h3>Acceso al Módulo de Inventario</h3>
                <p>Usuarios autorizados pueden:</p>
                <ul>
                    <li>Acceder a "Gestión de Inventario"</li>
                    <li>Ver stock actual por tienda</li>
                    <li>Consultar movimientos recientes</li>
                    <li>Revisar niveles mínimos</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">2</div>
            <div class="step-content">
                <h3>Búsqueda de Productos</h3>
                <p>Múltiples métodos de consulta:</p>
                <ul>
                    <li>🔍 Por código SKU</li>
                    <li>📝 Por nombre o descripción</li>
                    <li>🏷️ Por categoría o marca</li>
                    <li>📊 Por nivel de stock</li>
                </ul>
            </div>
        </div>
        
        <div class="step-indicator">
            <div class="step-number">3</div>
            <div class="step-content">
                <h3>Información en Tiempo Real</h3>
                <p>El sistema muestra:</p>
                <ul>
                    <li>Stock disponible actual</li>
                    <li>Stock comprometido en órdenes</li>
                    <li>Stock en tránsito</li>
                    <li>Histórico de movimientos</li>
                </ul>
            </div>
        </div>
        
        <div class="success-box">
            <strong>📈 Beneficios del Sistema:</strong>
            <ul>
                <li>Actualización automática con cada venta</li>
                <li>Alertas de stock bajo</li>
                <li>Prevención de ventas sin stock</li>
                <li>Optimización de inventario</li>
            </ul>
        </div>
        
        <div class="page-number">Página 7 of 10</div>
    </div>

    <!-- Página 8 - Sección 6 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">6</span> Gestión Administrativa</h1>
            <p>Funcionalidades exclusivas para administradores</p>
        </div>
        
        <div class="warning-box">
            <strong>⚡ Solo Personal Autorizado:</strong> Estas funciones están restringidas a usuarios con rol de Administrador.
        </div>
        
        <h2>Módulos de Administración</h2>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h4>👥 Gestión de Usuarios</h4>
                <ul>
                    <li>Crear y editar usuarios</li>
                    <li>Asignar roles y permisos</li>
                    <li>Resetear contraseñas</li>
                    <li>Auditar actividades</li>
                </ul>
            </div>
            <div class="feature-card">
                <h4>📦 Gestión de Productos</h4>
                <ul>
                    <li>Alta/baja de productos</li>
                    <li>Actualización de precios</li>
                    <li>Gestión de categorías</li>
                    <li>Configuración de promociones</li>
                </ul>
            </div>
            <div class="feature-card">
                <h4>🏪 Configuración de Tiendas</h4>
                <ul>
                    <li>Gestión de sucursales</li>
                    <li>Configuración horaria</li>
                    <li>Parámetros del sistema</li>
                    <li>Integraciones externas</li>
                </ul>
            </div>
        </div>
        
        <h2>Procesos Administrativos Clave</h2>
        
        <div class="process-step">
            <h3>Cierre Diario de Caja</h3>
            <p>Proceso automatizado que incluye:</p>
            <ul>
                <li>Conciliación de ventas vs pagos</li>
                <li>Reporte de movimientos de caja</li>
                <li>Verificación de arqueos</li>
                <li>Cierre contable automático</li>
            </ul>
        </div>
        
        <div class="process-step">
            <h3>Gestión de Precios</h3>
            <p>Sistema centralizado de precios:</p>
            <ul>
                <li>Actualizaciones masivas</li>
                <li>Promociones temporales</li>
                <li>Precios especiales por cliente</li>
                <li>Histórico de cambios</li>
            </ul>
        </div>
        
        <div class="page-number">Página 8 of 10</div>
    </div>

    <!-- Página 9 - Sección 7 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">7</span> Reportes y Análitica</h1>
            <p>Business Intelligence para toma de decisiones</p>
        </div>
        
        <h2>Reportes Disponibles</h2>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h4>📊 Ventas por Período</h4>
                <ul>
                    <li>Ventas diarias/semanales/mensuales</li>
                    <li>Comparativo con períodos anteriores</li>
                    <li>Análisis por vendedor</li>
                    <li>Ventas por categoría</li>
                </ul>
            </div>
            <div class="feature-card">
                <h4>📈 Métricas de Desempeño</h4>
                <ul>
                    <li>Ticket promedio</li>
                    <li>Productos más vendidos</li>
                    <li>Conversión de ventas</li>
                    <li>Eficiencia por tienda</li>
                </ul>
            </div>
            <div class="feature-card">
                <h4>📉 Análisis de Inventario</h4>
                <ul>
                    <li>Rotación de stock</li>
                    <li>Productos lentos</li>
                    <li>Óptimos de reposición</li>
                    <li>Análisis ABC</li>
                </ul>
            </div>
        </div>
        
        <h2>Exportación de Datos</h2>
        
        <div class="process-step">
            <p>Todos los reportes pueden exportarse en:</p>
            <ul>
                <li>📄 PDF (para presentaciones)</li>
                <li>📊 Excel (para análisis avanzado)</li>
                <li>📋 CSV (para integraciones)</li>
            </ul>
        </div>
        
        <div class="note-box">
            <strong>💡 Tip:</strong> Utiliza los filtros de fecha y los agrupamientos por categoría para obtener insights más específicos de tu negocio.
        </div>
        
        <div class="page-number">Página 9 of 10</div>
    </div>

    <!-- Página 10 - Sección 8 -->
    <div class="manual-page">
        <div class="header">
            <h1><span class="section-number">8</span> Soporte Técnico</h1>
            <p>Asistencia y recursos disponibles</p>
        </div>
        
        <h2>Canales de Soporte</h2>
        
        <div class="feature-grid">
            <div class="feature-card">
                <h4>📞 Soporte Telefónico</h4>
                <p><strong>+56 2 2345 6789</strong></p>
                <p>Lunes a Viernes: 9:00 - 18:00 hrs</p>
                <p>Sábados: 9:00 - 14:00 hrs</p>
            </div>
            <div class="feature-card">
                <h4>📧 Soporte por Email</h4>
                <p><strong>soporte@todotechshop.cl</strong></p>
                <p>Respuesta en menos de 4 horas hábiles</p>
            </div>
            <div class="feature-card">
                <h4>🆘 Emergencias Técnicas</h4>
                <p><strong>+56 9 8765 4321</strong></p>
                <p>24/7 para problemas críticos del sistema</p>
            </div>
        </div>
        
        <h2>Recursos Adicionales</h2>
        
        <div class="process-step">
            <h3>Base de Conocimiento</h3>
            <p>Acceso a documentación completa:</p>
            <ul>
                <li>Manuales de procedimiento</li>
                <li>Video-tutoriales</li>
                <li>FAQ actualizada</li>
                <li>Guías rápidas por rol</li>
            </ul>
        </div>
        
        <div class="process-step">
            <h3>Capacitación Continua</h3>
            <p>Programas de entrenamiento:</p>
            <ul>
                <li>Onboarding para nuevos usuarios</li>
                <li>Capacitación de nuevas funcionalidades</li>
                <li>Sesiones de refresco mensuales</li>
                <li>Certificación por roles</li>
            </ul>
        </div>
        
        <div class="success-box" style="text-align: center; margin-top: 40px;">
            <h3>🚀 ¡Gracias por usar TodoTech Shop!</h3>
            <p>Estamos comprometidos con tu éxito y la excelencia en el servicio al cliente.</p>
        </div>
        
        <div class="page-number">Página 10 of 10</div>
    </div>
</body>
</html>
    `;
  }
}