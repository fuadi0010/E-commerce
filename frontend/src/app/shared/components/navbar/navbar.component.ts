import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';

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
              <a routerLink="/dashboard" class="font-bold text-xl tracking-wider">Antigravity E-Commerce</a>
            </div>
            <!-- Main Nav (Tampil jika sudah login) -->
            <div class="hidden md:block" *ngIf="tokenService.isAuth()">
              <div class="ml-10 flex items-baseline space-x-4">
                <a routerLink="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">Dashboard</a>
                <a routerLink="/profile" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">Profile</a>
                <!-- TODO: Navigasi Admin jika role === ADMIN -->
              </div>
            </div>
          </div>
          
          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
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

  get userEmail(): string {
    const user = this.tokenService.getUserInfo();
    return user ? user.email : '';
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
