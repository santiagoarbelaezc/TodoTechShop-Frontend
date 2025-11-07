// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AdminComponent } from './pages/admin/admin.component';
import { PhoneComponent } from './pages/phone/phone.component';
import { GamingComponent } from './pages/gaming/gaming.component';
import { LaptopsComponent } from './pages/laptops/laptops.component';
import { AccesoriosComponent } from './pages/accesorios/accesorios.component';
import { OrdenVentaComponent } from './pages/orden-venta/orden-venta.component';
import { CajaComponent } from './pages/caja/caja.component';
import { DespachoComponent } from './pages/despacho/despacho.component';
import { AccesoDenegadoComponent } from './pages/acceso-denegado/acceso-denegado.component';
import { RecuperarContrasenaComponent } from './pages/recuperar-contrasena/recuperar-contrasena.component';

// Importar las funciones de guardia
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { roleGuard } from './guards/role.guard';
import { ManualUsuarioComponent } from './pages/manual-usuario/manual-usuario.component';
import { ProductoComponent } from './pages/admin/producto/producto.component';
import { CreacionComponent } from './pages/admin/creacion/creacion.component';
import { TablaUsuariosComponent } from './pages/admin/tabla-usuarios/tabla-usuarios.component';
import { DescripcionproductoComponent } from './pages/inicio/descripcionproducto/descripcionproducto.component';
import { BuscarInicioComponent } from './pages/inicio/buscar-inicio/buscar-inicio.component';
import { ClientesComponent } from './pages/orden-venta/clientes/clientes.component';
import { OrdenesActivasComponent } from './pages/orden-venta/ordenes-activas/ordenes-activas.component';
import { OrdenesAdminComponent } from './pages/admin/ordenes-admin/ordenes-admin.component';
import { ResumenOrdenComponent } from './pages/orden-venta/resumen-orden/resumen-orden.component';
import { CajaInicioComponent } from './pages/caja/caja-inicio/caja-inicio.component';
import { CatalogoComponent } from './pages/cliente/catalogo/catalogo.component';
import { StripeCheckoutComponent } from './pages/stripe-checkout/stripe-checkout.component';

export const routes: Routes = [
  // 🔓 RUTAS PÚBLICAS
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  { 
    path: 'recuperar-contrasena', 
    component: RecuperarContrasenaComponent,
    canActivate: [publicGuard]
  },
  { 
    path: 'manual-usuario', 
    component: ManualUsuarioComponent,
    canActivate: [publicGuard]
  },
  { 
    path: 'catalogo-cliente', 
    component: CatalogoComponent
  },
  { 
    path: 'acceso-denegado', 
    component: AccesoDenegadoComponent
  },
  
  // 🔒 RUTAS PROTEGIDAS POR AUTENTICACIÓN Y ROLES
  { 
    path: 'inicio', 
    component: InicioComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEDOR', 'ADMIN'] } // ✅ VENDEDOR y ADMIN pueden acceder
  },
  { 
    path: 'descripcion-producto', 
    component: DescripcionproductoComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEDOR', 'ADMIN'] } // ✅ VENDEDOR y ADMIN pueden acceder
  },
  { 
    path: 'buscar-producto', 
    component: BuscarInicioComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEDOR', 'ADMIN'] } // ✅ VENDEDOR y ADMIN pueden acceder
  },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin-productos', 
    component: ProductoComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin-creacion', 
    component: CreacionComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  { 
    path: 'admin-ordenes', 
    component: OrdenesAdminComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  { 
    path: 'admin-tabla', 
    component: TablaUsuariosComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'phone', 
    component: PhoneComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'gaming', 
    component: GamingComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'laptops', 
    component: LaptopsComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'accesorios', 
    component: AccesoriosComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'caja', 
    component: CajaComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CAJERO'] }
  },

  { 
    path: 'checkout', 
    component: StripeCheckoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CAJERO'] }
  },
  
  { 
    path: 'despacho', 
    component: DespachoComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DESPACHADOR'] }
  },
  { 
    path: 'ordenVenta', 
    component: OrdenVentaComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEDOR'] }
  },
   { 
    path: 'ordenVenta/resumen-orden', 
    component: ResumenOrdenComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEDOR'] }
  },
  { 
    path: 'ordenVenta/clientes-registrados', 
    component: ClientesComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEDOR'] }
  },
  { 
    path: 'ordenVenta/ordenes-activas', 
    component: OrdenesActivasComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['VENDEDOR'] }
  },

  { 
    path: 'caja-inicio', 
    component: CajaInicioComponent 
    
  },
  
  // 🎯 RUTA COMODÍN (siempre al final)
  { 
    path: '**', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  }
];