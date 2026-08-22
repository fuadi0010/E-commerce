import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { DashboardLayoutComponent } from './shared/components/layout/dashboard-layout.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './shared/components/layout/public-layout.component';
import { ProductCatalogComponent } from './features/catalog/pages/catalog/catalog.component';
import { ProductDetailComponent } from './features/catalog/pages/product-detail/product-detail.component';

export const routes: Routes = [
  // Public Storefront Routes
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
      { path: 'catalog', component: ProductCatalogComponent },
      { path: 'product/:slug', component: ProductDetailComponent },
      { path: 'cart', loadComponent: () => import('./features/cart/pages/cart/cart.component').then(m => m.CartComponent) },
      { 
        path: 'checkout', 
        loadComponent: () => import('./features/checkout/pages/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [authGuard]
      }
    ]
  },

  // Auth Routes (Public)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // Protected Routes (Nested under Layout)
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  
  // Fallback Route
  { path: '**', redirectTo: 'dashboard' }
];
