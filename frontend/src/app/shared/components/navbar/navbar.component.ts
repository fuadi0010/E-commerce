import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="sticky top-3 sm:top-4 z-50 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <nav class="bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-ambient px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        <!-- Brand / Logo -->
        <div class="flex items-center gap-6">
          <a routerLink="/catalog" (click)="closeMobileMenu()" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              <span>A</span>
            </div>
            <div class="flex flex-col">
              <span class="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">AURA</span>
              <span class="text-[10px] tracking-widest text-slate-600 uppercase font-semibold -mt-1">Commerce</span>
            </div>
          </a>

          <!-- Desktop Navigation Links -->
          <div class="hidden lg:flex items-center gap-1 pl-2">
            <a routerLink="/catalog" routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold" [routerLinkActiveOptions]="{exact: true}"
              class="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
              Katalog
            </a>
            <ng-container *ngIf="tokenService.isAuth()">
              <a routerLink="/dashboard" routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold"
                class="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
                Dashboard
              </a>
              <a routerLink="/profile" routerLinkActive="text-indigo-600 bg-indigo-50/70 font-semibold"
                class="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors">
                Profil
              </a>
              <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="bg-slate-900 text-white"
                class="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Admin Panel
              </a>
            </ng-container>
          </div>
        </div>

        <!-- Center Search Bar (Desktop) -->
        <div class="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
          <form (ngSubmit)="onSearchSubmit()" class="relative w-full">
            <input type="text" [(ngModel)]="searchQuery" name="navSearch"
              placeholder="Cari koleksi produk..."
              class="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </form>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-2.5">
          
          <!-- Cart Button -->
          <a routerLink="/cart" (click)="closeMobileMenu()" aria-label="Lihat Keranjang Belanja"
            class="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-xl transition-colors btn-press">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span *ngIf="cartService.cartTotalCount() > 0" 
              class="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
              {{ cartService.cartTotalCount() }}
            </span>
          </a>

          <!-- User Authentication Actions (Desktop) -->
          <div class="hidden sm:flex items-center gap-2 pl-1 border-l border-slate-200/70">
            <ng-container *ngIf="!tokenService.isAuth(); else loggedInDesktop">
              <a routerLink="/login" class="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                Masuk
              </a>
              <a routerLink="/register" class="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all btn-press">
                Daftar
              </a>
            </ng-container>
            
            <ng-template #loggedInDesktop>
              <div class="flex items-center gap-2.5">
                <a routerLink="/profile" class="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-slate-100/70 transition-colors text-left">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {{ userInitial }}
                  </div>
                  <div class="hidden xl:block">
                    <span class="block text-xs font-semibold text-slate-900 max-w-[120px] truncate">{{ userEmail }}</span>
                  </div>
                </a>
                <button (click)="logout()" title="Logout"
                  class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors btn-press">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
            </ng-template>
          </div>

          <!-- Mobile Hamburger Button -->
          <button (click)="toggleMobileMenu()" aria-label="Toggle Menu"
            class="lg:hidden p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 rounded-xl transition-colors">
            <svg *ngIf="!isMobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <svg *ngIf="isMobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </nav>

      <!-- Mobile Dropdown Drawer -->
      <div *ngIf="isMobileMenuOpen" 
        class="lg:hidden mt-2 p-4 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-ambient-lg flex flex-col gap-4 animate-fade-in-down">
        
        <!-- Mobile Search -->
        <form (ngSubmit)="onSearchSubmit()" class="relative w-full">
          <input type="text" [(ngModel)]="searchQuery" name="navMobileSearch"
            placeholder="Cari produk..."
            class="w-full pl-9 pr-4 py-2.5 bg-slate-100 text-xs text-slate-900 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </form>

        <!-- Mobile Links -->
        <div class="flex flex-col gap-1">
          <a routerLink="/catalog" (click)="closeMobileMenu()" routerLinkActive="text-indigo-600 bg-indigo-50 font-semibold"
            class="px-3.5 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-colors">
            Katalog Produk
          </a>
          
          <ng-container *ngIf="tokenService.isAuth()">
            <a routerLink="/dashboard" (click)="closeMobileMenu()" routerLinkActive="text-indigo-600 bg-indigo-50 font-semibold"
              class="px-3.5 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-colors">
              Dashboard Saya
            </a>
            <a routerLink="/profile" (click)="closeMobileMenu()" routerLinkActive="text-indigo-600 bg-indigo-50 font-semibold"
              class="px-3.5 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-100 transition-colors">
              Pengaturan Profil
            </a>
            <a *ngIf="isAdmin" routerLink="/admin" (click)="closeMobileMenu()"
              class="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white transition-colors flex items-center justify-between mt-1">
              <span>Admin Panel</span>
              <span class="text-xs text-slate-400">&rarr;</span>
            </a>
          </ng-container>
        </div>

        <!-- Mobile Auth Footer -->
        <div class="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <ng-container *ngIf="!tokenService.isAuth()">
            <div class="grid grid-cols-2 gap-2">
              <a routerLink="/login" (click)="closeMobileMenu()"
                class="text-center py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Masuk
              </a>
              <a routerLink="/register" (click)="closeMobileMenu()"
                class="text-center py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors">
                Daftar Akun
              </a>
            </div>
          </ng-container>

          <ng-container *ngIf="tokenService.isAuth()">
            <div class="flex items-center justify-between px-2 py-1">
              <span class="text-xs text-slate-500 truncate max-w-[200px]">{{ userEmail }}</span>
              <button (click)="logout(); closeMobileMenu()" class="text-xs font-bold text-rose-600 hover:underline">
                Keluar
              </button>
            </div>
          </ng-container>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private router = inject(Router);
  public cartService = inject(CartService);

  searchQuery = '';
  isMobileMenuOpen = false;

  get userEmail(): string {
    const user = this.tokenService.getUserInfo();
    return user ? user.email : '';
  }

  get userInitial(): string {
    const email = this.userEmail;
    return email ? email.charAt(0).toUpperCase() : 'U';
  }

  get isAdmin(): boolean {
    const user = this.tokenService.getUserInfo();
    return user ? user.roles.includes('ROLE_ADMIN') : false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onSearchSubmit() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { search: this.searchQuery.trim() } });
      this.closeMobileMenu();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
