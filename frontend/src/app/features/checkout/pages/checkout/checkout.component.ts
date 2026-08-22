import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { OrderRequest } from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-gray-50 min-h-screen pt-10 pb-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto lg:max-w-none">
          <h1 class="sr-only">Checkout</h1>

          <form class="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16" (ngSubmit)="onSubmit($event)">
            <div>
              <div class="mt-10 pt-10 border-t border-gray-200">
                <h2 class="text-lg font-medium text-gray-900">Payment & Confirmation</h2>
                <p class="mt-2 text-sm text-gray-500">
                  By clicking "Confirm Order", you agree to our Terms and Conditions. Please review your order details before proceeding.
                </p>
                <div class="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <p class="text-sm text-gray-700">Currently, payment is simulated and cash-on-delivery or dummy gateways are assumed for this project.</p>
                </div>
              </div>
            </div>

            <!-- Order summary -->
            <div class="mt-10 lg:mt-0">
              <h2 class="text-lg font-medium text-gray-900">Order summary</h2>

              <div class="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 class="sr-only">Items in your cart</h3>
                <ul role="list" class="divide-y divide-gray-200">
                  <li *ngFor="let item of cartService.cartItems()" class="flex py-6 px-4 sm:px-6">
                    <div class="flex-shrink-0">
                      <div class="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                        <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <div class="ml-6 flex-1 flex flex-col">
                      <div class="flex">
                        <div class="min-w-0 flex-1">
                          <h4 class="text-sm">
                            <a [routerLink]="['/product', item.product.slug]" class="font-medium text-gray-700 hover:text-gray-800">
                              {{ item.product.name }}
                            </a>
                          </h4>
                          <p class="mt-1 text-sm text-gray-500">{{ item.product.category?.name }}</p>
                        </div>

                        <div class="ml-4 flex-shrink-0 flow-root">
                          <p class="text-sm font-medium text-gray-900">\${{ item.product.price }}</p>
                        </div>
                      </div>

                      <div class="flex-1 pt-2 flex items-end justify-between">
                        <p class="text-sm text-gray-500">Qty {{ item.quantity }}</p>
                        <div class="flex">
                          <button type="button" (click)="removeItem(item.product.id)" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>

                <dl class="border-t border-gray-200 py-6 px-4 space-y-6 sm:px-6">
                  <div class="flex items-center justify-between">
                    <dt class="text-sm">Subtotal</dt>
                    <dd class="text-sm font-medium text-gray-900">\${{ cartService.cartTotalPrice() }}</dd>
                  </div>
                  <div class="flex items-center justify-between">
                    <dt class="text-sm">Shipping</dt>
                    <dd class="text-sm font-medium text-gray-900">Free</dd>
                  </div>
                  <div class="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt class="text-base font-medium">Total</dt>
                    <dd class="text-base font-medium text-gray-900">\${{ cartService.cartTotalPrice() }}</dd>
                  </div>
                </dl>

                <div class="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <button type="submit" [disabled]="isSubmitting || cartService.cartItems().length === 0"
                    class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 disabled:opacity-50">
                    {{ isSubmitting ? 'Processing...' : 'Confirm Order' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isSubmitting = false;

  ngOnInit() {
    if (this.cartService.cartItems().length === 0) {
      this.toastService.warning('Cart is empty', 'Please add items to your cart before checkout.');
      this.router.navigate(['/cart']);
    }
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.cartService.cartItems().length === 0) return;

    this.isSubmitting = true;

    const request: OrderRequest = {
      items: this.cartService.cartItems().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.orderService.checkout(request).subscribe({
      next: (response) => {
        this.cartService.clearCart();
        this.toastService.success('Order Placed', 'Your order has been successfully placed.');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastService.error('Order Failed', error.error?.message || 'Failed to place order.');
      }
    });
  }
}
