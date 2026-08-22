import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      <div *ngIf="cartService.cartItems().length === 0" class="bg-white p-10 text-center rounded-lg shadow-sm border border-gray-100">
        <svg class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p class="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <a routerLink="/catalog" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          Start Shopping
        </a>
      </div>

      <div *ngIf="cartService.cartItems().length > 0" class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        
        <!-- Cart Items -->
        <section aria-labelledby="cart-heading" class="lg:col-span-8">
          <h2 id="cart-heading" class="sr-only">Items in your shopping cart</h2>

          <ul role="list" class="border-t border-b border-gray-200 divide-y divide-gray-200">
            <li *ngFor="let item of cartService.cartItems()" class="flex py-6 sm:py-10">
              <div class="flex-shrink-0">
                <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-md flex items-center justify-center">
                  <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div class="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div class="flex justify-between">
                      <h3 class="text-sm">
                        <a [routerLink]="['/product', item.product.slug]" class="font-medium text-gray-700 hover:text-gray-800">
                          {{ item.product.name }}
                        </a>
                      </h3>
                    </div>
                    <div class="mt-1 flex text-sm">
                      <p class="text-gray-500">{{ item.product.category?.name }}</p>
                    </div>
                    <p class="mt-1 text-sm font-medium text-gray-900">\${{ item.product.price }}</p>
                  </div>

                  <div class="mt-4 sm:mt-0 sm:pr-9">
                    <label [for]="'quantity-' + item.product.id" class="sr-only">Quantity</label>
                    <select [id]="'quantity-' + item.product.id" [name]="'quantity-' + item.product.id" 
                      [value]="item.quantity" (change)="updateQuantity(item.product.id, $event)"
                      class="max-w-full rounded-md border border-gray-300 py-1.5 text-base leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option *ngFor="let num of [1,2,3,4,5,6,7,8,9,10]" [value]="num">{{ num }}</option>
                    </select>

                    <div class="absolute top-0 right-0">
                      <button type="button" (click)="removeItem(item.product.id)" class="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500">
                        <span class="sr-only">Remove</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <p class="mt-4 flex text-sm text-gray-700 space-x-2">
                  <svg class="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span>In stock</span>
                </p>
              </div>
            </li>
          </ul>
        </section>

        <!-- Order Summary -->
        <section aria-labelledby="summary-heading" class="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-4">
          <h2 id="summary-heading" class="text-lg font-medium text-gray-900">Order summary</h2>

          <dl class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-600">Subtotal</dt>
              <dd class="text-sm font-medium text-gray-900">\${{ cartService.cartTotalPrice() }}</dd>
            </div>
            <div class="border-t border-gray-200 pt-4 flex items-center justify-between">
              <dt class="flex items-center text-sm text-gray-600">
                <span>Shipping estimate</span>
              </dt>
              <dd class="text-sm font-medium text-gray-900">Free</dd>
            </div>
            <div class="border-t border-gray-200 pt-4 flex items-center justify-between">
              <dt class="flex text-sm text-gray-600">
                <span>Tax estimate</span>
              </dt>
              <dd class="text-sm font-medium text-gray-900">Calculated at checkout</dd>
            </div>
            <div class="border-t border-gray-200 pt-4 flex items-center justify-between">
              <dt class="text-base font-medium text-gray-900">Order total</dt>
              <dd class="text-base font-medium text-gray-900">\${{ cartService.cartTotalPrice() }}</dd>
            </div>
          </dl>

          <div class="mt-6">
            <a routerLink="/checkout" class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 text-center block">
              Checkout
            </a>
          </div>
        </section>
      </div>
    </div>
  `
})
export class CartComponent {
  public cartService = inject(CartService);

  updateQuantity(productId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const quantity = parseInt(selectElement.value, 10);
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }
}
