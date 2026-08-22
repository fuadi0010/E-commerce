import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white overflow-hidden shadow-sm rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Welcome to Dashboard!</h2>
      <p class="text-gray-600 mb-6">Hello <span class="font-semibold text-indigo-600">{{ userEmail }}</span>, this is your private space.</p>
      
      <!-- Placeholder untuk statisik/produk di masa depan -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
          <h3 class="text-lg font-semibold text-indigo-800">Total Orders</h3>
          <p class="text-3xl font-bold text-indigo-600 mt-2">0</p>
        </div>
        <div class="bg-green-50 p-6 rounded-lg border border-green-100">
          <h3 class="text-lg font-semibold text-green-800">Wishlist</h3>
          <p class="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div class="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 class="text-lg font-semibold text-blue-800">Coupons</h3>
          <p class="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private tokenService = inject(TokenService);

  get userEmail(): string {
    const user = this.tokenService.getUserInfo();
    return user ? user.email : 'User';
  }
}
