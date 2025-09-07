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
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // 🔒 TODAS estas rutas protegidas
  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'phone', component: PhoneComponent, canActivate: [AuthGuard] },
  { path: 'gaming', component: GamingComponent, canActivate: [AuthGuard] },
  { path: 'laptops', component: LaptopsComponent, canActivate: [AuthGuard] },
  { path: 'accesorios', component: AccesoriosComponent, canActivate: [AuthGuard] },
  { path: 'caja', component: CajaComponent, canActivate: [AuthGuard] },
  { path: 'despacho', component: DespachoComponent, canActivate: [AuthGuard] },
  { path: 'ordenVenta', component: OrdenVentaComponent, canActivate: [AuthGuard] },
  
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];