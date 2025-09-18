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

// Importar las funciones de guardia (no clases)
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard]  // Usar la función publicGuard
  },
  { 
    path: 'acceso-denegado', 
    component: AccesoDenegadoComponent
  },
  
  // 🔒 RUTAS PROTEGIDAS POR AUTENTICACIÓN Y ROLES
  { 
    path: 'inicio', 
    component: InicioComponent, 
    canActivate: [authGuard],  // Usar la función authGuard
    data: { roles: ['ADMIN', 'VENDEDOR', 'CAJERO', 'DESPACHADOR'] }
  },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [authGuard, roleGuard],  // Usar las funciones
    data: { role: 'ADMIN' }
  },
  { 
    path: 'phone', 
    component: PhoneComponent, 
    canActivate: [authGuard],  // Usar la función authGuard
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'gaming', 
    component: GamingComponent, 
    canActivate: [authGuard],  // Usar la función authGuard
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'laptops', 
    component: LaptopsComponent, 
    canActivate: [authGuard],  // Usar la función authGuard
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'accesorios', 
    component: AccesoriosComponent, 
    canActivate: [authGuard],  // Usar la función authGuard
    data: { roles: ['ADMIN', 'VENDEDOR'] }
  },
  { 
    path: 'caja', 
    component: CajaComponent, 
    canActivate: [authGuard, roleGuard],  // Usar las funciones
    data: { role: 'CAJERO' }
  },
  { 
    path: 'despacho', 
    component: DespachoComponent, 
    canActivate: [authGuard, roleGuard],  // Usar las funciones
    data: { role: 'DESPACHADOR' }
  },
  { 
    path: 'ordenVenta', 
    component: OrdenVentaComponent, 
    canActivate: [authGuard, roleGuard],  // Usar las funciones
    data: { role: 'VENDEDOR' }
  },
  
  { 
    path: '**', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  }
];