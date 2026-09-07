import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { DashboardLayoutComponent } from './shared/components/layout/dashboard-layout.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { PublicLayoutComponent } from './shared/components/layout/public-layout.component';
import { ProductCatalogComponent } from './features/catalog/pages/catalog/catalog.component';
import { ProductDetailComponent } from './features/catalog/pages/product-detail/product-detail.component';
import { AdminLayoutComponent } from './shared/components/layout/admin-layout/admin-layout.component';
import { CategoryListComponent } from './features/admin/pages/category-list/category-list.component';
import { CategoryCreateComponent } from './features/admin/pages/category-create/category-create.component';
import { ProductListComponent } from './features/admin/pages/product-list/product-list.component';
import { ProductFormComponent } from './features/admin/pages/product-form/product-form.component';
import { OrderListComponent } from './features/admin/pages/order-list/order-list.component';
import { VoucherListComponent } from './features/admin/pages/voucher-list/voucher-list.component';
import { UserListComponent } from './features/admin/pages/user-list/user-list.component';
import { OrderHistoryComponent } from './features/orders/pages/order-history/order-history.component';

// Rule 57: Error page components
import { NotFoundComponent } from './shared/components/error-pages/not-found/not-found.component';
import { UnauthorizedComponent } from './shared/components/error-pages/unauthorized/unauthorized.component';
import { ForbiddenComponent } from './shared/components/error-pages/forbidden/forbidden.component';
import { ServerErrorComponent } from './shared/components/error-pages/server-error/server-error.component';

export const routes: Routes = [
  // Public Storefront Routes
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
      { path: 'catalog', component: ProductCatalogComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/pages/cart/cart.component').then(m => m.CartComponent)
      },
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

  // Protected Routes (Nested under Layout) — Rule 45
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'orders', component: OrderHistoryComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  // Admin Routes — Rule 45
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'categories/new', component: CategoryCreateComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/edit/:id', component: ProductFormComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'vouchers', component: VoucherListComponent },
      { path: 'users', component: UserListComponent }
    ]
  },

  // Rule 57: Error Pages
  { path: '401', component: UnauthorizedComponent },
  { path: '403', component: ForbiddenComponent },
  { path: '500', component: ServerErrorComponent },

  // Rule 57: 404 wildcard — harus paling bawah
  { path: '**', component: NotFoundComponent }
];
