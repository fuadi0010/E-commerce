import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans flex flex-col">
      <app-navbar></app-navbar>
      
      <!-- Konten publik (Katalog, Detail Produk) -->
      <main class="flex-grow w-full">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer Publik Sederhana -->
      <footer class="bg-white border-t border-gray-200 mt-12">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p class="text-center text-sm text-gray-500">
            &copy; 2026 Antigravity E-Commerce. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent {
}
