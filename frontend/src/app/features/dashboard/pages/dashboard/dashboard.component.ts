import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../../core/services/token.service';
import { OrderService } from '../../../../core/services/order.service';
import { OrderResponse } from '../../../../core/models/order.model';
import { PageResponse } from '../../../../core/models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white overflow-hidden shadow-sm rounded-lg p-6 mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Welcome to Dashboard!</h2>
      <p class="text-gray-600 mb-6">Hello <span class="font-semibold text-indigo-600">{{ userEmail }}</span>, this is your private space.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
          <h3 class="text-lg font-semibold text-indigo-800">Total Orders</h3>
          <p class="text-3xl font-bold text-indigo-600 mt-2">{{ pageData?.totalElements || 0 }}</p>
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

    <!-- Order History -->
    <div class="bg-white overflow-hidden shadow-sm rounded-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Order History</h2>
      
      <div *ngIf="isLoading" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div *ngIf="!isLoading && orders.length === 0" class="text-center py-8 text-gray-500">
        You haven't placed any orders yet.
      </div>

      <div *ngIf="!isLoading && orders.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let order of orders">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                #{{ order.id.substring(0, 8) }}...
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ order.createdAt | date:'medium' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                \${{ order.totalAmount }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private tokenService = inject(TokenService);
  private orderService = inject(OrderService);

  orders: OrderResponse[] = [];
  pageData: PageResponse<OrderResponse> | null = null;
  isLoading = false;

  get userEmail(): string {
    const user = this.tokenService.getUserInfo();
    return user ? user.email : 'User';
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getMyOrders(0, 10).subscribe({
      next: (response) => {
        if (response.data) {
          this.pageData = response.data;
          this.orders = response.data.content;
        }
      },
      error: (error) => {
        console.error('Failed to load orders', error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
