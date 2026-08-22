import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-100 font-sans">
      <app-navbar></app-navbar>
      
      <!-- Konten dinamis (dashboard, profile, dll) dimuat di sini -->
      <main class="py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class DashboardLayoutComponent {
}
