import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-indigo-600 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <a routerLink="/catalog" class="font-bold text-xl tracking-wider">Antigravity E-Commerce</a>
            </div>
            <!-- Main Nav (Tampil jika sudah login) -->
            <div class="hidden md:block" *ngIf="tokenService.isAuth()">
              <div class="ml-10 flex items-baseline space-x-4">
                <a routerLink="/catalog" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">Catalog</a>
                <a routerLink="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">Dashboard</a>
                <a routerLink="/profile" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">Profile</a>
                <a *ngIf="isAdmin" routerLink="/admin" class="px-3 py-2 rounded-md text-sm font-bold bg-indigo-800 text-white hover:bg-indigo-900 transition-colors">Admin Panel</a>
              </div>
            </div>
            <div class="hidden md:block" *ngIf="!tokenService.isAuth()">
              <div class="ml-10 flex items-baseline space-x-4">
                <a routerLink="/catalog" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">Catalog</a>
              </div>
            </div>
          </div>
          
          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6 space-x-4">
              <!-- Cart Icon -->
              <a routerLink="/cart" class="relative p-2 text-indigo-200 hover:text-white transition-colors">
                <span class="sr-only">View cart</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span *ngIf="cartService.cartTotalCount() > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
                  {{ cartService.cartTotalCount() }}
                </span>
              </a>

              <!-- Jika belum login -->
              <ng-container *ngIf="!tokenService.isAuth(); else loggedInMenu">
                <a routerLink="/login" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">Login</a>
                <a routerLink="/register" class="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-gray-100 transition-colors">Register</a>
              </ng-container>

              <!-- Jika sudah login -->
              <ng-template #loggedInMenu>
                <div class="flex items-center space-x-4">
                  <span class="text-sm">Hi, {{ userEmail }}</span>
                  <button (click)="logout()" class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-700 hover:bg-indigo-800 transition-colors">
                    Logout
                  </button>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private router = inject(Router);
  public cartService = inject(CartService);

  get userEmail(): string {
    const user = this.tokenService.getUserInfo();
    return user ? user.email : '';
  }

  get isAdmin(): boolean {
    const user = this.tokenService.getUserInfo();
    return user ? user.roles.includes('ROLE_ADMIN') : false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Logout dari token lokal walau API gagal
        this.router.navigate(['/login']);
      }
    });
  }
}
